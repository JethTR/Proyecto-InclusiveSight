// Favoritos (HU-0035, HU-0036) y rutas recientes (HU-0037) de la persona con cuenta.
// Los usan la ficha del destino, la guía (al llegar) y Mis rutas.

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
