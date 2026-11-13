// Vistas buscar y destino: búsqueda por texto con sugerencias, por voz, por categoría y cerca de mí,
// "Sin resultados" y ficha del destino con "Guardar en favoritos".
// Mientras no se busca nada, el inicio muestra las rutas recientes en lugar de resultados.

import { cargarDatos, buscarDestino, buscarCategoria, normalizar } from '../../../compartido/servicios/datos.js';
import { anunciar } from '../../../compartido/servicios/anuncios.js';
import { clonar, llenar } from '../../../compartido/componentes/plantillas.js';
import { dibujarMapa } from '../../../compartido/mapa/dibujar.js';
import { buscarRuta } from '../../../compartido/mapa/a-estrella.js';
import { obtenerUbicacion } from '../../servicios/ubicacion.js';
import { decir, escuchar, puedeEscuchar, detenerEscucha } from '../../servicios/voz.js';
import { esFavorito, agregarFavorito, quitarFavorito, recientes, fechaCorta } from '../../servicios/rutas-guardadas.js';

const MINIMO_CARACTERES = 3; // CA081: sugerencias a partir del tercer carácter
const MAX_RECIENTES_INICIO = 5;

let datos = { categorias: [], destinos: [] };
const estado = { consulta: '', categoria: null };

const $ = (selector, raiz = document) => raiz.querySelector(selector);

/** "Edificio B · Piso 3 · 120 m" (sin metros si no se conoce la ubicación). */
function detalleDe(d) {
  return [d.edificio, d.piso, d.distancia !== null ? `${d.distancia} m` : null].filter(Boolean).join(' · ');
}

function filaResultado(d, detalle = detalleDe(d)) {
  const fila = clonar('resultado', { icono: d.icono, nombre: d.nombre, detalle });
  fila.querySelector('a').href = `#destino/${encodeURIComponent(d.id)}`;
  return fila;
}

/* ===== Resultados (W1, M2 y 3.2) ===== */

function filtrar() {
  let lista = datos.destinos;
  if (estado.categoria) lista = lista.filter((d) => d.categoria === estado.categoria);
  const consulta = normalizar(estado.consulta);
  if (consulta.length >= MINIMO_CARACTERES) {
    lista = lista.filter((d) => {
      const texto = normalizar(`${d.nombre} ${d.edificio} ${buscarCategoria(datos, d.categoria)?.nombre ?? ''}`);
      return texto.includes(consulta);
    });
  }
  return [...lista].sort((a, b) => (a.distancia ?? Infinity) - (b.distancia ?? Infinity) || a.nombre.localeCompare(b.nombre));
}

/** W1: en escritorio, la tarjeta del mapa muestra el primer resultado (o la ruta más reciente). */
function mostrarDestinoElegido(d) {
  const tarjeta = $('[data-mensaje="destino-elegido"]');
  tarjeta.hidden = !d;
  if (!d) {
    dibujarMapa($('#vista-buscar .mapa-lienzo'), datos.mapa, { piso: 1, encuadrar: false });
    llenar($('#vista-buscar .tarjeta-mapa'), { 'mapa-descripcion': 'Mapa de todo el campus.' });
    return;
  }
  llenar(tarjeta, { 'destino-nombre': d.nombre, 'destino-detalle': [detalleDe(d), d.tiempo ? `${d.tiempo} min` : null].filter(Boolean).join(' · ') });
  dibujarMapa($('#vista-buscar .mapa-lienzo'), datos.mapa, { piso: 1, destacar: d.edificioId, encuadrar: false });
  $('[data-accion="ver-detalle"]', tarjeta).href = `#destino/${encodeURIComponent(d.id)}`;
  llenar($('#vista-buscar .tarjeta-mapa'), { 'mapa-descripcion': `${d.nombre} está en el ${d.edificio}, ${d.piso.toLowerCase()}.` });
}

/** Hay búsqueda cuando se escribió lo suficiente o se eligió una categoría. */
function hayBusqueda() {
  return Boolean(estado.categoria) || normalizar(estado.consulta).length >= MINIMO_CARACTERES;
}

/** Inicio sin búsqueda: rutas recientes, o un mensaje si todavía no hay ninguna. */
function mostrarRecientes() {
  const filas = recientes()
    .map((r) => [r, buscarDestino(datos, r.id)])
    .filter(([, d]) => d)
    .slice(0, MAX_RECIENTES_INICIO);
  $('[data-lista="recientes-inicio"]').replaceChildren(
    ...filas.map(([r, d]) => filaResultado(d, `${fechaCorta(r.fecha)} · ${d.edificio} · ${d.piso}`)),
  );
  $('[data-lista="recientes-inicio"]').hidden = filas.length === 0;
  $('[data-mensaje="sin-recientes-inicio"]').hidden = filas.length > 0;
  mostrarDestinoElegido(filas[0]?.[1]);
}

function mostrarResultados({ anunciarConteo = false } = {}) {
  const buscando = hayBusqueda();
  $('[data-mensaje="recientes-inicio"]').hidden = buscando;
  $('[data-mensaje="resultados"]').hidden = !buscando;
  if (!buscando) {
    if (anunciarConteo) $('[data-dato="conteo-resultados"]').textContent = '';
    mostrarRecientes();
    return;
  }
  const lista = filtrar();
  const ul = $('[data-lista="resultados"]');
  ul.replaceChildren(...lista.map((d) => filaResultado(d)));
  ul.querySelector('.item-lista')?.setAttribute('aria-current', 'true');
  mostrarDestinoElegido(lista[0]);

  const cat = buscarCategoria(datos, estado.categoria);
  $('[data-mensaje="filtro-categoria"]').hidden = !cat;
  if (cat) llenar($('[data-mensaje="filtro-categoria"]'), { 'categoria-nombre': cat.nombre });

  $('[data-mensaje="sin-resultados"]').hidden = lista.length > 0;
  const conteo = lista.length === 0 ? 'Sin resultados' : lista.length === 1 ? '1 resultado' : `${lista.length} resultados`;
  // El conteo está en una región aria-live (CA083); solo se actualiza cuando la persona busca
  if (anunciarConteo) $('[data-dato="conteo-resultados"]').textContent = conteo;
}

/* ===== 3.1 · Búsqueda por voz ===== */

const NUMEROS = { cero: '0', uno: '1', una: '1', dos: '2', tres: '3', cuatro: '4', cinco: '5', seis: '6', siete: '7', ocho: '8', nueve: '9' };

/** "Aula B tres cero dos" y "aula b-302" quedan iguales: "aulab302". */
function compactar(texto) {
  return normalizar(texto)
    .split(/\s+/)
    .map((palabra) => NUMEROS[palabra] ?? palabra)
    .join('')
    .replace(/[^a-z0-9]/g, '');
}

function coincidenciasPorVoz(alternativas) {
  const dichas = alternativas.map(compactar).filter(Boolean);
  return datos.destinos.filter((d) => {
    const nombre = compactar(d.nombre);
    return dichas.some((dicho) => nombre.includes(dicho) || dicho.includes(nombre));
  });
}

async function buscarPorVoz() {
  const parte = $('[data-parte="voz"]');
  const estadoTexto = $('[data-dato="escucha-estado"]', parte);
  const tarjeta = $('[data-mensaje="transcripcion"]', parte);
  const reintentar = $('[data-accion="escuchar-de-nuevo"]', parte);
  tarjeta.hidden = true;
  // Mientras escucha no se puede repetir; al terminar, el botón siempre aparece
  reintentar.hidden = true;

  if (!puedeEscuchar()) {
    estadoTexto.textContent = 'Este navegador no permite buscar por voz. Usa «Escribir en su lugar» o prueba con Chrome.';
    return;
  }
  estadoTexto.textContent = 'Escuchando…';
  let alternativas = [];
  try {
    alternativas = await escuchar();
  } catch {
    estadoTexto.textContent = 'No pudimos usar el micrófono. Revisa el permiso o escribe el destino.';
    reintentar.hidden = false;
    return;
  }
  // La persona salió de la búsqueda por voz mientras se escuchaba
  if (parte.hidden) return;

  if (!alternativas.length) {
    estadoTexto.textContent = 'No te entendí. Vuelve a intentarlo o escribe el destino.';
    reintentar.hidden = false;
    decir(estadoTexto.textContent);
    return;
  }

  const encontrados = coincidenciasPorVoz(alternativas);
  llenar(tarjeta, { transcripcion: `«${alternativas[0]}»` });
  const filas = encontrados.map((d) => {
    const fila = clonar('sugerencia-voz', { icono: d.icono, nombre: d.nombre, detalle: `${d.edificio} · ${d.piso}` });
    const enlace = fila.querySelector('a');
    enlace.href = `#destino/${encodeURIComponent(d.id)}`;
    enlace.setAttribute('aria-label', `Sí, ir a ${d.nombre}`);
    return fila;
  });
  $('[data-lista="sugerencias-voz"]', parte).replaceChildren(...filas);
  tarjeta.hidden = false;
  // Aunque encuentre el destino, se puede buscar otra vez por voz (no solo escribiendo)
  reintentar.hidden = false;
  reintentar.classList.toggle('boton-principal', encontrados.length === 0);
  reintentar.classList.toggle('boton-secundario', encontrados.length > 0);

  // CA079: varios resultados se anuncian como lista; CA080: si no hay, se ofrece repetir o escribir
  estadoTexto.textContent = encontrados.length === 0
    ? 'No encontré ese destino. Vuelve a intentarlo o escribe el destino.'
    : encontrados.length === 1
      ? `¿Quisiste decir ${encontrados[0].nombre}?`
      : `Encontré ${encontrados.length} lugares: ${encontrados.map((d) => d.nombre).join(', ')}.`;
  decir(estadoTexto.textContent);
}

/* ===== 3.3 · Categorías (las registradas en los datos) ===== */

function mostrarCategorias() {
  const ul = $('[data-lista="categorias"]');
  const filas = datos.categorias.map((c) => {
    const fila = clonar('categoria', { icono: c.icono, nombre: c.nombre });
    fila.querySelector('button').dataset.categoria = c.id;
    return fila;
  });
  ul.replaceChildren(...filas);
  ul.hidden = filas.length === 0;
  $('[data-mensaje="sin-categorias"]').hidden = filas.length > 0;
}

/* ===== 3.4 · Cerca de mí ===== */

function mostrarCerca() {
  const parte = $('[data-parte="cerca"]');
  const ubicacion = obtenerUbicacion(datos);
  const tarjeta = $('.ubicacion', parte);
  const cercanos = $('[data-lista="cercanos"]', parte).closest('section');
  tarjeta.hidden = !ubicacion;
  cercanos.hidden = !ubicacion;
  $('[data-mensaje="sin-ubicacion"]', parte).hidden = Boolean(ubicacion);
  if (!ubicacion) return;

  llenar(tarjeta, { 'ubicacion-actual': ubicacion.texto });
  const filas = ubicacion.cercanos
    .map(({ id, detalle }) => [buscarDestino(datos, id), detalle])
    .filter(([d]) => d)
    .map(([d, detalle]) => filaResultado(d, detalle));
  $('[data-lista="cercanos"]', parte).replaceChildren(...filas);
}

/* ===== W2 / 3.5 · Información del destino ===== */

let destinoActual = null;

function actualizarBotonFavorito(seccion) {
  const boton = $('[data-accion="guardar-favorito"]', seccion);
  const guardado = esFavorito(destinoActual.id);
  boton.setAttribute('aria-pressed', String(guardado));
  boton.lastChild.textContent = guardado ? ' Quitar de favoritos' : ' Guardar en favoritos';
}

function mostrarDestino(seccion, id) {
  const d = buscarDestino(datos, id);
  if (!d) {
    // Sin destino válido (#destino sin id o id inexistente): volver a la búsqueda
    location.replace('#buscar');
    return;
  }
  destinoActual = d;
  llenar(seccion, {
    'destino-nombre': d.nombre,
    'destino-icono': d.icono,
    'destino-ubicacion': `${d.edificio} · ${d.piso}`,
    'destino-distancia': d.distancia !== null ? `${d.distancia} m` : 'Sin ubicación',
    'destino-tiempo': d.tiempo !== null ? `${d.tiempo} min` : 'Sin ubicación',
    'destino-acceso': d.acceso,
    'destino-riesgos': d.zonasRiesgo,
    'mapa-descripcion': d.distancia !== null
      ? `${d.nombre}, ${d.edificio}, ${d.piso.toLowerCase()}, a ${d.distancia} m de tu ubicación.`
      : `${d.nombre}, ${d.edificio}, ${d.piso.toLowerCase()}.`,
  });
  const riesgo = $('[data-mensaje="riesgo"]', seccion);
  riesgo.hidden = !d.riesgo;
  if (d.riesgo) llenar(riesgo, { 'riesgo-titulo': d.riesgo.titulo, 'riesgo-texto': d.riesgo.texto });

  $('[data-accion="iniciar-ruta"]', seccion).href = `#guia/${encodeURIComponent(d.id)}`;
  $('[data-accion="ver-ruta"]', seccion).href = `#ruta/${encodeURIComponent(d.id)}`;
  actualizarBotonFavorito(seccion);
  // W2: el mapa muestra el piso del destino y la ruta; con los botones se ven los otros pisos de la ruta
  const ruta = buscarRuta(datos.grafo, datos.origen, d.nodo);
  const nodos = (ruta?.nodos ?? []).map((id) => datos.grafo.nodos.get(id));
  dibujarMapa($('.mapa-lienzo', seccion), datos.mapa, {
    piso: d.pisoNumero,
    pisos: [d.pisoNumero, ...nodos.map((n) => n.piso)],
    destacar: d.id,
    ruta: nodos,
  });
}

/* ===== Conexión con el router ===== */

export async function iniciar() {
  datos = await cargarDatos();

  const formulario = $('[data-formulario="busqueda"]');
  const campo = $('#busqueda');

  campo.addEventListener('input', () => {
    estado.consulta = campo.value;
    mostrarResultados({ anunciarConteo: normalizar(campo.value).length >= MINIMO_CARACTERES });
  });

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    estado.consulta = campo.value;
    mostrarResultados({ anunciarConteo: true });
    if (location.hash !== '#buscar') location.hash = '#buscar';
  });

  formulario.addEventListener('reset', () => {
    estado.consulta = '';
    // El reset vacía el campo después de este evento
    setTimeout(() => {
      mostrarResultados({ anunciarConteo: true });
      campo.focus();
    });
  });

  $('#vista-buscar').addEventListener('click', (evento) => {
    const elegir = evento.target.closest('[data-accion="elegir-categoria"]');
    if (elegir) {
      estado.categoria = elegir.dataset.categoria;
      location.hash = '#buscar';
      return;
    }
    if (evento.target.closest('[data-accion="quitar-categoria"]')) {
      estado.categoria = null;
      mostrarResultados({ anunciarConteo: true });
      campo.focus();
      return;
    }
    if (evento.target.closest('[data-accion="repetir-ubicacion"]')) {
      const ubicacion = obtenerUbicacion(datos);
      if (ubicacion) decir(`Estás en ${ubicacion.texto.replaceAll('·', ',')}`, { forzar: true });
      return;
    }
    if (evento.target.closest('[data-accion="escuchar-de-nuevo"]')) {
      buscarPorVoz();
      return;
    }
    if (evento.target.closest('[data-accion="escribir-en-su-lugar"]')) {
      detenerEscucha();
      // El router vuelve a #buscar; después se pone el foco en el campo
      setTimeout(() => campo.focus(), 50);
    }
  });

  $('#vista-destino').addEventListener('click', (evento) => {
    if (!evento.target.closest('[data-accion="guardar-favorito"]') || !destinoActual) return;
    const seccion = $('#vista-destino');
    if (esFavorito(destinoActual.id)) {
      quitarFavorito(destinoActual.id);
      anunciar(`${destinoActual.nombre} se quitó de tus favoritos.`);
    } else {
      agregarFavorito(destinoActual.id, destinoActual.nombre);
      anunciar(`${destinoActual.nombre} se guardó en tus favoritos.`);
    }
    actualizarBotonFavorito(seccion);
  });
}

export function mostrar({ vista, parte, seccion }) {
  if (vista === 'destino') {
    mostrarDestino(seccion, parte);
    return;
  }
  if (parte !== 'voz') detenerEscucha();
  if (parte === 'categorias') mostrarCategorias();
  else if (parte === 'cerca') mostrarCerca();
  else if (parte === 'voz') buscarPorVoz();
  else mostrarResultados({ anunciarConteo: Boolean(estado.categoria) });
}
