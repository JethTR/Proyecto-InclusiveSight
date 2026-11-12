// Dibuja el mapa del campus en SVG: edificios, pasillos del piso elegido, destinos, puntos de referencia
// y, si se indica, la ruta. El mapa es un complemento visual: toda su información también está en texto,
// por eso el SVG se oculta a los lectores de pantalla.
//
// El mapa se puede acercar, alejar y arrastrar. Al dibujarlo se encuadra solo en lo importante
// (la ruta, el destino o el edificio destacado), así no queda todo el campus apretado en la tarjeta.
// Los símbolos y los textos mantienen su tamaño en pantalla con cualquier zoom.

import { elementos, crearProyeccion } from './geojson.js';

const NS = 'http://www.w3.org/2000/svg';
const MARGEN = 12; // metros alrededor del campus
const HOLGURA = 14; // metros alrededor de lo que se encuadra
const TAMANO_MINIMO = 45; // metros: el encuadre nunca muestra menos que esto
const ZOOM_MAXIMO = 8;
const PASO_ZOOM = 1.5;

// Tamaños en píxeles de pantalla
const PX = {
  destino: 12,
  punto: 6,
  marcador: 8,
  inicio: 7,
  etiqueta: 14,
  etiquetaPunto: 12,
};

// Estado de cada mapa dibujado (zoom, centro, piso), por contenedor
const estados = new WeakMap();

function crear(nombre, atributos = {}, padre) {
  const el = document.createElementNS(NS, nombre);
  for (const [clave, valor] of Object.entries(atributos)) el.setAttribute(clave, valor);
  padre?.append(el);
  return el;
}

function boton(texto, etiqueta, alPulsar) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'mapa-boton';
  b.textContent = texto;
  if (etiqueta) b.setAttribute('aria-label', etiqueta);
  b.addEventListener('click', alPulsar);
  return b;
}

/** Caja que contiene una lista de puntos [x, y] (en coordenadas del SVG). */
function caja(puntos) {
  const xs = puntos.map((q) => q[0]);
  const ys = puntos.map((q) => q[1]);
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
}

/**
 * opciones:
 *   piso          piso que se muestra (los edificios se ven siempre)
 *   pisos         pisos que se pueden elegir con botones (ej. los que recorre la ruta)
 *   ruta          [{ x, y, piso }] nodos de la ruta (se dibujan los de este piso)
 *   destacar      id del edificio o del destino que se resalta
 *   puntos        true para mostrar los puntos de referencia con su código
 *   marcador      [lon, lat] de un punto nuevo (9.3)
 *   encuadrar     false para empezar mostrando todo el campus (por defecto se encuadra lo importante)
 *   alTocar(lonLat) se llama al hacer clic en el mapa (no al arrastrarlo)
 */
export function dibujarMapa(contenedor, mapa, opciones = {}) {
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
  const limites = caja(todos);
  // En SVG la y crece hacia abajo: se invierte para que el norte quede arriba
  const p = ([x, y]) => [x - limites.minX + MARGEN, limites.maxY - y + MARGEN];
  const ancho = limites.maxX - limites.minX + 2 * MARGEN;
  const alto = limites.maxY - limites.minY + 2 * MARGEN;

  const anterior = estados.get(contenedor);
  anterior?.observador?.disconnect();

  const estado = {
    mapa, opciones, proyeccion, xy, p, ancho, alto, limites,
    piso: opciones.piso ?? 1,
    zoom: 1,
    centro: [ancho / 2, alto / 2],
  };
  estados.set(contenedor, estado);

  // Primero la barra de botones: el dibujo usa el alto que queda libre
  contenedor.replaceChildren(controles(contenedor, estado));
  if (opciones.encuadrar !== false) encuadrar(contenedor, estado);
  pintar(contenedor, estado);

  // Si cambia el tamaño de la tarjeta, se vuelve a pintar con el mismo zoom
  if ('ResizeObserver' in window) {
    let medida = `${contenedor.clientWidth}x${contenedor.clientHeight}`;
    estado.observador = new ResizeObserver(() => {
      const nueva = `${contenedor.clientWidth}x${contenedor.clientHeight}`;
      if (nueva === medida) return;
      medida = nueva;
      pintar(contenedor, estado);
    });
    estado.observador.observe(contenedor);
  }
}

/* ===== Vista: qué parte del mapa se ve ===== */

/** Ancho y alto en píxeles del área de dibujo (el contenedor menos la barra de botones). */
function area(contenedor) {
  const barra = contenedor.querySelector(':scope > .mapa-controles');
  return { w: contenedor.clientWidth, h: contenedor.clientHeight - (barra?.offsetHeight ?? 0) };
}

function proporcion(contenedor) {
  const { w, h } = area(contenedor);
  return w > 0 && h > 0 ? w / h : 1;
}

/** Tamaño de la vista con zoom 1: todo el campus, con la forma del contenedor. */
function vistaBase(contenedor, estado) {
  const a = proporcion(contenedor);
  return estado.ancho / estado.alto > a
    ? { w: estado.ancho, h: estado.ancho / a }
    : { w: estado.alto * a, h: estado.alto };
}

function vistaActual(contenedor, estado) {
  const base = vistaBase(contenedor, estado);
  const w = base.w / estado.zoom;
  const h = base.h / estado.zoom;
  // El centro no puede salirse del campus
  const minCx = estado.ancho / 2 - (base.w - w) / 2;
  const maxCx = estado.ancho / 2 + (base.w - w) / 2;
  const minCy = estado.alto / 2 - (base.h - h) / 2;
  const maxCy = estado.alto / 2 + (base.h - h) / 2;
  estado.centro = [
    Math.min(maxCx, Math.max(minCx, estado.centro[0])),
    Math.min(maxCy, Math.max(minCy, estado.centro[1])),
  ];
  return { x: estado.centro[0] - w / 2, y: estado.centro[1] - h / 2, w, h };
}

/** Acerca el mapa a la ruta, al destino o al edificio destacado. */
function encuadrar(contenedor, estado) {
  const { mapa, opciones, xy, p } = estado;
  const interes = [];
  for (const n of opciones.ruta ?? []) interes.push(p([n.x, n.y]));
  if (opciones.destacar) {
    const edificio = elementos(mapa, 'edificio').find((f) => f.properties.id === opciones.destacar);
    const destino = elementos(mapa, 'destino').find((f) => f.properties.id === opciones.destacar);
    if (edificio) edificio.geometry.coordinates[0].forEach((c) => interes.push(p(xy(c))));
    if (destino) interes.push(p(xy(destino.geometry.coordinates)));
  }
  if (opciones.marcador) interes.push(p(xy(opciones.marcador)));
  if (!interes.length) return;

  const c = caja(interes);
  const w = Math.max(TAMANO_MINIMO, c.maxX - c.minX + 2 * HOLGURA);
  const h = Math.max(TAMANO_MINIMO, c.maxY - c.minY + 2 * HOLGURA);
  const base = vistaBase(contenedor, estado);
  estado.zoom = Math.min(ZOOM_MAXIMO, Math.max(1, Math.min(base.w / w, base.h / h)));
  estado.centro = [(c.minX + c.maxX) / 2, (c.minY + c.maxY) / 2];
}

/* ===== Dibujo ===== */

function pintar(contenedor, estado) {
  const { mapa, opciones, xy, p } = estado;
  const { ruta = [], destacar = null, puntos = false, marcador = null, alTocar = null } = opciones;
  const piso = estado.piso;
  contenedor.replaceChildren(controles(contenedor, estado));
  const vista = vistaActual(contenedor, estado);
  // Unidades del mapa (metros) por píxel de pantalla
  const anchoPx = area(contenedor).w || 400;
  const u = vista.w / anchoPx;

  const svg = crear('svg', {
    viewBox: `${vista.x} ${vista.y} ${vista.w} ${vista.h}`,
    class: alTocar ? 'mapa-svg mapa-tocable' : 'mapa-svg',
    'aria-hidden': 'true',
    focusable: 'false',
  });
  svg.style.setProperty('--pasillo', `${Math.min(24, Math.max(6, 3 / u)) * u}px`);
  svg.style.setProperty('--ruta', `${Math.min(14, Math.max(5, 2 / u)) * u}px`);

  const texto = (contenido, [x, y], clase, px) => {
    const t = crear('text', { x, y, class: clase, 'text-anchor': 'middle' }, svg);
    t.style.fontSize = `${px * u}px`;
    t.style.strokeWidth = `${3 * u}px`;
    t.textContent = contenido;
  };

  for (const f of elementos(mapa, 'edificio')) {
    const anillo = f.geometry.coordinates[0].map((c) => p(xy(c)));
    const clase = f.properties.id === destacar ? 'mapa-edificio mapa-destacado' : 'mapa-edificio';
    crear('polygon', { points: anillo.map((q) => q.join(',')).join(' '), class: clase }, svg);
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

  // Nombres de los edificios encima de los pasillos y de la ruta
  for (const f of elementos(mapa, 'edificio')) {
    const anillo = f.geometry.coordinates[0].slice(0, -1).map((c) => p(xy(c)));
    const cx = anillo.reduce((s, q) => s + q[0], 0) / anillo.length;
    const cy = Math.min(...anillo.map((q) => q[1])) + PX.etiqueta * 1.4 * u;
    texto(f.properties.nombre, [cx, cy], 'mapa-etiqueta', PX.etiqueta);
  }

  for (const f of elementos(mapa, 'destino').filter((f) => f.properties.piso === piso)) {
    const [x, y] = p(xy(f.geometry.coordinates));
    const lado = PX.destino * u;
    const clase = f.properties.id === destacar ? 'mapa-destino mapa-destacado' : 'mapa-destino';
    crear('rect', { x: x - lado / 2, y: y - lado / 2, width: lado, height: lado, rx: lado / 4, class: clase }, svg);
    if (f.properties.id === destacar) texto(f.properties.nombre, [x, y - lado], 'mapa-etiqueta', PX.etiqueta);
  }

  // Inicio de la ruta (tu ubicación)
  if (ruta.length && ruta[0].piso === piso) {
    const [x, y] = p([ruta[0].x, ruta[0].y]);
    crear('circle', { cx: x, cy: y, r: PX.inicio * u, class: 'mapa-inicio' }, svg);
    texto('Tú', [x, y - PX.inicio * 1.8 * u], 'mapa-etiqueta', PX.etiquetaPunto);
  }

  if (puntos) {
    for (const f of elementos(mapa, 'punto').filter((f) => f.properties.piso === piso)) {
      const [x, y] = p(xy(f.geometry.coordinates));
      const clase = f.properties.activo === false ? 'mapa-punto mapa-punto-inactivo' : 'mapa-punto';
      crear('circle', { cx: x, cy: y, r: PX.punto * u, class: clase }, svg);
      texto(f.properties.id, [x, y - PX.punto * 1.8 * u], 'mapa-etiqueta mapa-etiqueta-punto', PX.etiquetaPunto);
    }
  }

  if (marcador) {
    const [x, y] = p(xy(marcador));
    crear('circle', { cx: x, cy: y, r: PX.marcador * u, class: 'mapa-marcador' }, svg);
    texto('Nuevo punto', [x, y - PX.marcador * 1.8 * u], 'mapa-etiqueta mapa-etiqueta-punto', PX.etiquetaPunto);
  }

  arrastrar(svg, contenedor, estado, vista, u);
  contenedor.prepend(svg);
}

/* ===== Arrastrar y tocar ===== */

function arrastrar(svg, contenedor, estado, vista, u) {
  const { alTocar } = estado.opciones;
  let inicio = null;

  svg.addEventListener('pointerdown', (evento) => {
    if (evento.button !== 0) return;
    inicio = { x: evento.clientX, y: evento.clientY, centro: [...estado.centro], movido: false };
    // Sigue el arrastre aunque el dedo o el mouse salgan del mapa
    try {
      svg.setPointerCapture(evento.pointerId);
    } catch {
      // Sin captura el arrastre funciona igual mientras el puntero esté sobre el mapa
    }
  });

  svg.addEventListener('pointermove', (evento) => {
    if (!inicio) return;
    const dx = evento.clientX - inicio.x;
    const dy = evento.clientY - inicio.y;
    if (!inicio.movido && Math.hypot(dx, dy) < 4) return;
    inicio.movido = true;
    svg.classList.add('mapa-arrastrando');
    estado.centro = [inicio.centro[0] - dx * u, inicio.centro[1] - dy * u];
    const v = vistaActual(contenedor, estado);
    svg.setAttribute('viewBox', `${v.x} ${v.y} ${v.w} ${v.h}`);
  });

  const soltar = (evento) => {
    if (!inicio) return;
    const { movido } = inicio;
    inicio = null;
    svg.classList.remove('mapa-arrastrando');
    if (!movido && alTocar && evento.type === 'pointerup') {
      const punto = new DOMPoint(evento.clientX, evento.clientY).matrixTransform(svg.getScreenCTM().inverse());
      const { limites } = estado;
      alTocar(estado.proyeccion.aLonLat([punto.x + limites.minX - MARGEN, limites.maxY - (punto.y - MARGEN)]));
    }
  };
  svg.addEventListener('pointerup', soltar);
  svg.addEventListener('pointercancel', soltar);
}

/* ===== Botones: acercar, alejar, ver todo y pisos ===== */

function controles(contenedor, estado) {
  const barra = document.createElement('div');
  barra.className = 'mapa-controles';

  const zoom = document.createElement('div');
  zoom.className = 'mapa-grupo';
  zoom.setAttribute('role', 'group');
  zoom.setAttribute('aria-label', 'Zoom del mapa');
  const cambiarZoom = (factor) => {
    estado.zoom = Math.min(ZOOM_MAXIMO, Math.max(1, estado.zoom * factor));
    pintarConFoco(contenedor, estado, document.activeElement?.dataset.control);
  };
  const acercar = boton('+', 'Acercar el mapa', () => cambiarZoom(PASO_ZOOM));
  const alejar = boton('−', 'Alejar el mapa', () => cambiarZoom(1 / PASO_ZOOM));
  const todo = boton('Ver todo', null, () => {
    estado.zoom = 1;
    estado.centro = [estado.ancho / 2, estado.alto / 2];
    pintarConFoco(contenedor, estado, 'todo');
  });
  acercar.dataset.control = 'acercar';
  alejar.dataset.control = 'alejar';
  todo.dataset.control = 'todo';
  acercar.disabled = estado.zoom >= ZOOM_MAXIMO;
  alejar.disabled = estado.zoom <= 1;
  zoom.append(acercar, alejar, todo);
  barra.append(zoom);

  const pisos = [...new Set(estado.opciones.pisos ?? [])].sort((a, b) => a - b);
  if (pisos.length > 1) {
    const grupo = document.createElement('div');
    grupo.className = 'mapa-grupo';
    grupo.setAttribute('role', 'group');
    grupo.setAttribute('aria-label', 'Piso del mapa');
    for (const n of pisos) {
      const b = boton(`Piso ${n}`, null, () => {
        estado.piso = n;
        pintarConFoco(contenedor, estado, `piso-${n}`);
      });
      b.dataset.control = `piso-${n}`;
      b.setAttribute('aria-pressed', String(n === estado.piso));
      grupo.append(b);
    }
    barra.append(grupo);
  }
  return barra;
}

/** Vuelve a pintar y deja el foco en el mismo botón (al pintar se reemplazan los botones). */
function pintarConFoco(contenedor, estado, control) {
  pintar(contenedor, estado);
  const destino = contenedor.querySelector(`[data-control="${control}"]`);
  if (!destino) return;
  if (destino.disabled) contenedor.querySelector('[data-control="todo"]')?.focus();
  else destino.focus();
}
