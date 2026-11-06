// Vistas buscar y destino: búsqueda por texto con sugerencias, categorías, cerca de mí,
// "Sin resultados" y ficha del destino. La búsqueda por voz (3.1) se completa en la fase 4.

import { obtenerUbicacion } from '../../servicios/ubicacion.js';
import { decir } from '../../servicios/voz.js';

const URL_DATOS = new URL('../../../compartido/datos/destinos.json', import.meta.url);
const MINIMO_CARACTERES = 3; // CA081: sugerencias a partir del tercer carácter

let datos = { categorias: [], destinos: [] };
const estado = { consulta: '', categoria: null };

const $ = (selector, raiz = document) => raiz.querySelector(selector);

/** Minúsculas y sin tildes, para que "secretaria" encuentre "Secretaría" (CA082). */
function normalizar(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

function categoria(id) {
  return datos.categorias.find((c) => c.id === id) ?? null;
}

function destino(id) {
  return datos.destinos.find((d) => d.id === id) ?? null;
}

/** Clona una plantilla y llena sus [data-dato]. */
function clonar(nombre, valores) {
  const copia = document.querySelector(`template[data-plantilla="${nombre}"]`).content.cloneNode(true);
  for (const [clave, valor] of Object.entries(valores)) {
    for (const el of copia.querySelectorAll(`[data-dato="${clave}"]`)) el.textContent = valor;
  }
  return copia;
}

function llenar(raiz, valores) {
  for (const [clave, valor] of Object.entries(valores)) {
    for (const el of raiz.querySelectorAll(`[data-dato="${clave}"]`)) el.textContent = valor;
  }
}

function filaResultado(d, detalle = `${d.edificio} · ${d.piso} · ${d.distancia} m`) {
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
      const texto = normalizar(`${d.nombre} ${d.edificio} ${categoria(d.categoria)?.nombre ?? ''}`);
      return texto.includes(consulta);
    });
  }
  return [...lista].sort((a, b) => a.distancia - b.distancia);
}

function mostrarResultados({ anunciarConteo = false } = {}) {
  const lista = filtrar();
  const ul = $('[data-lista="resultados"]');
  ul.replaceChildren(...lista.map((d) => filaResultado(d)));

  const cat = categoria(estado.categoria);
  $('[data-mensaje="filtro-categoria"]').hidden = !cat;
  if (cat) llenar($('[data-mensaje="filtro-categoria"]'), { 'categoria-nombre': cat.nombre });

  $('[data-mensaje="sin-resultados"]').hidden = lista.length > 0;
  const conteo = lista.length === 0 ? 'Sin resultados' : lista.length === 1 ? '1 resultado' : `${lista.length} resultados`;
  // El conteo está en una región aria-live (CA083); solo se actualiza cuando la persona busca
  if (anunciarConteo) $('[data-dato="conteo-resultados"]').textContent = conteo;
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
    .map(({ id, detalle }) => [destino(id), detalle])
    .filter(([d]) => d)
    .map(([d, detalle]) => filaResultado(d, detalle));
  $('[data-lista="cercanos"]', parte).replaceChildren(...filas);
}

/* ===== W2 / 3.5 · Información del destino ===== */

function mostrarDestino(seccion, id) {
  const d = destino(id);
  if (!d) {
    // Sin destino válido (#destino sin id o id inexistente): volver a la búsqueda
    location.replace('#buscar');
    return;
  }
  llenar(seccion, {
    'destino-nombre': d.nombre,
    'destino-icono': d.icono,
    'destino-ubicacion': `${d.edificio} · ${d.piso}`,
    'destino-distancia': `${d.distancia} m`,
    'destino-tiempo': `${d.tiempo} min`,
    'destino-acceso': d.acceso,
    'destino-riesgos': d.zonasRiesgo,
    'mapa-descripcion': `${d.nombre}, ${d.edificio}, a ${d.distancia} m de tu ubicación.`,
  });
  const riesgo = $('[data-mensaje="riesgo"]', seccion);
  riesgo.hidden = !d.riesgo;
  if (d.riesgo) llenar(riesgo, { 'riesgo-titulo': d.riesgo.titulo, 'riesgo-texto': d.riesgo.texto });

  $('[data-accion="iniciar-ruta"]', seccion).href = `#guia/${encodeURIComponent(d.id)}`;
  $('[data-accion="ver-ruta"]', seccion).href = `#ruta/${encodeURIComponent(d.id)}`;
}

/* ===== Conexión con el router ===== */

export async function iniciar() {
  try {
    const respuesta = await fetch(URL_DATOS);
    if (respuesta.ok) datos = await respuesta.json();
  } catch {
    // Sin datos: la búsqueda muestra "Sin resultados" y las categorías su mensaje
  }

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

  document.addEventListener('click', (evento) => {
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
      if (ubicacion) decir(`Estás en ${ubicacion.texto.replaceAll('·', ',')}`);
    }
  });
}

export function mostrar({ vista, parte, seccion }) {
  if (vista === 'destino') {
    mostrarDestino(seccion, parte);
    return;
  }
  if (parte === 'categorias') mostrarCategorias();
  else if (parte === 'cerca') mostrarCerca();
  else mostrarResultados({ anunciarConteo: Boolean(estado.categoria) });
}
