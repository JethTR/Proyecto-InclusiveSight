// Diálogos (<dialog>): ayuda contextual y confirmaciones.
// Se abren con showModal (el foco queda dentro y Escape los cierra) y al cerrarse
// el foco vuelve al botón que los abrió (HU-0016, CA063).

/** Abre el diálogo y devuelve una promesa con el value del botón que lo cerró ('' si se cerró con Escape). */
export function abrirDialogo(dialogo, origen = document.activeElement) {
  return new Promise((resolver) => {
    dialogo.addEventListener('close', () => {
      origen?.focus?.();
      resolver(dialogo.returnValue);
    }, { once: true });
    dialogo.returnValue = '';
    dialogo.showModal();
  });
}

/** Conecta los botones [data-accion="abrir-ayuda"] con el diálogo que indica su aria-controls. */
export function iniciarDialogosDeAyuda(raiz = document) {
  raiz.addEventListener('click', (evento) => {
    const boton = evento.target.closest('[data-accion="abrir-ayuda"]');
    if (!boton) return;
    const dialogo = document.getElementById(boton.getAttribute('aria-controls'));
    if (dialogo) abrirDialogo(dialogo, boton);
  });
}
