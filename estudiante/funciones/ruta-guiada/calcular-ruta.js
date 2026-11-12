// Convierte el camino que encuentra A* (compartido/mapa/a-estrella.js) en los pasos de la guía.
// Los tramos rectos se unen; un cambio de dirección mayor a 35° es un giro a la derecha o a la izquierda;
// antes de una escalera se agrega un paso de alerta de riesgo; los tramos de ascensor se unen en uno solo.
//
// Cada paso: { tipo, texto, detalle?, voz?, metros, nodo, mensajePunto?, aviso?, avisoDetalle? }
// tipo: recto | derecha | izquierda | ascensor | escalera | riesgo | llegada

import { buscarRuta } from '../../../compartido/mapa/a-estrella.js';
import { elementos } from '../../../compartido/mapa/geojson.js';
import { minutos } from '../../../compartido/servicios/datos.js';

export const ICONOS = {
  recto: 'straight',
  derecha: 'turn_right',
  izquierda: 'turn_left',
  ascensor: 'elevator',
  escalera: 'stairs',
  riesgo: 'stairs',
  llegada: 'where_to_vote',
};

/** Patrón de vibración de cada tipo de paso (sin patrón, el paso no vibra). */
export const VIBRACIONES = {
  derecha: 'derecha',
  izquierda: 'izquierda',
  riesgo: 'riesgo',
  llegada: 'llegada',
};

const GIRO_MINIMO = 35;        // grados
const RADIO_PUNTO = 6;         // metros: un punto de referencia a esta distancia "se pasa"
const TRAMO_MINIMO = 4;        // metros: un primer tramo más corto se une al siguiente

const redondear = (m) => Math.max(1, Math.round(m));

function direccion(a, b) {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

/** Ángulo con signo entre dos direcciones: positivo = giro a la izquierda (antihorario). */
function giro(antes, despues) {
  let d = ((despues - antes) * 180) / Math.PI;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
}

/**
 * Mensajes de voz de los puntos de referencia activos que la persona pasa en un tramo (HU-0041).
 * Un punto desactivado no se usa (CA145).
 */
function mensajesEnTramo(datos, a, b) {
  const mensajes = [];
  for (const f of elementos(datos.mapa, 'punto')) {
    const p = f.properties;
    if (p.activo === false || !p.mensaje || p.piso !== a.piso) continue;
    const [x, y] = datos.grafo.proyeccion.aXY(f.geometry.coordinates);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / (dx * dx + dy * dy || 1)));
    if (Math.hypot(x - (a.x + t * dx), y - (a.y + t * dy)) <= RADIO_PUNTO) mensajes.push({ t, mensaje: p.mensaje });
  }
  // En el orden en que la persona pasa por ellos
  return mensajes.length ? mensajes.sort((m1, m2) => m1.t - m2.t).map((m) => m.mensaje).join(' ') : null;
}

/** Agrupa las aristas del camino en tramos: varios metros de pasillo en la misma dirección, una escalera o un ascensor. */
function tramos(datos, camino) {
  const { nodos } = datos.grafo;
  const lista = [];
  for (let i = 0; i < camino.vias.length; i++) {
    const a = nodos.get(camino.nodos[i]);
    const b = nodos.get(camino.nodos[i + 1]);
    const via = camino.vias[i];
    const metros = Math.hypot(b.x - a.x, b.y - a.y);
    const anterior = lista[lista.length - 1];
    if (via === 'pasillo') {
      if (metros < 0.5) continue;
      const rumbo = direccion(a, b);
      // El primer tramo corto (del punto de referencia al pasillo) se une al siguiente:
      // al empezar no se sabe hacia dónde mira la persona, así que no hay giro que indicar
      if (lista.length === 1 && anterior.via === 'pasillo' && anterior.metros < TRAMO_MINIMO) {
        anterior.metros += metros;
        anterior.hasta = b;
        anterior.rumbo = rumbo;
        anterior.rumboFinal = rumbo;
        continue;
      }
      if (anterior?.via === 'pasillo' && Math.abs(giro(anterior.rumboFinal, rumbo)) < GIRO_MINIMO) {
        anterior.metros += metros;
        anterior.hasta = b;
        anterior.rumboFinal = rumbo;
        continue;
      }
      lista.push({ via, metros, desde: a, hasta: b, nodo: camino.nodos[i], rumbo, rumboFinal: rumbo });
    } else if (via === 'ascensor' && anterior?.via === 'ascensor') {
      anterior.hasta = b;
    } else {
      lista.push({ via, metros, desde: a, hasta: b, nodo: camino.nodos[i] });
    }
  }
  return lista;
}

function pasosDesde(datos, camino, destino) {
  const pasos = [];
  const lista = tramos(datos, camino);
  let rumbo = null;
  lista.forEach((t, i) => {
    if (t.via === 'pasillo') {
      const metros = redondear(t.metros);
      const angulo = rumbo === null ? 0 : giro(rumbo, t.rumbo);
      rumbo = t.rumboFinal;
      const siguiente = lista[i + 1];
      let paso;
      if (Math.abs(angulo) < GIRO_MINIMO) {
        paso = { tipo: 'recto', texto: `Avanza ${metros} m`, voz: `Avanza ${metros} metros` };
      } else {
        const lado = angulo > 0 ? 'izquierda' : 'derecha';
        paso = { tipo: lado, texto: `Gira a la ${lado} y avanza ${metros} m`, voz: `Gira a la ${lado}` };
      }
      if (siguiente?.via === 'escalera') paso.detalle = `${paso.texto}. Al final hay una escalera`;
      pasos.push({ ...paso, metros, nodo: t.nodo, mensajePunto: mensajesEnTramo(datos, t.desde, t.hasta) });
      return;
    }
    if (t.via === 'escalera') {
      const sube = t.hasta.piso > t.desde.piso;
      const anterior = pasos[pasos.length - 1];
      // Alerta de riesgo antes de la escalera (HU-0032): siempre con voz y vibración
      pasos.push({
        tipo: 'riesgo',
        texto: 'Escaleras al frente',
        detalle: `Detente. Hay escaleras hacia ${sube ? 'arriba' : 'abajo'} frente a ti.`,
        aviso: `Atención: escaleras a ${anterior?.metros ?? 0} m`,
        avisoDetalle: 'Te avisaremos otra vez al llegar',
        metros: 0,
        nodo: t.nodo,
      });
      pasos.push({
        tipo: 'escalera',
        texto: `${sube ? 'Sube' : 'Baja'} las escaleras al piso ${t.hasta.piso}`,
        metros: redondear(t.metros),
        nodo: t.nodo,
      });
      rumbo = null;
      return;
    }
    // Ascensor
    pasos.push({ tipo: 'ascensor', texto: `Toma el ascensor al piso ${t.hasta.piso}`, metros: 0, nodo: t.nodo });
    rumbo = null;
  });
  pasos.push({
    tipo: 'llegada',
    texto: `Llegas a ${destino.nombre}`,
    detalle: destino.llegada,
    metros: 0,
    nodo: destino.nodo,
  });
  return pasos;
}

function armarRuta(datos, destino, camino) {
  const nodos = camino.nodos.map((id) => datos.grafo.nodos.get(id));
  return {
    destino,
    pasos: pasosDesde(datos, camino, destino),
    distancia: Math.round(camino.distancia),
    tiempo: minutos(camino.distancia),
    nodos,
  };
}

/** Ruta desde la ubicación actual hasta el destino, o null si no hay ubicación o no hay camino. */
export function calcularRuta(datos, destino) {
  const camino = buscarRuta(datos.grafo, datos.origen, destino.nodo);
  return camino ? armarRuta(datos, destino, camino) : null;
}

/** 4.2: nueva ruta desde el paso indicado, sin escaleras. null si no hay alternativa. */
export function recalcularSinEscaleras(datos, ruta, indice) {
  const desde = ruta.pasos[indice]?.nodo ?? datos.origen;
  const camino = buscarRuta(datos.grafo, desde, ruta.destino.nodo, { evitarEscaleras: true });
  return camino ? armarRuta(datos, ruta.destino, camino) : null;
}

/** Metros que faltan desde el paso indicado hasta el destino. */
export function metrosRestantes(ruta, desde) {
  return ruta.pasos.slice(desde).reduce((total, paso) => total + (paso.metros ?? 0), 0);
}

/** Minutos que faltan, proporcionales a la distancia. */
export function minutosRestantes(ruta, desde) {
  const metros = metrosRestantes(ruta, desde);
  if (!ruta.distancia || metros === 0) return 0;
  return Math.max(1, Math.round((metros / ruta.distancia) * ruta.tiempo));
}
