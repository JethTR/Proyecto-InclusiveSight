// Patrones de vibración (HU-0015, HU-0017, HU-0028) con la Vibration API.
// Funciona en Android; en computadoras e iPhone el navegador no vibra y vibrar() devuelve false.

import { leerPreferencias } from './preferencias.js';

// Duraciones en milisegundos: vibra, pausa, vibra...
export const PATRONES = {
  izquierda: { nombre: 'Giro a la izquierda', detalle: 'dos pulsos cortos', ms: [150, 120, 150] },
  derecha: { nombre: 'Giro a la derecha', detalle: 'un pulso largo', ms: [600] },
  llegada: { nombre: 'Llegada al destino', detalle: 'tres pulsos', ms: [200, 120, 200, 120, 200] },
  riesgo: { nombre: 'Alerta de riesgo', detalle: 'vibración continua fuerte', ms: [1500] },
  // Patrón de prueba de la pantalla Intensidad de vibración (7.2)
  prueba: { nombre: 'Prueba', detalle: 'dos pulsos', ms: [350, 200, 350] },
};

// Tipo de pulso: alarga o acorta cada vibración
const DURACION = { largo: 1.5, medio: 1, suave: 0.6 };

// Intensidad: la Vibration API no deja cambiar la fuerza del motor. Antes se simulaba prendiéndolo y apagándolo
// cada 40 ms, pero muchos celulares Android ignoran pulsos tan cortos y no vibraban. Ahora la intensidad
// alarga o acorta cada vibración (más tiempo encendido se siente más fuerte) y Alta además acorta las pausas.
const FUERZA = { 1: 0.6, 2: 1, 3: 1.4 };
const PAUSA = { 1: 1.2, 2: 1, 3: 0.8 };
const MINIMO_MS = 80; // por debajo de esto varios motores no llegan a arrancar

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
 * Vibra con un patrón. Respeta el modo "solo voz", el tipo de pulso y la intensidad elegidos, salvo en la alerta
 * de riesgo, que siempre vibra continua y al máximo (CA066, CA075). forzar: vibra aunque el modo sea "solo voz"
 * (prácticas y pruebas). pulso e intensidad: los que se están probando en ajustes, antes de guardarlos.
 * Devuelve true si el navegador aceptó vibrar.
 */
export function vibrar(patron, { forzar = false, pulso, intensidad } = {}) {
  if (!puedeVibrar() || !PATRONES[patron]) return false;
  // El navegador no deja vibrar hasta que la persona toca la página por primera vez
  if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return false;
  const preferencias = leerPreferencias();
  const esRiesgo = patron === 'riesgo';
  if (!forzar && !esRiesgo && preferencias.modo === 'voz') return false;
  const nivel = intensidad ?? preferencias.intensidad;
  const factor = esRiesgo ? 1 : (DURACION[pulso ?? preferencias.pulso] ?? 1) * (FUERZA[nivel] ?? 1);
  const pausa = esRiesgo ? 1 : PAUSA[nivel] ?? 1;
  const ms = PATRONES[patron].ms.map((d, i) => (i % 2 === 0
    ? Math.max(MINIMO_MS, Math.round(d * factor))
    : Math.round(d * pausa)));
  // Algunos navegadores no vibran si ya hay una vibración en curso: se detiene antes
  navigator.vibrate(0);
  return navigator.vibrate(ms);
}
