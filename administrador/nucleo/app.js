// Arranque de panel.html: comprueba la sesión del panel, pone el nombre del usuario y el contador de alertas,
// conecta "Cerrar sesión" y arranca el router compartido.

import { usuarioActual, cerrarSesion } from '../../compartido/servicios/cuenta.js';
import { cargarCampus } from '../../compartido/servicios/campus.js';
import { iniciarCampos } from '../../compartido/componentes/campo.js';
import { iniciarInterruptores } from '../../compartido/componentes/interruptor.js';
import { llenar } from '../../compartido/componentes/plantillas.js';
import { iniciarRouter } from '../../compartido/nucleo/router.js';
import { contarPuntos } from '../servicios/estado-puntos.js';

const VISTAS = {
  resumen: { funcion: 'resumen' },
  puntos: { funcion: 'puntos' },
  mapa: { funcion: 'mapa' },
};

const usuario = usuarioActual('panel');
if (!usuario || usuario.rol !== 'administrador') {
  location.replace('index.html');
} else {
  llenar(document, { 'usuario-nombre': usuario.nombre });

  /** Alertas: puntos inactivos y con batería baja. */
  const actualizarAlertas = async () => {
    const { mapa } = await cargarCampus();
    const cuenta = contarPuntos(mapa);
    llenar(document, { alertas: String(cuenta.inactivo + cuenta.bateria) });
  };
  actualizarAlertas();
  document.addEventListener('campus-cambiado', actualizarAlertas);

  iniciarCampos();
  iniciarInterruptores();
  document.addEventListener('click', (evento) => {
    if (!evento.target.closest('[data-accion="cerrar-sesion"]')) return;
    cerrarSesion('panel');
    location.href = 'index.html';
  });

  iniciarRouter({
    vistas: VISTAS,
    vistaInicial: 'resumen',
    esRegistrado: true,
    acceso: 'index.html',
    nombreApp: 'Panel InclusiveSight',
  });
}
