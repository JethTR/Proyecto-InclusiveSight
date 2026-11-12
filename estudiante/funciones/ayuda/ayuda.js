// Vista tutorial (2.1, 2.2 y 2.3) y página ayuda.html.
// El tutorial se lee en voz alta (HU-0014) y cada paso se puede repetir o pausar (CA056).
// La práctica de vibración reproduce cada patrón y dice su significado (HU-0015).

import { anunciar } from '../../../compartido/servicios/anuncios.js';
import { usuarioActual } from '../../../compartido/servicios/cuenta.js';
import { decir, callar, pausarVoz, reanudarVoz } from '../../servicios/voz.js';
import { PATRONES, vibrar, puedeVibrar } from '../../servicios/vibracion.js';

/* ===== Tutorial ===== */

function pasoVisible() {
  return document.querySelector('.tutorial-paso:not([hidden])');
}

/** Texto que dice la voz en el paso: el título y la frase de los subtítulos (o la introducción de la práctica). */
function textoDelPaso(paso) {
  const titulo = paso.querySelector('h2')?.textContent ?? '';
  const frase = (paso.querySelector('.subtitulos') ?? paso.querySelector('.introduccion'))?.textContent ?? '';
  return `${titulo}. ${frase.replace(/[«»]/g, '').trim()}`;
}

function ponerPausa(boton, pausado) {
  boton.setAttribute('aria-pressed', String(pausado));
  boton.querySelector('.icono').textContent = pausado ? 'play_arrow' : 'pause';
}

function leerPaso() {
  const paso = pasoVisible();
  if (!paso) return;
  for (const boton of paso.querySelectorAll('[data-accion="pausar-audio"]')) ponerPausa(boton, false);
  decir(textoDelPaso(paso), { forzar: true });
}

function probarPatron(nombre) {
  const patron = PATRONES[nombre];
  if (!patron) return;
  vibrar(nombre, { forzar: true });
  const texto = `${patron.nombre}: ${patron.detalle}.`;
  decir(texto, { forzar: true });
  anunciar(puedeVibrar() ? texto : `${texto} Este dispositivo no permite vibrar desde el navegador.`);
}

export function iniciar() {
  document.querySelector('#vista-tutorial').addEventListener('click', (evento) => {
    if (evento.target.closest('[data-accion="repetir-audio"]')) {
      leerPaso();
      return;
    }
    const pausar = evento.target.closest('[data-accion="pausar-audio"]');
    if (pausar) {
      const pausado = pausar.getAttribute('aria-pressed') !== 'true';
      if (pausado) pausarVoz();
      else reanudarVoz();
      ponerPausa(pausar, pausado);
      return;
    }
    const patron = evento.target.closest('[data-patron]');
    if (patron) probarPatron(patron.dataset.patron);
  });

  // Al salir del tutorial (Saltar, Listo, empezar), la voz se calla
  window.addEventListener('hashchange', () => {
    if (!location.hash.startsWith('#tutorial')) callar();
  });
}

export function mostrar({ vista }) {
  if (vista === 'tutorial') leerPaso();
}

/* ===== Página ayuda.html =====
   Se carga directamente (no con el router). Pone el modo y lee en voz alta el texto de cada tarjeta. */

if (!document.getElementById('vista')) {
  document.body.dataset.modo = usuarioActual() ? 'registrado' : 'invitado';
  document.addEventListener('click', (evento) => {
    const boton = evento.target.closest('[data-accion="escuchar-ayuda"]');
    if (!boton) return;
    const texto = boton.closest('.tarjeta')?.querySelector('p')?.textContent;
    if (texto) decir(texto, { forzar: true });
  });
}
