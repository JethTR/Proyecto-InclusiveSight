// Grafo de caminos del campus a partir del GeoJSON: cada vértice de un pasillo es un nodo (x, y en metros, piso)
// y cada tramo es una arista. Las escaleras y los ascensores unen pisos.

import { elementos, crearProyeccion } from './geojson.js';

const TOLERANCIA = 1.5;        // metros: dos vértices más cerca que esto son el mismo nodo
const ALTURA_PISO = 3;         // metros que suma una escalera o un ascensor por cada piso
const ESPERA_ASCENSOR = 10;    // metros "equivalentes" a esperar el ascensor

export function construirGrafo(mapa) {
  const proyeccion = crearProyeccion(mapa);
  const nodos = new Map();      // id → { id, x, y, piso }
  const vecinos = new Map();    // id → [{ hacia, distancia, via }]
  let siguiente = 0;

  const distancia = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  function nodo([x, y], piso) {
    for (const n of nodos.values()) {
      if (n.piso === piso && Math.hypot(n.x - x, n.y - y) < TOLERANCIA) return n.id;
    }
    const id = `n${siguiente++}`;
    nodos.set(id, { id, x, y, piso });
    vecinos.set(id, []);
    return id;
  }

  function unir(a, b, via, extra = 0) {
    if (a === b) return;
    const d = distancia(nodos.get(a), nodos.get(b)) + extra;
    vecinos.get(a).push({ hacia: b, distancia: d, via });
    vecinos.get(b).push({ hacia: a, distancia: d, via });
  }

  function quitar(a, b) {
    vecinos.set(a, vecinos.get(a).filter((v) => v.hacia !== b));
    vecinos.set(b, vecinos.get(b).filter((v) => v.hacia !== a));
  }

  /** Conecta un punto suelto al pasillo más cercano de su piso: parte ese tramo en dos y devuelve el nodo. */
  function anclar(lonLat, piso) {
    const p = proyeccion.aXY(lonLat);
    let mejor = null;
    for (const [a, lista] of vecinos) {
      const na = nodos.get(a);
      if (na.piso !== piso) continue;
      for (const { hacia: b, via } of lista) {
        if (via !== 'pasillo' || a > b) continue;
        const nb = nodos.get(b);
        const dx = nb.x - na.x;
        const dy = nb.y - na.y;
        const largo2 = dx * dx + dy * dy || 1;
        const t = Math.max(0, Math.min(1, ((p[0] - na.x) * dx + (p[1] - na.y) * dy) / largo2));
        const q = [na.x + t * dx, na.y + t * dy];
        const d = Math.hypot(p[0] - q[0], p[1] - q[1]);
        if (!mejor || d < mejor.d) mejor = { d, a, b, q };
      }
    }
    if (!mejor) return null;
    const enPasillo = nodo(mejor.q, piso);
    if (enPasillo !== mejor.a && enPasillo !== mejor.b) {
      quitar(mejor.a, mejor.b);
      unir(mejor.a, enPasillo, 'pasillo');
      unir(enPasillo, mejor.b, 'pasillo');
    }
    const propio = nodo(p, piso);
    unir(propio, enPasillo, 'pasillo');
    return propio;
  }

  // 1. Pasillos
  for (const f of elementos(mapa, 'pasillo')) {
    const coords = f.geometry.coordinates.map((c) => proyeccion.aXY(c));
    for (let i = 1; i < coords.length; i++) unir(nodo(coords[i - 1], f.properties.piso), nodo(coords[i], f.properties.piso), 'pasillo');
  }

  // 1b. Cruces en "T": un extremo de pasillo que cae sobre otro pasillo (sin compartir vértice) se une a él
  for (const [id, lista] of [...vecinos]) {
    if (lista.length !== 1) continue;
    const n = nodos.get(id);
    let mejor = null;
    for (const [a, aristas] of vecinos) {
      const na = nodos.get(a);
      if (na.piso !== n.piso || a === id) continue;
      for (const { hacia: b, via } of aristas) {
        if (via !== 'pasillo' || b === id || a > b) continue;
        const nb = nodos.get(b);
        const dx = nb.x - na.x;
        const dy = nb.y - na.y;
        const t = ((n.x - na.x) * dx + (n.y - na.y) * dy) / (dx * dx + dy * dy || 1);
        if (t <= 0 || t >= 1) continue;
        const d = Math.hypot(n.x - (na.x + t * dx), n.y - (na.y + t * dy));
        if (d < TOLERANCIA && (!mejor || d < mejor.d)) mejor = { d, a, b };
      }
    }
    if (mejor) {
      quitar(mejor.a, mejor.b);
      unir(mejor.a, id, 'pasillo');
      unir(id, mejor.b, 'pasillo');
    }
  }

  // 2. Escaleras: del primer punto (desde_piso) al último (hasta_piso)
  for (const f of elementos(mapa, 'escalera')) {
    const c = f.geometry.coordinates;
    const a = anclar(c[0], f.properties.desde_piso);
    const b = anclar(c[c.length - 1], f.properties.hasta_piso);
    if (a && b) unir(a, b, 'escalera', ALTURA_PISO * Math.abs(f.properties.hasta_piso - f.properties.desde_piso));
  }

  // 3. Ascensores: un nodo por cada piso que tenga pasillos, unidos con el siguiente piso que también tenga
  //    (un piso sin pasillos en el mapa no corta el ascensor)
  for (const f of elementos(mapa, 'ascensor')) {
    const paradas = [...f.properties.pisos]
      .sort((x, y) => x - y)
      .map((piso) => ({ piso, nodo: anclar(f.geometry.coordinates, piso) }))
      .filter((parada) => parada.nodo);
    for (let i = 1; i < paradas.length; i++) {
      const subida = ALTURA_PISO * (paradas[i].piso - paradas[i - 1].piso);
      unir(paradas[i - 1].nodo, paradas[i].nodo, 'ascensor', subida + ESPERA_ASCENSOR);
    }
  }

  // Nodo de cada destino o punto ya conectado a este grafo (cada grafo tiene los suyos)
  const anclados = new WeakMap();

  return { nodos, vecinos, proyeccion, anclar, anclados };
}

/** Nodo del grafo para un destino o un punto de referencia (lo conecta al pasillo más cercano de su piso). */
export function nodoDe(grafo, feature) {
  if (!grafo.anclados.has(feature)) {
    grafo.anclados.set(feature, grafo.anclar(feature.geometry.coordinates, feature.properties.piso));
  }
  return grafo.anclados.get(feature);
}
