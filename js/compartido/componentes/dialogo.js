// Diálogos (<dialog>): ayuda contextual y confirmaciones.
// Se abren con showModal (el foco queda dentro y Escape los cierra) y al cerrarse
// el foco vuelve al botón que los abrió (HU-0016, CA063).

/**
 * Abre el diálogo y devuelve una promesa con el value del botón que lo cerró ('' si se cerró con Escape).
 * Responde al envío del formulario del diálogo (al instante) o al evento close (Escape), lo que llegue primero:
 * algunos navegadores entregan close recién en el siguiente dibujado de la página.
 */
export function abrirDialogo(dialogo, origen = document.activeElement) {
  return new Promise((resolver) => {
    let terminado = false;
    const terminar = (valor) => {
      if (terminado) return;
      terminado = true;
      dialogo.removeEventListener('close', alCerrar);
      dialogo.removeEventListener('submit', alEnviar);
      // El foco vuelve cuando el diálogo ya se cerró (mientras está abierto, el resto de la página está inerte)
      setTimeout(() => origen?.focus?.());
      resolver(valor);
    };
    const alCerrar = () => terminar(dialogo.returnValue);
    const alEnviar = (evento) => {
      if (evento.target.method === 'dialog') terminar(evento.submitter?.value ?? '');
    };
    dialogo.addEventListener('close', alCerrar);
    dialogo.addEventListener('submit', alEnviar);
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
