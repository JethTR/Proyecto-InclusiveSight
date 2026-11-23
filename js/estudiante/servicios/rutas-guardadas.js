// Favoritos (HU-0035, HU-0036) y rutas recientes (HU-0037).
// Los usan la ficha del destino, la guía (al empezar una ruta), el inicio (Recientes) y Mis rutas.
// Con cuenta se guardan a nombre del usuario; como visitante, solo en este dispositivo (datos-usuario.js).

import { leerDelUsuario, guardarDelUsuario } from './datos-usuario.js';

const MAX_RECIENTES = 10; // CA137

/* ===== Favoritos: [{ id del destino, nombre que le puso la persona }] ===== */

export function favoritos() {
  return leerDelUsuario('favoritos', []);
}

export function esFavorito(id) {
  return favoritos().some((f) => f.id === id);
}

export function agregarFavorito(id, nombre) {
  if (esFavorito(id)) return;
  guardarDelUsuario('favoritos', [...favoritos(), { id, nombre }]);
}

export function quitarFavorito(id) {
  guardarDelUsuario('favoritos', favoritos().filter((f) => f.id !== id));
}

export function renombrarFavorito(id, nombre) {
  guardarDelUsuario('favoritos', favoritos().map((f) => (f.id === id ? { ...f, nombre } : f)));
}

/* ===== Recientes: [{ id del destino, fecha ISO }], del más reciente al más antiguo ===== */

export function recientes() {
  return leerDelUsuario('recientes', []);
}

export function agregarReciente(id) {
  const lista = [{ id, fecha: new Date().toISOString() }, ...recientes().filter((r) => r.id !== id)];
  guardarDelUsuario('recientes', lista.slice(0, MAX_RECIENTES));
}

/** "Hoy · 8:05", "Ayer · 13:10" o "Lun · 16:40" (5.2). */
export function fechaCorta(iso) {
  const fecha = new Date(iso);
  const hora = fecha.toLocaleTimeString('es-PE', { hour: 'numeric', minute: '2-digit', hour12: false });
  const dias = Math.round((new Date().setHours(0, 0, 0, 0) - new Date(iso).setHours(0, 0, 0, 0)) / 86400000);
  if (dias === 0) return `Hoy · ${hora}`;
  if (dias === 1) return `Ayer · ${hora}`;
  const dia = fecha.toLocaleDateString('es-PE', { weekday: 'short' }).replace('.', '');
  return `${dia.charAt(0).toUpperCase()}${dia.slice(1)} · ${hora}`;
}
