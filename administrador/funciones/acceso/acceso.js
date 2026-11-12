// 1.5 · Acceso institucional. Usa la cuenta simulada (compartido/servicios/cuenta.js) con su propia sesión ("panel")
// y solo deja entrar a cuentas con rol "administrador". Mismas reglas que la app: error genérico y bloqueo tras 3 intentos.

import * as cuenta from '../../../compartido/servicios/cuenta.js';
import { iniciarCampos, correoValido, mostrarError, limpiarError } from '../../../compartido/componentes/campo.js';

// Cuenta de prueba de desarrollo (documentada en administrador/README.md). Se borra cuando haya backend.
const CUENTA_DE_PRUEBA = {
  nombre: 'Coordinación',
  correo: 'coordinacion@universidad.edu.pe',
  clave: 'Coordinacion2026',
  rol: 'administrador',
};

const $ = (id) => document.getElementById(id);

if (cuenta.usuarioActual('panel')) location.replace('panel.html');

function actualizarBloqueo() {
  const bloqueado = cuenta.estaBloqueado('panel');
  $('acceso-bloqueo').hidden = !bloqueado;
  document.querySelector('[data-formulario="acceso-panel"] [type="submit"]').disabled = bloqueado;
}

async function ingresar(evento) {
  evento.preventDefault();
  const correo = $('acceso-correo');
  const clave = $('acceso-clave');
  $('acceso-error').hidden = true;
  $('acceso-no-autorizada').hidden = true;

  let primero = null;
  const errorCorreo = !correo.value.trim() ? 'Escribe tu correo institucional.' : !correoValido(correo.value) ? 'Escribe un correo válido.' : null;
  if (errorCorreo) {
    mostrarError(correo, $('acceso-correo-error'), errorCorreo);
    primero = correo;
  } else {
    limpiarError(correo, $('acceso-correo-error'));
  }
  if (!clave.value) {
    mostrarError(clave, $('acceso-clave-error'), 'Escribe tu contraseña.');
    primero ??= clave;
  } else {
    limpiarError(clave, $('acceso-clave-error'));
  }
  if (primero) {
    primero.focus();
    return;
  }

  const resultado = await cuenta.iniciarSesion(correo.value, clave.value, { ambito: 'panel', rol: 'administrador' });
  if (resultado.ok) {
    location.href = 'panel.html';
    return;
  }
  clave.value = '';
  if (resultado.error === 'no-autorizada') {
    $('acceso-no-autorizada').hidden = false;
    correo.focus();
  } else if (resultado.error === 'bloqueado') {
    actualizarBloqueo();
    $('acceso-bloqueo').querySelector('a').focus();
  } else {
    document.querySelector('[data-dato="intentos-restantes"]').textContent = resultado.restantes;
    $('acceso-error').hidden = false;
    correo.focus();
  }
}

await cuenta.asegurarCuenta(CUENTA_DE_PRUEBA);
iniciarCampos();
actualizarBloqueo();
document.querySelector('[data-formulario="acceso-panel"]').addEventListener('submit', ingresar);
