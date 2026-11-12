// Dibuja el mapa del campus en SVG: edificios, pasillos del piso elegido, destinos, puntos de referencia
// y, si se indica, la ruta. El mapa es un complemento visual: toda su información también está en texto,
// por eso el SVG se oculta a los lectores de pantalla.

import { elementos, crearProyeccion } from './geojson.js';

const NS = 'http://www.w3.org/2000/svg';
const MARGEN = 12;

function crear(nombre, atributos = {}, padre) {
  const el = document.createElementNS(NS, nombre);
  for (const [clave, valor] of Object.entries(atributos)) el.setAttribute(clave, valor);
  padre?.append(el);
  return el;
}

/**
 * opciones:
 *   piso          piso que se muestra (los edificios se ven siempre)
 *   ruta          [{ x, y, piso }] nodos de la ruta (se dibujan los de este piso)
 *   destacar      id del edificio o del destino que se resalta
 *   puntos        true para mostrar los puntos de referencia con su código
 *   marcador      [lon, lat] de un punto nuevo (9.3)
 *   alTocar(lonLat) se llama al hacer clic en el mapa
 */
export function dibujarMapa(contenedor, mapa, opciones = {}) {
  const { piso = 1, ruta = [], destacar = null, puntos = false, marcador = null, alTocar = null } = opciones;
  const proyeccion = crearProyeccion(mapa);
  const xy = (lonLat) => proyeccion.aXY(lonLat);

  // Límites de todo el mapa para que no cambie de escala al cambiar de piso
  const todos = [];
  const juntar = (c) => (typeof c[0] === 'number' ? todos.push(xy(c)) : c.forEach(juntar));
  for (const f of mapa.features) juntar(f.geometry.coordinates);
  if (!todos.length) {
    contenedor.replaceChildren();
    return;
  }
  const xs = todos.map((p) => p[0]);
  const ys = todos.map((p) => p[1]);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  // En SVG la y crece hacia abajo: se invierte para que el norte quede arriba
  const p = ([x, y]) => [x - minX + MARGEN, maxY - y + MARGEN];
  const ancho = maxX - minX + 2 * MARGEN;
  const alto = maxY - minY + 2 * MARGEN;

  const svg = crear('svg', { viewBox: `0 0 ${ancho} ${alto}`, class: 'mapa-svg', 'aria-hidden': 'true', focusable: 'false' });
  const texto = (contenido, [x, y], clase) => {
    const t = crear('text', { x, y, class: clase, 'text-anchor': 'middle' }, svg);
    t.textContent = contenido;
  };

  for (const f of elementos(mapa, 'edificio')) {
    const anillo = f.geometry.coordinates[0].map((c) => p(xy(c)));
    const clase = f.properties.id === destacar ? 'mapa-edificio mapa-destacado' : 'mapa-edificio';
    crear('polygon', { points: anillo.map((q) => q.join(',')).join(' '), class: clase }, svg);
    const cx = anillo.reduce((s, q) => s + q[0], 0) / anillo.length;
    const cy = anillo.reduce((s, q) => s + q[1], 0) / anillo.length;
    texto(f.properties.nombre, [cx, cy], 'mapa-etiqueta');
  }

  for (const f of elementos(mapa, 'pasillo').filter((f) => f.properties.piso === piso)) {
    const puntosLinea = f.geometry.coordinates.map((c) => p(xy(c)).join(',')).join(' ');
    crear('polyline', { points: puntosLinea, class: 'mapa-pasillo' }, svg);
  }

  for (const f of elementos(mapa, 'escalera').filter((f) => [f.properties.desde_piso, f.properties.hasta_piso].includes(piso))) {
    const puntosLinea = f.geometry.coordinates.map((c) => p(xy(c)).join(',')).join(' ');
    crear('polyline', { points: puntosLinea, class: 'mapa-escalera' }, svg);
  }

  // Ruta: tramos consecutivos que están en este piso
  const tramo = [];
  const cerrarTramo = () => {
    if (tramo.length > 1) crear('polyline', { points: tramo.map((q) => q.join(',')).join(' '), class: 'mapa-ruta' }, svg);
    tramo.length = 0;
  };
  for (const n of ruta) {
    if (n.piso === piso) tramo.push(p([n.x, n.y]));
    else cerrarTramo();
  }
  cerrarTramo();

  for (const f of elementos(mapa, 'destino').filter((f) => f.properties.piso === piso)) {
    const [x, y] = p(xy(f.geometry.coordinates));
    const clase = f.properties.id === destacar ? 'mapa-destino mapa-destacado' : 'mapa-destino';
    crear('rect', { x: x - 4, y: y - 4, width: 8, height: 8, rx: 2, class: clase }, svg);
    if (f.properties.id === destacar) texto(f.properties.nombre, [x, y - 8], 'mapa-etiqueta');
  }

  if (puntos) {
    for (const f of elementos(mapa, 'punto').filter((f) => f.properties.piso === piso)) {
      const [x, y] = p(xy(f.geometry.coordinates));
      crear('circle', { cx: x, cy: y, r: 4, class: f.properties.activo === false ? 'mapa-punto mapa-punto-inactivo' : 'mapa-punto' }, svg);
      texto(f.properties.id, [x, y - 7], 'mapa-etiqueta mapa-etiqueta-punto');
    }
  }

  if (marcador) {
    const [x, y] = p(xy(marcador));
    crear('circle', { cx: x, cy: y, r: 5, class: 'mapa-marcador' }, svg);
    texto('Nuevo punto', [x, y - 8], 'mapa-etiqueta mapa-etiqueta-punto');
  }

  if (alTocar) {
    svg.classList.add('mapa-tocable');
    svg.addEventListener('click', (evento) => {
      const caja = svg.getBoundingClientRect();
      const sx = ((evento.clientX - caja.left) / caja.width) * ancho;
      const sy = ((evento.clientY - caja.top) / caja.height) * alto;
      alTocar(proyeccion.aLonLat([sx + minX - MARGEN, maxY - (sy - MARGEN)]));
    });
  }

  contenedor.replaceChildren(svg);
}
