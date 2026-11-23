// Cuenta regresiva visible ("14 min 05 s") hasta que termine un bloqueo. La usan el inicio de sesión de la app
// y el acceso del panel.
//
// Accesibilidad: el texto cambia cada segundo, así que NO debe estar dentro de una región aria-live
// (el lector de pantalla lo leería sin parar). Quien la usa anuncia el bloqueo una vez y, al terminar,
// alTerminar() avisa que ya se puede volver a intentar.

/** "14 min 05 s", "45 s". Se lee bien en pantalla y con lector de pantalla. */
export function formatoTiempo(ms) {
  const segundos = Math.max(0, Math.ceil(ms / 1000));
  const min = Math.floor(segundos / 60);
  const seg = segundos % 60;
  return min > 0 ? `${min} min ${String(seg).padStart(2, '0')} s` : `${seg} s`;
}

/** "15 minutos", "1 minuto", "40 segundos": para anunciarlo una sola vez. */
export function tiempoEnPalabras(ms) {
  const segundos = Math.max(1, Math.ceil(ms / 1000));
  if (segundos < 60) return `${segundos} segundo${segundos === 1 ? '' : 's'}`;
  const min = Math.ceil(segundos / 60);
  return `${min} minuto${min === 1 ? '' : 's'}`;
}

const activas = new WeakMap();

/**
 * Muestra en `elemento` el tiempo que falta hasta `hasta` (milisegundos de Date.now()).
 * Se calcula con la hora real en cada vuelta, así no se atrasa si el celular suspende la pestaña.
 */
export function iniciarCuentaRegresiva(elemento, hasta, { alTerminar } = {}) {
  detenerCuentaRegresiva(elemento);
  const pintar = () => {
    const falta = hasta - Date.now();
    elemento.textContent = formatoTiempo(falta);
    if (falta <= 0) {
      detenerCuentaRegresiva(elemento);
      alTerminar?.();
    }
  };
  pintar();
  activas.set(elemento, setInterval(pintar, 250));
}

export function detenerCuentaRegresiva(elemento) {
  clearInterval(activas.get(elemento));
  activas.delete(elemento);
}
