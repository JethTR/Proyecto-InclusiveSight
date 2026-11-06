// Interruptores button role="switch": al pulsarlos cambian aria-checked y el texto Sí/No.

export function iniciarInterruptores(raiz = document) {
  raiz.addEventListener('click', (evento) => {
    const boton = evento.target.closest('[role="switch"]');
    if (!boton) return;
    const activo = boton.getAttribute('aria-checked') !== 'true';
    boton.setAttribute('aria-checked', String(activo));
    boton.textContent = activo ? 'Sí' : 'No';
  });
}
