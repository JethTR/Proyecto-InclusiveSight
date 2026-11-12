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

export function puedeVibrar() {
  return 'vibrate' in navigator;
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
