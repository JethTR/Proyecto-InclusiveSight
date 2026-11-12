// Cuenta simulada con localStorage. Es el único archivo que toca cuentas: para usar un backend,
// basta con cambiar el cuerpo de estas funciones y mantener lo que devuelven.
// Las contraseñas no se guardan en texto: se guarda su hash SHA-256. Aun así es una simulación, no seguridad real.

import { leer, guardar, borrar } from './almacenamiento.js';

export const MAX_INTENTOS = 3;
export const CLAVE_MINIMA = 8;

const USUARIOS = 'usuarios';
const SESION = 'sesion';
const INTENTOS = 'intentos-fallidos';

function normalizarCorreo(correo) {
  return correo.trim().toLowerCase();
}

async function hash(texto) {
  const datos = new TextEncoder().encode(texto);
  const resumen = await crypto.subtle.digest('SHA-256', datos);
  return [...new Uint8Array(resumen)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Cada aplicación tiene su propia sesión e intentos: entrar al panel no deja la sesión abierta en la app.
// ambito: 'estudiante' (por defecto) o 'panel'.
const claveSesion = (ambito) => (ambito === 'panel' ? `${SESION}-panel` : SESION);
const claveIntentos = (ambito) => (ambito === 'panel' ? `${INTENTOS}-panel` : INTENTOS);

function usuarios() {
  return leer(USUARIOS, []);
}

function buscarUsuario(correo) {
  const c = normalizarCorreo(correo);
  return usuarios().find((u) => u.correo === c) ?? null;
}

/** Usuario con sesión iniciada ({ nombre, correo, rol }) o null si es visitante. */
export function usuarioActual(ambito = 'estudiante') {
  const sesion = leer(claveSesion(ambito));
  if (!sesion) return null;
  const usuario = buscarUsuario(sesion.correo);
  return usuario ? { nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol } : null;
}

export function intentosRestantes(ambito = 'estudiante') {
  return Math.max(0, MAX_INTENTOS - leer(claveIntentos(ambito), 0));
}

export function estaBloqueado(ambito = 'estudiante') {
  return intentosRestantes(ambito) === 0;
}

/** Crea la cuenta e inicia sesión en la app. Devuelve { ok: true } o { error: 'correo-existe' }. */
export async function crearCuenta({ nombre, correo, clave, rol = 'estudiante' }, { iniciar = true } = {}) {
  if (buscarUsuario(correo)) return { error: 'correo-existe' };
  const lista = usuarios();
  lista.push({ nombre: nombre.trim(), correo: normalizarCorreo(correo), clave: await hash(clave), rol });
  guardar(USUARIOS, lista);
  if (iniciar) {
    guardar(SESION, { correo: normalizarCorreo(correo) });
    borrar(INTENTOS);
  }
  return { ok: true };
}

/** Crea la cuenta si no existe, sin iniciar sesión (cuenta de prueba del panel). */
export async function asegurarCuenta(datos) {
  if (!buscarUsuario(datos.correo)) await crearCuenta(datos, { iniciar: false });
}

/**
 * Inicia sesión. Devuelve { ok: true }, { error: 'credenciales', restantes }, { error: 'bloqueado' }
 * o { error: 'no-autorizada' } si la cuenta existe pero no tiene el rol que pide la aplicación (1.5).
 * No dice si falló el correo o la contraseña (HU-0003). Al tercer fallo se bloquea.
 */
export async function iniciarSesion(correo, clave, { ambito = 'estudiante', rol = null } = {}) {
  if (estaBloqueado(ambito)) return { error: 'bloqueado' };
  const usuario = buscarUsuario(correo);
  if (usuario && usuario.clave === (await hash(clave))) {
    if (rol && usuario.rol !== rol) return { error: 'no-autorizada' };
    guardar(claveSesion(ambito), { correo: usuario.correo });
    borrar(claveIntentos(ambito));
    return { ok: true };
  }
  guardar(claveIntentos(ambito), leer(claveIntentos(ambito), 0) + 1);
  const restantes = intentosRestantes(ambito);
  return restantes === 0 ? { error: 'bloqueado' } : { error: 'credenciales', restantes };
}

export function cerrarSesion(ambito = 'estudiante') {
  borrar(claveSesion(ambito));
}

/**
 * Recuperar contraseña. Sí informa si el correo no está registrado (decisión del equipo).
 * En la simulación no se envía ningún correo: pedir el enlace desbloquea el inicio de sesión.
 */
export function recuperarClave(correo) {
  if (!buscarUsuario(correo)) return { error: 'no-registrado' };
  borrar(INTENTOS);
  borrar(claveIntentos('panel'));
  return { ok: true };
}
