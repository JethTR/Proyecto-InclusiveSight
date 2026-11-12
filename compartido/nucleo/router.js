// Router por hash de las dos aplicaciones: #vista o #vista/parte (ej. #buscar/cerca, #puntos/editar/BLE-0012).
// Al entrar a una vista: carga su fragmento HTML si lo tiene (una sola vez), el CSS y el JS de su función
// (funciones/<función>/<función>.css y .js, relativos a la página), muestra la vista con hidden, mueve el foco
// a su título, actualiza document.title y anuncia el cambio.
// Una vista con requiereCuenta lleva a quien no tiene sesión a la página de acceso (y no se descarga su fragmento).
//
// Cada aplicación lo arranca con iniciarRouter({ vistas, vistaInicial, esRegistrado, acceso, nombreApp }).

import { anunciar } from '../servicios/anuncios.js';

let VISTAS = {};
let VISTA_INICIAL = '';
let ACCESO = '';
let NOMBRE_APP = 'InclusiveSight';

const fragmentos = new Map();   // ruta → promesa de la carga (para no pedirlo dos veces)
const modulos = new Map();      // función → promesa del módulo JS
const estilos = new Set();      // funciones cuyo CSS ya está en la página

let registrado = false;
let primeraVez = true;
const principal = () => document.getElementById('vista');

function leerHash() {
  const [vista = '', ...resto] = location.hash.slice(1).split('/');
  return { vista: decodeURIComponent(vista), parte: decodeURIComponent(resto.join('/')) };
}

function cargarFragmento(ruta) {
  if (!fragmentos.has(ruta)) {
    const carga = fetch(ruta)
      .then((respuesta) => {
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        return respuesta.text();
      })
      .then((html) => {
        principal().insertAdjacentHTML('beforeend', html);
        principal().dispatchEvent(new CustomEvent('fragmento-cargado', { bubbles: true }));
      })
      .catch((error) => {
        fragmentos.delete(ruta); // permite reintentar
        throw error;
      });
    fragmentos.set(ruta, carga);
  }
  return fragmentos.get(ruta);
}

function cargarEstilo(funcion) {
  if (estilos.has(funcion)) return;
  estilos.add(funcion);
  const enlace = document.createElement('link');
  enlace.rel = 'stylesheet';
  enlace.href = `funciones/${funcion}/${funcion}.css`;
  document.head.append(enlace);
}

function cargarModulo(funcion) {
  if (!modulos.has(funcion)) {
    const carga = import(new URL(`funciones/${funcion}/${funcion}.js`, document.baseURI).href)
      .then(async (modulo) => {
        await modulo.iniciar?.();
        return modulo;
      })
      .catch((error) => {
        console.error(`No se pudo cargar la función ${funcion}`, error);
        return null;
      });
    modulos.set(funcion, carga);
  }
  return modulos.get(funcion);
}

function mostrarErrorDeCarga(visible) {
  const mensaje = document.querySelector('[data-mensaje="error-carga"]');
  mensaje.hidden = !visible;
  if (visible) {
    for (const s of document.querySelectorAll('.vista')) s.hidden = true;
    mensaje.querySelector('button').focus();
  }
}

/**
 * Muestra las partes que reemplazan el contenido de la vista (.parte y pasos del tutorial).
 * Se compara el primer segmento: #mis-rutas/editar/<id> muestra la parte "editar".
 */
function mostrarParte(seccion, parteCompleta) {
  const parte = parteCompleta.split('/')[0];
  const exclusivas = [...seccion.querySelectorAll('.parte[data-parte], .tutorial-paso[data-parte]')];
  let activa = exclusivas.find((p) => p.dataset.parte === parte) ?? null;
  // El tutorial siempre muestra un paso: el primero si no se indica otro
  if (!activa && exclusivas[0]?.classList.contains('tutorial-paso')) activa = exclusivas[0];
  for (const p of exclusivas) p.hidden = p !== activa;
  seccion.toggleAttribute('data-parte-activa', Boolean(activa?.classList.contains('parte')));

  // Partes que siempre se ven (ej. #mis-rutas/recientes): solo se lleva la vista hasta ellas
  const destino = !activa && parte ? seccion.querySelector(`[data-parte="${CSS.escape(parte)}"]`) : null;
  return { activa, destino };
}

function marcarMenu(vista) {
  for (const enlace of document.querySelectorAll('.menu-item')) {
    if (enlace.getAttribute('href') === `#${vista}`) enlace.setAttribute('aria-current', 'page');
    else enlace.removeAttribute('aria-current');
  }
}

async function mostrar() {
  let { vista, parte } = leerHash();
  if (!VISTAS[vista]) {
    vista = VISTA_INICIAL;
    parte = '';
  }
  const config = VISTAS[vista];

  if (config.requiereCuenta && !registrado) {
    location.replace(ACCESO);
    return;
  }

  if (config.fragmento) {
    try {
      await cargarFragmento(config.fragmento);
      mostrarErrorDeCarga(false);
    } catch {
      mostrarErrorDeCarga(true);
      return;
    }
  }

  cargarEstilo(config.funcion);
  const modulo = await cargarModulo(config.funcion);

  const seccion = document.querySelector(`.vista[data-vista="${vista}"]`);
  for (const s of document.querySelectorAll('.vista')) s.hidden = s !== seccion;
  const { activa, destino } = mostrarParte(seccion, parte);
  marcarMenu(vista);

  // La función llena la vista antes de mover el foco (así el título ya tiene su texto)
  await modulo?.mostrar?.({ vista, parte, seccion });

  const titulo = activa?.querySelector('h1, h2') ?? seccion.querySelector('h1');
  const texto = titulo.textContent.trim().replace(/\s+/g, ' ');
  document.title = `${texto} · ${NOMBRE_APP}`;

  if (destino) destino.scrollIntoView({ block: 'start' });
  else window.scrollTo(0, 0);

  if (!primeraVez) {
    if (!titulo.hasAttribute('tabindex')) titulo.setAttribute('tabindex', '-1');
    titulo.focus({ preventScroll: Boolean(destino) });
    anunciar(texto);
  }
  primeraVez = false;
}

export function iniciarRouter({ vistas, vistaInicial, esRegistrado, acceso, nombreApp = 'InclusiveSight' }) {
  VISTAS = vistas;
  VISTA_INICIAL = vistaInicial;
  ACCESO = acceso;
  NOMBRE_APP = nombreApp;
  registrado = esRegistrado;
  window.addEventListener('hashchange', mostrar);
  document.querySelector('[data-accion="reintentar-carga"]').addEventListener('click', mostrar);
  return mostrar();
}
