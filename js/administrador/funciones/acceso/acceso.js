// 1.5 · Acceso institucional. Usa la cuenta simulada (js/compartido/servicios/cuenta.js) con su propia sesión ("panel")
// y solo deja entrar a cuentas con rol "administrador". Mismas reglas que la app: error genérico y, tras 3 intentos,
// bloqueo de 15 minutos con cuenta regresiva.

import * as cuenta from '../../../compartido/servicios/cuenta.js';
import { iniciarCampos, correoValido, mostrarError, limpiarError } from '../../../compartido/componentes/campo.js';
import { iniciarCuentaRegresiva, detenerCuentaRegresiva } from '../../../compartido/componentes/cuenta-regresiva.js';
import { anunciar } from '../../../compartido/servicios/anuncios.js';

// Cuenta de prueba de desarrollo (documentada en docs/administrador.md). Se borra cuando haya backend.
const CUENTA_DE_PRUEBA = {
  nombre: 'Coordinación',
  correo: 'coordinacion@universidad.edu.pe',
  clave: 'Coordinacion2026',
  rol: 'administrador',
};

const $ = (id) => document.getElementById(id);

if (cuenta.usuarioActual('panel')) location.replace('panel.html');

function actualizarBloqueo() {
  const ms = cuenta.tiempoDeBloqueo('panel');
  const aviso = $('acceso-bloqueo');
  const tiempo = aviso.querySelector('[data-dato="tiempo-bloqueo"]');
  aviso.hidden = ms === 0;
  document.querySelector('[data-formulario="acceso-panel"] [type="submit"]').disabled = ms > 0;
  if (ms > 0) {
    $('acceso-error').hidden = true;
    iniciarCuentaRegresiva(tiempo, Date.now() + ms, {
      alTerminar: () => {
        actualizarBloqueo();
        anunciar('Ya puedes volver a intentar ingresar al panel.');
      },
    });
  } else {
    detenerCuentaRegresiva(tiempo);
  }
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
    $('acceso-bloqueo').focus();
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
