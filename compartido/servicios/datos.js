// Datos del campus para la app del estudiante, armados a partir del mapa GeoJSON (compartido/servicios/campus.js).
// La distancia, el tiempo, el acceso y las escaleras de cada destino se calculan con A* desde la ubicación actual.
// Se arman una sola vez por página y se comparten entre todas las funciones.

import { cargarCampus } from './campus.js';
import { elementos, buscarElemento } from '../mapa/geojson.js';
import { construirGrafo, nodoDe } from '../mapa/grafo.js';
import { buscarRuta } from '../mapa/a-estrella.js';

const METROS_POR_MINUTO = 60; // paso tranquilo, ~1 m/s

let carga = null;

export function cargarDatos() {
  carga ??= cargarCampus().then(armarDatos);
  return carga;
}

/** Minúsculas y sin tildes, para comparar textos ("secretaria" encuentra "Secretaría"). */
export function normalizar(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

export function buscarDestino(datos, id) {
  return datos.destinos.find((d) => d.id === id) ?? null;
}

export function buscarCategoria(datos, id) {
  return datos.categorias.find((c) => c.id === id) ?? null;
}

export function minutos(metros) {
  return Math.max(1, Math.round(metros / METROS_POR_MINUTO));
}

function contar(vias, via) {
  return vias.filter((v) => v === via).length;
}

function armarDatos(campus) {
  const { mapa } = campus;
  const grafo = construirGrafo(mapa);
  const nombreEdificio = (id) => buscarElemento(mapa, 'edificio', id)?.properties.nombre ?? 'Exteriores';

  // Ubicación simulada: un punto de referencia activo. Si no existe o está desactivado, no hay ubicación (HU-0024)
  const puntoActual = buscarElemento(mapa, 'punto', campus.ubicacionSimulada?.punto);
  const enUso = puntoActual && puntoActual.properties.activo !== false;
  const origen = enUso ? nodoDe(grafo, puntoActual) : null;

  const destinos = elementos(mapa, 'destino').map((f) => {
    const p = f.properties;
    const categoria = campus.categorias.find((c) => c.id === p.categoria);
    const nodo = nodoDe(grafo, f);
    const destino = {
      id: p.id,
      nombre: p.nombre,
      categoria: p.categoria,
      icono: categoria?.icono ?? 'location_on',
      edificioId: p.edificio ?? null,
      edificio: nombreEdificio(p.edificio),
      piso: `Piso ${p.piso}`,
      pisoNumero: p.piso,
      llegada: p.llegada,
      punto: p.punto,
      nodo,
      distancia: null,
      tiempo: null,
      acceso: '',
      zonasRiesgo: '',
      riesgo: null,
    };
    const ruta = buscarRuta(grafo, origen, nodo);
    if (!ruta) return destino;

    const escaleras = contar(ruta.vias, 'escalera');
    const alternativa = escaleras ? buscarRuta(grafo, origen, nodo, { evitarEscaleras: true }) : null;
    const usaAscensor = contar(ruta.vias, 'ascensor') || contar(alternativa?.vias ?? [], 'ascensor');
    destino.distancia = Math.round(ruta.distancia);
    destino.tiempo = minutos(ruta.distancia);
    destino.acceso = usaAscensor ? 'Ascensor disponible' : escaleras ? 'Escaleras' : 'Mismo piso';
    destino.zonasRiesgo = escaleras
      ? `${escaleras} escalera${escaleras > 1 ? 's' : ''}${alternativa ? ' (hay alternativa)' : ''}`
      : 'Ninguna';
    if (escaleras) {
      destino.riesgo = {
        titulo: 'Hay una escalera en el camino',
        texto: alternativa ? 'Te avisaremos antes de llegar. Hay alternativa por ascensor.' : 'Te avisaremos antes de llegar.',
      };
    }
    return destino;
  });

  const conDistancia = destinos.filter((d) => d.distancia !== null).sort((a, b) => a.distancia - b.distancia);
  const ubicacionSimulada = enUso
    ? {
        punto: puntoActual.properties.id,
        texto: `${puntoActual.properties.referencia} · Piso ${puntoActual.properties.piso} · ${nombreEdificio(puntoActual.properties.edificio)}`,
        cercanos: conDistancia.slice(0, 3).map((d) => ({ id: d.id, detalle: `${d.distancia} m · ${d.edificio} · ${d.piso}` })),
      }
    : null;

  return {
    categorias: campus.categorias,
    avisos: campus.avisos ?? [],
    destinos,
    ubicacionSimulada,
    mapa,
    grafo,
    origen,
  };
}
