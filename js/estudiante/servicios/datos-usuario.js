// Datos que pertenecen a cada persona (preferencias, favoritos, recientes, recordatorios, contacto).
// Con cuenta se guardan a nombre del usuario; como visitante, solo en este dispositivo.

import { leer, guardar } from '../../compartido/servicios/almacenamiento.js';
import { usuarioActual } from '../../compartido/servicios/cuenta.js';

function clave(nombre) {
  const usuario = usuarioActual();
  return `${nombre}:${usuario ? usuario.correo : 'dispositivo'}`;
}

export function leerDelUsuario(nombre, porDefecto) {
  return leer(clave(nombre), porDefecto);
}

export function guardarDelUsuario(nombre, valor) {
  guardar(clave(nombre), valor);
}
