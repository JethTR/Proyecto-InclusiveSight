// Plantillas (<template data-plantilla>) y textos marcados con data-dato.

/** Pone cada valor en los elementos [data-dato="clave"] que haya dentro de raiz. */
export function llenar(raiz, valores) {
  for (const [clave, valor] of Object.entries(valores)) {
    for (const el of raiz.querySelectorAll(`[data-dato="${clave}"]`)) el.textContent = valor ?? '';
  }
}

/**
 * Clona una plantilla y llena sus data-dato. Si hay "nombre", los elementos con data-dato-aria-label
 * reciben un aria-label completo, por ejemplo "Ver ruta a Biblioteca central".
 */
export function clonar(plantilla, valores = {}) {
  const copia = document.querySelector(`template[data-plantilla="${plantilla}"]`).content.cloneNode(true);
  llenar(copia, valores);
  if (valores.nombre) {
    for (const el of copia.querySelectorAll('[data-dato-aria-label]')) {
      el.setAttribute('aria-label', `${el.dataset.datoAriaLabel} ${valores.nombre}`);
    }
  }
  return copia;
}
