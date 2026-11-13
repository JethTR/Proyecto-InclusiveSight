// Voz de la app con la Web Speech API: síntesis (instrucciones, ayuda, tutorial) y reconocimiento (búsqueda por voz).
// La velocidad es la de la app (HU-0019); la del lector de pantalla la controla el sistema.

import { leerPreferencias } from './preferencias.js';

// Voz en español: se prefiere la de Perú y luego otras de Latinoamérica. Las voces cargan después de abrir la página.
const PREFERIDAS = ['es-PE', 'es-419', 'es-US', 'es-MX', 'es-CO', 'es-AR', 'es-CL', 'es-ES'];
let vozElegida = null;

function elegirVoz() {
  const voces = speechSynthesis.getVoices().filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith('es'));
  const rango = (v) => {
    const i = PREFERIDAS.findIndex((codigo) => v.lang.replace('_', '-').toLowerCase() === codigo.toLowerCase());
    return i === -1 ? PREFERIDAS.length : i;
  };
  vozElegida = voces.sort((a, b) => rango(a) - rango(b) || Number(b.localService) - Number(a.localService))[0] ?? null;
}

if ('speechSynthesis' in window) {
  elegirVoz();
  speechSynthesis.addEventListener?.('voiceschanged', elegirVoz);
}

export function puedeHablar() {
  return 'speechSynthesis' in window;
}

/**
 * Dice un texto. Respeta el modo "solo vibración" salvo con forzar (ayuda, tutorial, alertas de peligro).
 * velocidad: multiplicador (x0.5 a x2) que se está probando en ajustes, antes de guardarlo.
 * Devuelve la frase (SpeechSynthesisUtterance) para escuchar sus eventos start, end y error, o null si no se dice.
 */
export function decir(texto, { forzar = false, velocidad } = {}) {
  if (!puedeHablar() || !texto) return null;
  const preferencias = leerPreferencias();
  if (!forzar && preferencias.modo === 'vibracion') return null;
  const frase = new SpeechSynthesisUtterance(texto);
  if (!vozElegida) elegirVoz();
  if (vozElegida) frase.voice = vozElegida;
  frase.lang = vozElegida?.lang ?? 'es-PE';
  frase.rate = velocidad ?? preferencias.velocidadVoz ?? 1;
  const ocupado = speechSynthesis.speaking || speechSynthesis.pending;
  speechSynthesis.cancel();
  // Chrome para Android a veces queda en pausa y descarta lo que se dice justo después de cancel()
  speechSynthesis.resume();
  if (ocupado) setTimeout(() => speechSynthesis.speak(frase), 120);
  else speechSynthesis.speak(frase);
  return frase;
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
