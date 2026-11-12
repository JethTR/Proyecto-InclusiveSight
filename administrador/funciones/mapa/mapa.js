// Mapa del campus (9.5): cargar el mapa GeoJSON, exportarlo, volver al del repositorio,
// ver los edificios y pisos con sus destinos, y probar el cálculo de rutas (A*).

import { cargarCampus, guardarCampus, restablecerCampus, exportarMapa, hayCambiosGuardados } from '../../../compartido/servicios/campus.js';
import { anunciar } from '../../../compartido/servicios/anuncios.js';
import { minutos } from '../../../compartido/servicios/datos.js';
import { validarMapa, elementos, buscarElemento } from '../../../compartido/mapa/geojson.js';
import { construirGrafo, nodoDe } from '../../../compartido/mapa/grafo.js';
import { buscarRuta } from '../../../compartido/mapa/a-estrella.js';
import { dibujarMapa } from '../../../compartido/mapa/dibujar.js';
import { abrirDialogo } from '../../../compartido/componentes/dialogo.js';
import { clonar, llenar } from '../../../compartido/componentes/plantillas.js';
import { avisarCambio } from '../../servicios/estado-puntos.js';

const NOMBRES_RESUMEN = {
  edificio: 'Edificios',
  pasillo: 'Pasillos',
  escalera: 'Escaleras',
  ascensor: 'Ascensores',
  destino: 'Destinos',
  punto: 'Puntos de referencia',
};
const MAX_ERRORES = 10;

let campus = null;
let seleccion = { edificio: undefined, piso: 1 }; // undefined: todavía no se eligió (se muestra el primer edificio)
let rutaProbada = null;

const $ = (selector, raiz = document) => raiz.querySelector(selector);
const seccion = () => $('#vista-mapa');

/* ===== Archivo del mapa ===== */

function pintarArchivo() {
  const { resumen } = validarMapa(campus.mapa);
  llenar(seccion(), {
    'origen-mapa': hayCambiosGuardados()
      ? 'Mapa guardado en este navegador. Expórtalo para publicarlo en el repositorio.'
      : 'Mapa de ejemplo del repositorio (compartido/datos/campus.geojson).',
  });
  const filas = Object.entries(NOMBRES_RESUMEN).flatMap(([tipo, nombre]) => {
    const dt = document.createElement('dt');
    dt.textContent = nombre;
    const dd = document.createElement('dd');
    dd.textContent = String(resumen[tipo] ?? 0);
    const fila = document.createElement('div');
    fila.className = 'dato';
    fila.append(dt, dd);
    return fila;
  });
  $('[data-lista="resumen-mapa"]').replaceChildren(...filas);
}

async function cargarArchivo(evento) {
  evento.preventDefault();
  const archivo = $('#archivo-mapa').files[0];
  const errores = $('[data-mensaje="errores-mapa"]');
  const listo = $('[data-mensaje="mapa-cargado"]');
  errores.hidden = true;
  listo.hidden = true;
  if (!archivo) {
    mostrarErrores(['Elige un archivo .geojson o .json.']);
    return;
  }

  let mapa;
  try {
    mapa = JSON.parse(await archivo.text());
  } catch {
    mostrarErrores(['El archivo no es un JSON válido.']);
    return;
  }
  const { errores: lista, resumen } = validarMapa(mapa);
  if (lista.length) {
    mostrarErrores(lista);
    return;
  }

  // Los puntos ya registrados que no vienen en el archivo se conservan
  const enArchivo = new Set(elementos(mapa, 'punto').map((p) => p.properties.id));
  const conservados = elementos(campus.mapa, 'punto').filter((p) => !enArchivo.has(p.properties.id));
  mapa.features.push(...conservados);

  campus.mapa = mapa;
  guardarCampus(campus, { evento: 'Mapa cargado', detalle: archivo.name });
  avisarCambio();
  $('#archivo-mapa').value = '';
  listo.textContent = `Mapa cargado: ${resumen.edificio} edificios, ${resumen.pasillo} pasillos, ${resumen.destino} destinos y ${resumen.punto + conservados.length} puntos de referencia. La app del estudiante ya usa este mapa.`;
  listo.hidden = false;
  seleccion = { edificio: undefined, piso: 1 };
  pintarTodo();
}

function mostrarErrores(lista) {
  const errores = $('[data-mensaje="errores-mapa"]');
  const filas = lista.slice(0, MAX_ERRORES).map((texto) => {
    const li = document.createElement('li');
    li.textContent = texto;
    return li;
  });
  if (lista.length > MAX_ERRORES) {
    const li = document.createElement('li');
    li.textContent = `Y ${lista.length - MAX_ERRORES} errores más.`;
    filas.push(li);
  }
  $('[data-lista="errores-mapa"]').replaceChildren(...filas);
  errores.hidden = false;
}

async function restablecer(boton) {
  const respuesta = await abrirDialogo($('#dialogo-restablecer'), boton);
  if (respuesta !== 'restablecer') return;
  restablecerCampus();
  campus = await cargarCampus();
  avisarCambio();
  seleccion = { edificio: undefined, piso: 1 };
  pintarTodo();
  anunciar('Se restableció el mapa del repositorio.');
}

/* ===== Edificios, pisos y destinos ===== */

function pintarArbol() {
  const items = [];
  const boton = (edificio, piso, texto) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'arbol-piso';
    b.dataset.edificio = edificio ?? '';
    b.dataset.piso = String(piso);
    b.setAttribute('aria-pressed', String((seleccion.edificio ?? '') === (edificio ?? '') && seleccion.piso === piso));
    b.innerHTML = '<span class="icono material-symbols-rounded" aria-hidden="true">layers</span> ';
    b.append(texto);
    return b;
  };
  for (const edificio of elementos(campus.mapa, 'edificio')) {
    const li = document.createElement('li');
    const titulo = document.createElement('p');
    titulo.className = 'arbol-edificio';
    titulo.innerHTML = '<span class="icono material-symbols-rounded" aria-hidden="true">apartment</span> ';
    titulo.append(edificio.properties.nombre);
    const ul = document.createElement('ul');
    for (const piso of edificio.properties.pisos) {
      const item = document.createElement('li');
      item.append(boton(edificio.properties.id, piso, `Piso ${piso}`));
      ul.append(item);
    }
    li.append(titulo, ul);
    items.push(li);
  }
  const exteriores = document.createElement('li');
  exteriores.append(boton(null, 1, 'Exteriores'));
  items.push(exteriores);
  $('[data-lista="edificios"]').replaceChildren(...items);
}

function pintarPiso() {
  const { edificio, piso } = seleccion;
  const nombre = edificio ? buscarElemento(campus.mapa, 'edificio', edificio)?.properties.nombre : 'Exteriores';
  const titulo = edificio ? `${nombre} · Piso ${piso}` : 'Exteriores';
  const destinos = elementos(campus.mapa, 'destino')
    .filter((d) => (d.properties.edificio ?? null) === edificio && d.properties.piso === piso);
  const filas = destinos.map((d) => {
    const categoria = campus.categorias.find((c) => c.id === d.properties.categoria);
    const detalle = [categoria?.nombre, d.properties.punto ? `Punto ${d.properties.punto}` : null].filter(Boolean).join(' · ');
    return clonar('destino-piso', { icono: categoria?.icono ?? 'location_on', nombre: d.properties.nombre, detalle });
  });
  $('[data-lista="destinos-piso"]').replaceChildren(...filas);
  $('[data-mensaje="sin-destinos"]').hidden = filas.length > 0;
  llenar(seccion(), {
    'titulo-piso': `Destinos en ${titulo}`,
    'titulo-mapa-piso': titulo,
    'mapa-piso-descripcion': `${titulo}: ${filas.length} destinos y ${elementos(campus.mapa, 'punto').filter((p) => p.properties.piso === piso).length} puntos de referencia en este piso.`,
  });
  dibujarMapa($('[data-mapa="piso"]'), campus.mapa, {
    piso,
    destacar: edificio,
    puntos: true,
    ruta: rutaProbada?.nodos.filter((n) => n.piso === piso) ?? [],
  });
}

/* ===== Probar una ruta (A*) ===== */

function opcionesRuta() {
  const desde = elementos(campus.mapa, 'punto').filter((p) => p.properties.activo !== false)
    .map((p) => new Option(`${p.properties.id} · ${p.properties.referencia}`, p.properties.id));
  const hasta = elementos(campus.mapa, 'destino').map((d) => new Option(d.properties.nombre, d.properties.id));
  $('#ruta-desde').replaceChildren(...desde);
  $('#ruta-hasta').replaceChildren(...hasta);
}

function probarRuta(evento) {
  evento.preventDefault();
  const resultado = $('[data-mensaje="resultado-ruta"]');
  const punto = buscarElemento(campus.mapa, 'punto', $('#ruta-desde').value);
  const destino = buscarElemento(campus.mapa, 'destino', $('#ruta-hasta').value);
  if (!punto || !destino) {
    resultado.textContent = 'Elige un punto de partida y un destino.';
    resultado.hidden = false;
    return;
  }
  const grafo = construirGrafo(campus.mapa);
  const evitarEscaleras = evento.currentTarget.elements['evitar-escaleras'].checked;
  const camino = buscarRuta(grafo, nodoDe(grafo, punto), nodoDe(grafo, destino), { evitarEscaleras });
  if (!camino) {
    rutaProbada = null;
    resultado.textContent = evitarEscaleras
      ? 'No hay una ruta sin escaleras entre estos puntos.'
      : 'No hay camino entre estos puntos: revisa que los pasillos estén conectados.';
  } else {
    rutaProbada = { nodos: camino.nodos.map((id) => grafo.nodos.get(id)) };
    const escaleras = camino.vias.filter((v) => v === 'escalera').length;
    const ascensor = camino.vias.includes('ascensor');
    const partes = [`${Math.round(camino.distancia)} m`, `unos ${minutos(camino.distancia)} min`];
    if (escaleras) partes.push(`${escaleras} escalera${escaleras > 1 ? 's' : ''}`);
    if (ascensor) partes.push('usa ascensor');
    resultado.textContent = `Ruta más corta (A*): ${partes.join(' · ')}.`;
    // El mapa muestra el piso donde empieza la ruta
    seleccion = { edificio: punto.properties.edificio ?? null, piso: punto.properties.piso };
    pintarArbol();
  }
  resultado.hidden = false;
  pintarPiso();
}

/* ===== Conexión con el router ===== */

function pintarTodo() {
  if (seleccion.edificio === undefined) {
    const primero = elementos(campus.mapa, 'edificio')[0];
    if (primero) seleccion = { edificio: primero.properties.id, piso: primero.properties.pisos[0] };
  }
  pintarArchivo();
  pintarArbol();
  opcionesRuta();
  rutaProbada = null;
  $('[data-mensaje="resultado-ruta"]').hidden = true;
  pintarPiso();
}

export function iniciar() {
  $('[data-formulario="cargar-mapa"]').addEventListener('submit', cargarArchivo);
  $('[data-formulario="probar-ruta"]').addEventListener('submit', probarRuta);
  seccion().addEventListener('click', (evento) => {
    const piso = evento.target.closest('.arbol-piso');
    if (piso) {
      seleccion = { edificio: piso.dataset.edificio || null, piso: Number(piso.dataset.piso) };
      pintarArbol();
      pintarPiso();
      seccion().querySelector(`.arbol-piso[data-edificio="${piso.dataset.edificio}"][data-piso="${piso.dataset.piso}"]`)?.focus();
      return;
    }
    if (evento.target.closest('[data-accion="exportar-mapa"]')) {
      exportarMapa(campus);
      anunciar('Se descargó campus.geojson.');
      return;
    }
    const restablecerBoton = evento.target.closest('[data-accion="restablecer-mapa"]');
    if (restablecerBoton) restablecer(restablecerBoton);
  });
}

export async function mostrar() {
  campus = await cargarCampus();
  pintarTodo();
}
