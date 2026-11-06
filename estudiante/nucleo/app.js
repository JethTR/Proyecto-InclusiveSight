// Arranque de app.html: pone el modo (invitado o registrado), los datos del usuario,
// conecta los componentes comunes y "Cerrar sesión", y arranca el router.

import { usuarioActual, cerrarSesion } from '../../compartido/servicios/cuenta.js';
import { iniciarCampos } from '../../compartido/componentes/campo.js';
import { iniciarDialogosDeAyuda } from '../../compartido/componentes/dialogo.js';
import { iniciarInterruptores } from '../../compartido/componentes/interruptor.js';
import { decir } from '../servicios/voz.js';
import { iniciarRouter } from './router.js';

const usuario = usuarioActual();
document.body.dataset.modo = usuario ? 'registrado' : 'invitado';

/** Llena el nombre y el correo del usuario (también en los fragmentos que se cargan después). */
function llenarUsuario() {
  if (!usuario) return;
  for (const el of document.querySelectorAll('[data-dato="usuario-nombre"]')) el.textContent = usuario.nombre;
  for (const el of document.querySelectorAll('[data-dato="usuario-correo"]')) el.textContent = usuario.correo;
}

llenarUsuario();
document.addEventListener('fragmento-cargado', llenarUsuario);

iniciarCampos();
iniciarDialogosDeAyuda();
iniciarInterruptores();

document.addEventListener('click', (evento) => {
  if (evento.target.closest('[data-accion="cerrar-sesion"]')) {
    cerrarSesion();
    location.href = 'index.html';
    return;
  }
  // "Escuchar ayuda": lee en voz alta el texto de ayuda del mismo cuadro
  const escuchar = evento.target.closest('[data-accion="escuchar-ayuda"]');
  if (escuchar) {
    const texto = escuchar.closest('dialog, .tarjeta')?.querySelector('p')?.textContent;
    if (texto) decir(texto);
  }
});

iniciarRouter({ esRegistrado: Boolean(usuario) });
