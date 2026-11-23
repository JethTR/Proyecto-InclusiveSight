// Contacto de emergencia (HU-0034). Lo edita la vista contacto-emergencia y lo muestran los ajustes.

import { leerDelUsuario, guardarDelUsuario } from './datos-usuario.js';

export function leerContacto() {
  return leerDelUsuario('contacto-emergencia', null);
}

export function guardarContacto({ nombre, telefono, avisoRapido }) {
  guardarDelUsuario('contacto-emergencia', { nombre: nombre.trim(), telefono: telefono.trim(), avisoRapido });
}
