// Preferencias de la guía (EP-005) y de las notificaciones (HU-0009).
// Las usan ajustes, la guía, la voz y la vibración. Las alertas de peligro no dependen de ellas.

import { leerDelUsuario, guardarDelUsuario } from './datos-usuario.js';

// Valores por defecto del mockup: voz y vibración (CA074), pulso medio, intensidad media,
// instrucciones breves y voz a velocidad normal (x1)
const GUIA_POR_DEFECTO = { modo: 'voz-vibracion', pulso: 'medio', intensidad: 2, detalle: 'breves', velocidadVoz: 1 };
const NOTIFICACIONES_POR_DEFECTO = { zonas: true, recordatorios: true, sistema: false, canal: 'voz' };

// Velocidades de la voz: de x0.5 a x2, de 0.25 en 0.25
export const VELOCIDADES = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

/** "Lenta", "Normal" o "Rápida" según el multiplicador. */
function nombreVelocidad(x) {
  if (x < 1) return x <= 0.5 ? 'Muy lenta' : 'Lenta';
  if (x === 1) return 'Normal';
  return x >= 1.75 ? 'Muy rápida' : 'Rápida';
}

/** "x1", "x1.5", "x0.75" */
export function multiplicador(x) {
  return `x${Number(x).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

export const NOMBRES = {
  modo: { 'voz-vibracion': 'Voz y vibración', vibracion: 'Solo vibración', voz: 'Solo voz' },
  pulso: { largo: 'Pulso largo', medio: 'Pulso medio', suave: 'Pulso suave' },
  intensidad: { 1: 'Baja', 2: 'Media', 3: 'Alta' },
  velocidad: nombreVelocidad,
  detalle: { breves: 'Breves', detalladas: 'Detalladas' },
};

// Antes la velocidad se guardaba como nivel 1, 2 o 3 (lenta, normal, rápida)
const VELOCIDAD_ANTERIOR = { 1: 0.75, 2: 1, 3: 1.5 };

export function leerPreferencias() {
  const guardadas = leerDelUsuario('preferencias', {});
  const preferencias = { ...GUIA_POR_DEFECTO, ...guardadas };
  if (guardadas.velocidadVoz === undefined && guardadas.velocidad !== undefined) {
    preferencias.velocidadVoz = VELOCIDAD_ANTERIOR[guardadas.velocidad] ?? 1;
  }
  delete preferencias.velocidad;
  return preferencias;
}

export function guardarPreferencias(cambios) {
  guardarDelUsuario('preferencias', { ...leerPreferencias(), ...cambios });
}

export function leerNotificaciones() {
  return { ...NOTIFICACIONES_POR_DEFECTO, ...leerDelUsuario('notificaciones', {}) };
}

export function guardarNotificaciones(cambios) {
  guardarDelUsuario('notificaciones', { ...leerNotificaciones(), ...cambios });
}
