// auth.html: muestra la sección según el hash (#iniciar-sesion, #crear-cuenta, #recuperar),
// valida los formularios y usa la cuenta simulada para crear cuenta, iniciar sesión y recuperar contraseña.

import * as cuenta from '../../../compartido/servicios/cuenta.js';
import { anunciar } from '../../../compartido/servicios/anuncios.js';
import { iniciarCampos, correoValido, mostrarError, limpiarError } from '../../../compartido/componentes/campo.js';

const SECCIONES = ['iniciar-sesion', 'crear-cuenta', 'recuperar'];

const MENSAJES = {
  correoVacio: 'Escribe tu correo.',
  correoInvalido: 'Escribe un correo válido, por ejemplo nombre@correo.com.',
  claveVacia: 'Escribe tu contraseña.',
  claveCorta: `La contraseña debe tener al menos ${cuenta.CLAVE_MINIMA} caracteres.`,
  nombreVacio: 'Escribe tu nombre.',
  correoExiste: 'Ya existe una cuenta con este correo. Inicia sesión o usa otro correo.',
};

const $ = (id) => document.getElementById(id);

/* ===== Secciones por hash ===== */

function mostrarSeccion(primeraVez = false) {
  const nombre = location.hash.slice(1);
  const actual = SECCIONES.includes(nombre) ? nombre : 'iniciar-sesion';
  for (const s of document.querySelectorAll('.vista[data-vista]')) s.hidden = s.dataset.vista !== actual;
  const titulo = $(`titulo-${actual}`);
  document.title = `${titulo.textContent} · InclusiveSight`;
  if (actual === 'iniciar-sesion') actualizarBloqueo();
  // Al cambiar de sección (no al cargar), el foco va al título y se anuncia
  if (!primeraVez) {
    titulo.focus();
    anunciar(titulo.textContent);
  }
}

/* ===== Validación ===== */

/** Valida cada [campo, mensaje, comprobar]. Muestra los errores y enfoca el primer campo con error. */
function validar(reglas) {
  let primero = null;
  for (const [campo, mensaje, comprobar] of reglas) {
    const error = comprobar(campo.value);
    if (error) {
      mostrarError(campo, mensaje, error);
      primero ??= campo;
    } else {
      limpiarError(campo, mensaje);
    }
  }
  primero?.focus();
  return !primero;
}

const reglaCorreo = (valor) => (!valor.trim() ? MENSAJES.correoVacio : !correoValido(valor) ? MENSAJES.correoInvalido : null);

/* ===== 1.2 · Iniciar sesión ===== */

function actualizarBloqueo() {
  const bloqueado = cuenta.estaBloqueado();
  $('ingreso-bloqueo').hidden = !bloqueado;
  const enviar = document.querySelector('[data-formulario="ingreso"] [type="submit"]');
  enviar.disabled = bloqueado;
  if (bloqueado) $('ingreso-error').hidden = true;
}

async function enviarIngreso(evento) {
  evento.preventDefault();
  const correo = $('ingreso-correo');
  const clave = $('ingreso-clave');
  $('ingreso-error').hidden = true;
  const valido = validar([
    [correo, $('ingreso-correo-error'), reglaCorreo],
    [clave, $('ingreso-clave-error'), (v) => (!v ? MENSAJES.claveVacia : null)],
  ]);
  if (!valido) return;

  const resultado = await cuenta.iniciarSesion(correo.value, clave.value);
  if (resultado.ok) {
    location.href = 'app.html';
    return;
  }
  clave.value = '';
  if (resultado.error === 'bloqueado') {
    // role="alert" anuncia el bloqueo; el foco va al enlace para recuperar la contraseña
    actualizarBloqueo();
    $('ingreso-bloqueo').querySelector('a').focus();
    return;
  }
  // Error genérico: no dice qué dato falló. role="alert" lo anuncia
  document.querySelector('[data-dato="intentos-restantes"]').textContent = resultado.restantes;
  $('ingreso-error').hidden = false;
  correo.focus();
}

/* ===== 1.1 · Crear cuenta ===== */

async function enviarRegistro(evento) {
  evento.preventDefault();
  const nombre = $('registro-nombre');
  const correo = $('registro-correo');
  const clave = $('registro-clave');
  const valido = validar([
    [nombre, $('registro-nombre-error'), (v) => (!v.trim() ? MENSAJES.nombreVacio : null)],
    [correo, $('registro-correo-error'), reglaCorreo],
    [clave, $('registro-clave-error'), (v) => (v.length < cuenta.CLAVE_MINIMA ? MENSAJES.claveCorta : null)],
  ]);
  if (!valido) return;

  const resultado = await cuenta.crearCuenta({ nombre: nombre.value, correo: correo.value, clave: clave.value });
  if (resultado.error === 'correo-existe') {
    mostrarError(correo, $('registro-correo-error'), MENSAJES.correoExiste);
    correo.focus();
    return;
  }
  location.href = 'app.html';
}

/* ===== 1.3 · Recuperar contraseña ===== */

function enviarRecuperar(evento) {
  evento.preventDefault();
  const correo = $('recuperar-correo');
  const error = $('recuperar-correo-error');
  const confirmacion = document.querySelector('[data-mensaje="confirmacion"]');
  confirmacion.hidden = true;
  error.textContent = 'Este correo no está registrado.';
  if (!validar([[correo, error, reglaCorreo]])) return;

  if (cuenta.recuperarClave(correo.value).error) {
    mostrarError(correo, error, 'Este correo no está registrado.');
    correo.focus();
    return;
  }
  limpiarError(correo, error);
  confirmacion.hidden = false;
  anunciar('Revisa tu correo. Te enviamos un enlace. Tiene vigencia limitada.');
}

/* ===== Arranque ===== */

iniciarCampos();
document.querySelector('[data-formulario="ingreso"]').addEventListener('submit', enviarIngreso);
document.querySelector('[data-formulario="registro"]').addEventListener('submit', enviarRegistro);
document.querySelector('[data-formulario="recuperar"]').addEventListener('submit', enviarRecuperar);

// "Seguir como invitado" deja la sesión cerrada
document.addEventListener('click', (evento) => {
  if (evento.target.closest('[data-accion="entrar-invitado"]')) cuenta.cerrarSesion();
});

window.addEventListener('hashchange', () => mostrarSeccion());
mostrarSeccion(true);
