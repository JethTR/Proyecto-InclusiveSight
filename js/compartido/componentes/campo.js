// Campos de formulario: botón "Mostrar" de la contraseña y mensajes de error accesibles.
// El error se conecta al campo (aria-invalid y aria-describedby) solo mientras se muestra.

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function correoValido(correo) {
  return CORREO_VALIDO.test(correo.trim());
}

/** Conecta los botones [data-accion="mostrar-clave"] que haya dentro de raiz. */
export function iniciarCampos(raiz = document) {
  raiz.addEventListener('click', (evento) => {
    const boton = evento.target.closest('[data-accion="mostrar-clave"]');
    if (!boton) return;
    const campo = document.getElementById(boton.getAttribute('aria-controls'));
    const mostrar = campo.type === 'password';
    campo.type = mostrar ? 'text' : 'password';
    boton.setAttribute('aria-pressed', String(mostrar));
    // El texto visible cambia; el oculto (" contraseña") se mantiene
    boton.firstChild.textContent = mostrar ? 'Ocultar' : 'Mostrar';
  });
}

function agregarId(lista, id) {
  return [...new Set([...(lista ?? '').split(' ').filter(Boolean), id])].join(' ');
}

function quitarId(lista, id) {
  return (lista ?? '').split(' ').filter((x) => x && x !== id).join(' ');
}

/** Muestra el error del campo. Si texto se omite, usa el texto que ya tiene el mensaje. */
export function mostrarError(campo, mensaje, texto) {
  if (texto !== undefined) mensaje.textContent = texto;
  mensaje.hidden = false;
  campo.setAttribute('aria-invalid', 'true');
  campo.setAttribute('aria-describedby', agregarId(campo.getAttribute('aria-describedby'), mensaje.id));
}

export function limpiarError(campo, mensaje) {
  mensaje.hidden = true;
  campo.removeAttribute('aria-invalid');
  const resto = quitarId(campo.getAttribute('aria-describedby'), mensaje.id);
  if (resto) campo.setAttribute('aria-describedby', resto);
  else campo.removeAttribute('aria-describedby');
}
