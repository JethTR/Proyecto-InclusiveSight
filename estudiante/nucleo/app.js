// Arranque de app.html: pone el modo (invitado o registrado), los datos del usuario,
// conecta los componentes comunes y "Cerrar sesión", y arranca el router.

import { usuarioActual, cerrarSesion } from '../../compartido/servicios/cuenta.js';
import { iniciarCampos } from '../../compartido/componentes/campo.js';
import { iniciarDialogosDeAyuda } from '../../compartido/componentes/dialogo.js';
import { iniciarInterruptores } from '../../compartido/componentes/interruptor.js';
import { cargarDatos, buscarDestino } from '../../compartido/servicios/datos.js';
import { anunciar } from '../../compartido/servicios/anuncios.js';
import { decir } from '../servicios/voz.js';
import { vibrar } from '../servicios/vibracion.js';
import { leerNotificaciones } from '../servicios/preferencias.js';
import { vigilar } from '../servicios/recordatorios.js';
import { iniciarRouter } from '../../compartido/nucleo/router.js';

const RUTA_GUIADA = 'funciones/ruta-guiada/ruta-guiada.html';
const REGISTRADO = 'funciones/registrado/registrado.html';

// Vistas de la app: función que las maneja, fragmento HTML si no están en app.html y si requieren cuenta
const VISTAS = {
  tutorial: { funcion: 'ayuda' },
  buscar: { funcion: 'busqueda' },
  destino: { funcion: 'busqueda' },
  ajustes: { funcion: 'ajustes' },
  'modo-guia': { funcion: 'ajustes' },
  instrucciones: { funcion: 'ajustes' },
  ruta: { funcion: 'ruta-guiada', fragmento: RUTA_GUIADA },
  guia: { funcion: 'ruta-guiada', fragmento: RUTA_GUIADA },
  'contacto-emergencia': { funcion: 'ruta-guiada', fragmento: RUTA_GUIADA },
  'mis-rutas': { funcion: 'mis-rutas', fragmento: REGISTRADO, requiereCuenta: true },
  avisos: { funcion: 'avisos', fragmento: REGISTRADO, requiereCuenta: true },
  cuenta: { funcion: 'cuenta', fragmento: REGISTRADO, requiereCuenta: true },
};

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
    if (texto) decir(texto, { forzar: true });
  }
});

/** Recordatorios (HU-0007): mientras la app está abierta, avisa según el canal que eligió la persona (CA035). */
async function vigilarRecordatorios() {
  const datos = await cargarDatos();
  vigilar({
    tiempoDe: (id) => buscarDestino(datos, id)?.tiempo ?? 0,
    alAvisar: (recordatorio) => {
      const notificaciones = leerNotificaciones();
      if (!notificaciones.recordatorios) return;
      const destino = buscarDestino(datos, recordatorio.destino);
      const texto = `Recordatorio: sal ahora hacia ${destino?.nombre ?? 'tu destino'} para llegar a las ${recordatorio.hora}.`;
      anunciar(texto);
      if (notificaciones.canal === 'voz') decir(texto, { forzar: true });
      if (notificaciones.canal !== 'pantalla') vibrar('llegada', { forzar: true });
    },
  });
}

if (usuario) vigilarRecordatorios();

iniciarRouter({ vistas: VISTAS, vistaInicial: 'buscar', esRegistrado: Boolean(usuario), acceso: 'auth.html#iniciar-sesion' });
