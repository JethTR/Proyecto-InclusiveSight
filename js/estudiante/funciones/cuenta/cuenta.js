// Vista cuenta (1.4): "Mis datos" muestra u oculta el nombre, el correo y el tipo de cuenta.
// El nombre y el correo los llena nucleo/app.js; "Cerrar sesión" también lo conecta app.js.

export function iniciar() {
  document.querySelector('#vista-cuenta').addEventListener('click', (evento) => {
    const boton = evento.target.closest('[data-accion="ver-mis-datos"]');
    if (!boton) return;
    const datos = document.getElementById(boton.getAttribute('aria-controls'));
    const abierto = boton.getAttribute('aria-expanded') !== 'true';
    boton.setAttribute('aria-expanded', String(abierto));
    datos.hidden = !abierto;
  });
}
