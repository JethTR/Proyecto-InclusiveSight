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

// Intensidad: la Vibration API no deja cambiar la fuerza del motor. Se simula prendiéndolo y apagándolo
// muy rápido (ms encendido / ms apagado en cada ciclo de 50 ms): menos tiempo encendido se siente más suave.
const CICLO = { 1: [30, 20], 2: [40, 10], 3: null }; // 3 = Alta: vibración continua
const MAX_PATRON = 99; // Chrome ignora lo que pase de 99 valores en el patrón

function conIntensidad(ms, intensidad) {
  const ciclo = CICLO[intensidad];
  if (!ciclo) return ms;
  const [encendido, apagado] = ciclo;
  const resultado = [];
  ms.forEach((duracion, i) => {
    if (i % 2 === 1) {
      // Pausa del patrón: queda igual
      resultado.push(duracion);
      return;
    }
    let resto = duracion;
    while (resto > encendido + apagado) {
      resultado.push(encendido, apagado);
      resto -= encendido + apagado;
    }
    resultado.push(Math.max(resto, 20));
  });
  return resultado.length <= MAX_PATRON ? resultado : ms;
}

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
  const factor = esRiesgo ? 1 : DURACION[pulso ?? preferencias.pulso] ?? 1;
  const ms = PATRONES[patron].ms.map((d, i) => (i % 2 === 0 ? Math.round(d * factor) : d));
  // Algunos navegadores no vibran si ya hay una vibración en curso: se detiene antes
  navigator.vibrate(0);
  return navigator.vibrate(esRiesgo ? ms : conIntensidad(ms, intensidad ?? preferencias.intensidad));
}
