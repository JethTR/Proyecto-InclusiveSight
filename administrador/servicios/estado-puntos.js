// Estado de los puntos de referencia (HU-0040). Lo usan Resumen y Puntos de referencia.
// El estado no depende solo del color: siempre lleva texto e ícono (CA150).

import { elementos } from '../../compartido/mapa/geojson.js';

export const BATERIA_BAJA = 20; // %

export const ESTADOS = {
  activo: { texto: 'Activo', icono: 'check_circle' },
  inactivo: { texto: 'Inactivo', icono: 'warning' },
  bateria: { texto: 'Batería baja', icono: 'battery_alert' },
};

export function estadoDe(punto) {
  const p = punto.properties;
  if (p.activo === false) return 'inactivo';
  if ((p.bateria ?? 100) < BATERIA_BAJA) return 'bateria';
  return 'activo';
}

/** { todos, activo, inactivo, bateria } */
export function contarPuntos(mapa) {
  const cuenta = { todos: 0, activo: 0, inactivo: 0, bateria: 0 };
  for (const punto of elementos(mapa, 'punto')) {
    cuenta.todos += 1;
    cuenta[estadoDe(punto)] += 1;
  }
  return cuenta;
}

/** "15 min", "2 h", "3 d" desde la última señal, o "Sin datos" si el punto nunca la reportó. */
export function tiempoDesde(iso) {
  if (!iso) return 'Sin datos';
  const minutos = Math.max(0, Math.round((Date.now() - new Date(iso)) / 60000));
  if (minutos < 60) return `${minutos} min`;
  if (minutos < 60 * 24) return `${Math.round(minutos / 60)} h`;
  return `${Math.round(minutos / (60 * 24))} d`;
}

export function ubicacionDe(punto) {
  return `${punto.properties.referencia} · piso ${punto.properties.piso}`;
}

/** Avisa a las demás partes del panel que el campus cambió (por ejemplo, el contador de alertas). */
export function avisarCambio() {
  document.dispatchEvent(new CustomEvent('campus-cambiado'));
}
