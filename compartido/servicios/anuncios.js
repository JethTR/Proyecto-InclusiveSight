// Anuncia mensajes en la región .anuncios (role="status", aria-live) para lectores de pantalla.
// Se vacía y se vuelve a llenar para que el mismo texto se anuncie dos veces seguidas si hace falta.

/**
 * Anuncia un mensaje después de cambiar de vista. Sin esto, el anuncio del cambio de vista
 * (el título de la nueva pantalla) lo reemplazaría, por ejemplo en "Recordatorio guardado".
 */
export function anunciarAlLlegar(texto) {
  window.addEventListener('hashchange', () => setTimeout(() => anunciar(texto), 800), { once: true });
}

export function anunciar(texto) {
  const region = document.querySelector('.anuncios');
  if (!region) return;
  region.textContent = '';
  setTimeout(() => {
    region.textContent = texto;
  }, 100);
}
