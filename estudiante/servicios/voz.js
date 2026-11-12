// Voz de la app con la Web Speech API: síntesis (instrucciones, ayuda, tutorial) y reconocimiento (búsqueda por voz).
// La velocidad es la de la app (HU-0019); la del lector de pantalla la controla el sistema.

import { leerPreferencias } from './preferencias.js';

const VELOCIDAD = { 1: 0.8, 2: 1, 3: 1.25 };

/**
 * Dice un texto. Respeta el modo "solo vibración" salvo con forzar (ayuda, tutorial, alertas de peligro).
 * velocidad: la que se está probando en ajustes, antes de guardarla.
 */
export function decir(texto, { forzar = false, velocidad } = {}) {
  if (!('speechSynthesis' in window) || !texto) return;
  const preferencias = leerPreferencias();
  if (!forzar && preferencias.modo === 'vibracion') return;
  speechSynthesis.cancel();
  const frase = new SpeechSynthesisUtterance(texto);
  frase.lang = 'es';
  frase.rate = VELOCIDAD[velocidad ?? preferencias.velocidad] ?? 1;
  speechSynthesis.speak(frase);
}

export function callar() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}

export function pausarVoz() {
  if ('speechSynthesis' in window) speechSynthesis.pause();
}

export function reanudarVoz() {
  if ('speechSynthesis' in window) speechSynthesis.resume();
}

/* ===== Reconocimiento de voz ===== */

const Reconocimiento = window.SpeechRecognition ?? window.webkitSpeechRecognition;
let escuchaActual = null;

export function puedeEscuchar() {
  return Boolean(Reconocimiento);
}

/** Escucha una frase y devuelve sus alternativas de texto ([] si no se entendió nada). */
export function escuchar() {
  detenerEscucha();
  return new Promise((resolver, rechazar) => {
    const escucha = new Reconocimiento();
    escucha.lang = 'es-PE';
    escucha.interimResults = false;
    escucha.maxAlternatives = 3;
    let alternativas = [];
    escucha.onresult = (evento) => {
      alternativas = [...evento.results[0]].map((a) => a.transcript);
    };
    escucha.onerror = (evento) => {
      if (evento.error === 'no-speech' || evento.error === 'aborted') return;
      rechazar(evento.error);
    };
    escucha.onend = () => {
      escuchaActual = null;
      resolver(alternativas);
    };
    escuchaActual = escucha;
    escucha.start();
  });
}

export function detenerEscucha() {
  escuchaActual?.abort();
  escuchaActual = null;
}
