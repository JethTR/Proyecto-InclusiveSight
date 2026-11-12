// Patrones de vibración (HU-0015, HU-0017, HU-0028) con la Vibration API.
// Funciona en Android; en computadoras e iPhone el navegador no vibra y vibrar() devuelve false.

import { leerPreferencias } from './preferencias.js';

// Duraciones en milisegundos: vibra, pausa, vibra...
export const PATRONES = {
  izquierda: { nombre: 'Giro a la izquierda', detalle: 'dos pulsos cortos', ms: [150, 120, 150] },
  derecha: { nombre: 'Giro a la derecha', detalle: 'un pulso largo', ms: [600] },
  llegada: { nombre: 'Llegada al destino', detalle: 'tres pulsos', ms: [200, 120, 200, 120, 200] },
  riesgo: { nombre: 'Alerta de riesgo', detalle: 'vibración continua fuerte', ms: [1500] },
};

// La intensidad alarga o acorta los pulsos (la API no permite cambiar la fuerza)
const FACTOR = { 1: 0.6, 2: 1, 3: 1.4 };

/**
 * Por qué este dispositivo no puede vibrar desde el navegador, o null si puede.
 * Chrome de escritorio tiene navigator.vibrate pero no tiene motor de vibración: por eso también se mira
 * si la pantalla es táctil. Safari (iPhone y Mac) no tiene la Vibration API.
 */
export function motivoSinVibracion() {
  if (!('vibrate' in navigator)) {
    return /iPhone|iPad|iPod/.test(navigator.userAgent)
      ? 'El iPhone no permite que las páginas web vibren. En un celular Android sí vibra.'
      : 'Este navegador no permite vibrar. Prueba con Chrome en un celular Android.';
  }
  if (!matchMedia('(any-pointer: coarse)').matches) {
    return 'Las computadoras no vibran. Abre la app en tu celular para sentir la vibración.';
  }
  return null;
}

export function puedeVibrar() {
  return motivoSinVibracion() === null;
}

/**
 * Vibra con un patrón. Respeta el modo "solo voz" y la intensidad elegida, salvo en la alerta de riesgo,
 * que siempre vibra con la intensidad máxima (CA066, CA075). forzar: vibra aunque el modo sea "solo voz"
 * (prácticas y pruebas). intensidad: la que se está probando en ajustes, antes de guardarla.
 */
export function vibrar(patron, { forzar = false, intensidad } = {}) {
  if (!puedeVibrar() || !PATRONES[patron]) return false;
  // El navegador no deja vibrar hasta que la persona toca la página por primera vez
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return false;
  const preferencias = leerPreferencias();
  const esRiesgo = patron === 'riesgo';
  if (!forzar && !esRiesgo && preferencias.modo === 'voz') return false;
  const factor = esRiesgo ? FACTOR[3] : FACTOR[intensidad ?? preferencias.intensidad] ?? 1;
  const ms = PATRONES[patron].ms.map((d, i) => (i % 2 === 0 ? Math.round(d * factor) : d));
  return navigator.vibrate(ms);
}
