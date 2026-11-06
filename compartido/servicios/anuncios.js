// Anuncia mensajes en la región .anuncios (role="status", aria-live) para lectores de pantalla.
// Se vacía y se vuelve a llenar para que el mismo texto se anuncie dos veces seguidas si hace falta.

export function anunciar(texto) {
  const region = document.querySelector('.anuncios');
  if (!region) return;
  region.textContent = '';
  setTimeout(() => {
    region.textContent = texto;
  }, 100);
}
