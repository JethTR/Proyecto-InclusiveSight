// Algoritmo A* sobre el grafo del campus: encuentra el camino más corto entre dos nodos.
// Heurística: distancia en línea recta más la altura de los pisos que faltan (nunca sobreestima,
// así que el camino que devuelve es el óptimo).

const ALTURA_PISO = 3;

class ColaDePrioridad {
  constructor() {
    this.datos = [];
  }

  get vacia() {
    return this.datos.length === 0;
  }

  poner(valor, prioridad) {
    const d = this.datos;
    d.push({ valor, prioridad });
    let i = d.length - 1;
    while (i > 0) {
      const padre = (i - 1) >> 1;
      if (d[padre].prioridad <= d[i].prioridad) break;
      [d[padre], d[i]] = [d[i], d[padre]];
      i = padre;
    }
  }

  sacar() {
    const d = this.datos;
    const primero = d[0];
    const ultimo = d.pop();
    if (d.length) {
      d[0] = ultimo;
      let i = 0;
      for (;;) {
        const izq = 2 * i + 1;
        const der = izq + 1;
        let menor = i;
        if (izq < d.length && d[izq].prioridad < d[menor].prioridad) menor = izq;
        if (der < d.length && d[der].prioridad < d[menor].prioridad) menor = der;
        if (menor === i) break;
        [d[menor], d[i]] = [d[i], d[menor]];
        i = menor;
      }
    }
    return primero.valor;
  }
}

/**
 * Camino más corto de origen a destino. opciones.evitarEscaleras quita las escaleras del grafo
 * (para buscar la alternativa por ascensor o rampa). Devuelve null si no hay camino.
 * Resultado: { nodos: [id...], vias: [via de cada tramo], distancia }.
 */
export function buscarRuta(grafo, origen, destino, { evitarEscaleras = false } = {}) {
  if (!origen || !destino) return null;
  const { nodos, vecinos } = grafo;
  const meta = nodos.get(destino);
  const h = (id) => {
    const n = nodos.get(id);
    return Math.hypot(n.x - meta.x, n.y - meta.y) + ALTURA_PISO * Math.abs(n.piso - meta.piso);
  };

  const costo = new Map([[origen, 0]]);
  const anterior = new Map();
  const abiertos = new ColaDePrioridad();
  abiertos.poner(origen, h(origen));
  const cerrados = new Set();

  while (!abiertos.vacia) {
    const actual = abiertos.sacar();
    if (actual === destino) break;
    if (cerrados.has(actual)) continue;
    cerrados.add(actual);
    for (const { hacia, distancia, via } of vecinos.get(actual)) {
      if (evitarEscaleras && via === 'escalera') continue;
      const nuevo = costo.get(actual) + distancia;
      if (nuevo < (costo.get(hacia) ?? Infinity)) {
        costo.set(hacia, nuevo);
        anterior.set(hacia, { desde: actual, via });
        abiertos.poner(hacia, nuevo + h(hacia));
      }
    }
  }

  if (!costo.has(destino)) return null;
  const camino = [destino];
  const vias = [];
  for (let id = destino; anterior.has(id); id = anterior.get(id).desde) {
    vias.unshift(anterior.get(id).via);
    camino.unshift(anterior.get(id).desde);
  }
  return { nodos: camino, vias, distancia: costo.get(destino) };
}
