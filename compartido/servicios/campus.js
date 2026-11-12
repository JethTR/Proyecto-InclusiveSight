// Almacén del campus: el mapa GeoJSON (con sus puntos de referencia) y los datos que no son del mapa
// (categorías, avisos y la ubicación simulada). Lo usan las dos aplicaciones:
// - El administrador guarda aquí sus cambios (en este navegador) y puede exportar el mapa.
// - El estudiante lee de aquí; si el administrador no guardó nada, se usan los archivos de compartido/datos/.
// Cuando haya backend, basta con cambiar estas funciones.

import { leer, guardar, borrar } from './almacenamiento.js';

const CLAVE = 'campus';
const URL_MAPA = new URL('../datos/campus.geojson', import.meta.url);
const URL_DATOS = new URL('../datos/campus.json', import.meta.url);
const MAX_ACTIVIDAD = 20;

async function leerArchivo(url, porDefecto) {
  try {
    const respuesta = await fetch(url);
    return respuesta.ok ? await respuesta.json() : porDefecto;
  } catch {
    return porDefecto;
  }
}

/** { mapa, categorias, avisos, ubicacionSimulada, actividad } */
export async function cargarCampus() {
  const guardado = leer(CLAVE);
  if (guardado) return guardado;
  const [mapa, datos] = await Promise.all([
    leerArchivo(URL_MAPA, { type: 'FeatureCollection', features: [] }),
    leerArchivo(URL_DATOS, {}),
  ]);
  return { categorias: [], avisos: [], ubicacionSimulada: null, actividad: [], ...datos, mapa };
}

export function hayCambiosGuardados() {
  return leer(CLAVE) !== null;
}

/** Guarda el campus y anota el evento en la actividad reciente del panel (9.1). */
export function guardarCampus(campus, evento) {
  if (evento) {
    campus.actividad = [{ fecha: new Date().toISOString(), ...evento }, ...(campus.actividad ?? [])].slice(0, MAX_ACTIVIDAD);
  }
  guardar(CLAVE, campus);
}

/** Vuelve a los archivos del repositorio (borra lo que guardó el administrador en este navegador). */
export function restablecerCampus() {
  borrar(CLAVE);
}

/** Descarga el mapa como campus.geojson, listo para reemplazar compartido/datos/campus.geojson. */
export function exportarMapa(campus) {
  const texto = JSON.stringify(campus.mapa, null, 2);
  const enlace = document.createElement('a');
  enlace.href = URL.createObjectURL(new Blob([texto], { type: 'application/geo+json' }));
  enlace.download = 'campus.geojson';
  enlace.click();
  URL.revokeObjectURL(enlace.href);
}
