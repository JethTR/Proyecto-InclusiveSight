// Preferencias de la guía (EP-005) y de las notificaciones (HU-0009).
// Las usan ajustes, la guía, la voz y la vibración. Las alertas de peligro no dependen de ellas.

import { leerDelUsuario, guardarDelUsuario } from './datos-usuario.js';

// Valores por defecto del mockup: voz y vibración (CA074), intensidad media, instrucciones breves, velocidad normal
const GUIA_POR_DEFECTO = { modo: 'voz-vibracion', intensidad: 2, detalle: 'breves', velocidad: 2 };
const NOTIFICACIONES_POR_DEFECTO = { zonas: true, recordatorios: true, sistema: false, canal: 'voz' };

export const NOMBRES = {
  modo: { 'voz-vibracion': 'Voz y vibración', vibracion: 'Solo vibración', voz: 'Solo voz' },
  intensidad: { 1: 'Baja', 2: 'Media', 3: 'Alta' },
  velocidad: { 1: 'Lenta', 2: 'Normal', 3: 'Rápida' },
  detalle: { breves: 'Breves', detalladas: 'Detalladas' },
};

export function leerPreferencias() {
  return { ...GUIA_POR_DEFECTO, ...leerDelUsuario('preferencias', {}) };
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
