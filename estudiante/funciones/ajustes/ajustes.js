// Vistas ajustes (W6, 7.1), modo-guia (7.2) e instrucciones (7.3): preferencias de la guía.
// Las tres vistas comparten este archivo porque editan los mismos datos (estudiante/servicios/preferencias.js).
// El invitado también puede cambiarlas: se guardan solo en este dispositivo.

import { anunciar } from '../../../compartido/servicios/anuncios.js';
import { llenar } from '../../../compartido/componentes/plantillas.js';
import {
  NOMBRES, leerPreferencias, guardarPreferencias, leerNotificaciones, guardarNotificaciones,
} from '../../servicios/preferencias.js';
import { leerContacto } from '../../servicios/contacto-emergencia.js';
import { vibrar, puedeVibrar } from '../../servicios/vibracion.js';
import { decir } from '../../servicios/voz.js';

const $ = (selector, raiz = document) => raiz.querySelector(selector);

// Frases de prueba de 7.3: las mismas que muestra cada opción
const EJEMPLOS = {
  breves: 'Gira a la derecha',
  detalladas: 'Gira a la derecha y avanza 20 metros por el pasillo',
};

/* ===== Radios, interruptores y niveles ===== */

function marcarRadio(formulario, nombre, valor) {
  const radio = formulario.querySelector(`input[name="${nombre}"][value="${valor}"]`);
  if (radio) radio.checked = true;
}

function radioElegido(formulario, nombre) {
  return formulario.querySelector(`input[name="${nombre}"]:checked`)?.value;
}

function ponerInterruptor(idEtiqueta, activo) {
  const boton = $(`[role="switch"][aria-labelledby="${idEtiqueta}"]`);
  if (!boton) return;
  boton.setAttribute('aria-checked', String(activo));
  boton.textContent = activo ? 'Sí' : 'No';
}

function leerInterruptor(idEtiqueta) {
  return $(`[role="switch"][aria-labelledby="${idEtiqueta}"]`)?.getAttribute('aria-checked') === 'true';
}

/** Pone el valor del nivel (1 a 3) en el control deslizante, su texto visible y su aria-valuetext. */
function ponerNivel(control, valor, nombres) {
  const nivel = Math.min(3, Math.max(1, Number(valor)));
  control.value = nivel;
  control.setAttribute('aria-valuetext', nombres[nivel]);
  const salida = document.querySelector(`output[for="${control.id}"]`);
  if (salida) salida.textContent = nombres[nivel];
  return nivel;
}

const NIVELES = {
  'nivel-intensidad': NOMBRES.intensidad,
  'nivel-velocidad': NOMBRES.velocidad,
};

/* ===== Cargar valores en cada vista ===== */

function mostrarAjustes() {
  const p = leerPreferencias();
  const notificaciones = leerNotificaciones();
  const contacto = leerContacto();

  // 7.1 · Lista (celular)
  llenar($('#vista-ajustes'), {
    'ajuste-modo': NOMBRES.modo[p.modo],
    'ajuste-intensidad': NOMBRES.intensidad[p.intensidad],
    'ajuste-instrucciones': `${NOMBRES.detalle[p.detalle]} · velocidad ${NOMBRES.velocidad[p.velocidad].toLowerCase()}`,
    'ajuste-contacto': contacto?.nombre ?? '',
  });

  // W6 · Preferencias de la guía (escritorio)
  marcarRadio($('[data-formulario="preferencias"]'), 'modo', p.modo);
  ponerInterruptor('pref-zonas-et', notificaciones.zonas);
  ponerInterruptor('pref-recordatorios-et', notificaciones.recordatorios);
}

function mostrarModoGuia() {
  const p = leerPreferencias();
  marcarRadio($('[data-formulario="modo-guia"]'), 'modo', p.modo);
  ponerNivel($('#nivel-intensidad'), p.intensidad, NOMBRES.intensidad);
}

function mostrarInstrucciones() {
  const p = leerPreferencias();
  marcarRadio($('[data-formulario="instrucciones"]'), 'detalle', p.detalle);
  ponerNivel($('#nivel-velocidad'), p.velocidad, NOMBRES.velocidad);
}

/* ===== Guardar ===== */

function confirmar() {
  anunciar('Ajustes guardados.');
}

function guardarPreferenciasEscritorio(evento) {
  evento.preventDefault();
  const formulario = evento.currentTarget;
  guardarPreferencias({ modo: radioElegido(formulario, 'modo') });
  guardarNotificaciones({ zonas: leerInterruptor('pref-zonas-et'), recordatorios: leerInterruptor('pref-recordatorios-et') });
  confirmar();
}

function guardarModoGuia(evento) {
  evento.preventDefault();
  guardarPreferencias({
    modo: radioElegido(evento.currentTarget, 'modo'),
    intensidad: Number($('#nivel-intensidad').value),
  });
  confirmar();
}

function guardarInstrucciones(evento) {
  evento.preventDefault();
  guardarPreferencias({
    detalle: radioElegido(evento.currentTarget, 'detalle'),
    velocidad: Number($('#nivel-velocidad').value),
  });
  confirmar();
}

/* ===== Pruebas ===== */

function probarVibracion() {
  const intensidad = Number($('#nivel-intensidad').value);
  // CA065: al elegir la intensidad se reproduce un patrón de prueba
  if (!vibrar('derecha', { forzar: true, intensidad }) && !puedeVibrar()) {
    anunciar('Este dispositivo no permite vibrar desde el navegador.');
  }
}

function escucharEjemplo() {
  const detalle = radioElegido($('[data-formulario="instrucciones"]'), 'detalle') ?? 'breves';
  // CA071: frase de prueba con la velocidad elegida, aunque todavía no se haya guardado
  decir(EJEMPLOS[detalle], { forzar: true, velocidad: Number($('#nivel-velocidad').value) });
}

/* ===== Conexión con el router ===== */

export function iniciar() {
  $('[data-formulario="preferencias"]').addEventListener('submit', guardarPreferenciasEscritorio);
  $('[data-formulario="modo-guia"]').addEventListener('submit', guardarModoGuia);
  $('[data-formulario="instrucciones"]').addEventListener('submit', guardarInstrucciones);

  // Botones − y + de los niveles
  document.addEventListener('click', (evento) => {
    const boton = evento.target.closest('[data-accion="bajar"], [data-accion="subir"]');
    if (boton) {
      const control = document.getElementById(boton.getAttribute('aria-controls'));
      const paso = boton.dataset.accion === 'subir' ? 1 : -1;
      const nivel = ponerNivel(control, Number(control.value) + paso, NIVELES[control.id]);
      anunciar(NIVELES[control.id][nivel]);
      if (control.id === 'nivel-intensidad') probarVibracion();
      return;
    }
    if (evento.target.closest('[data-accion="probar-vibracion"]')) probarVibracion();
    if (evento.target.closest('[data-accion="escuchar-ejemplo"]')) escucharEjemplo();
  });

  for (const id of Object.keys(NIVELES)) {
    const control = document.getElementById(id);
    control.addEventListener('input', () => ponerNivel(control, control.value, NIVELES[id]));
    if (id === 'nivel-intensidad') control.addEventListener('change', probarVibracion);
  }
}

export function mostrar({ vista }) {
  if (vista === 'ajustes') mostrarAjustes();
  else if (vista === 'modo-guia') mostrarModoGuia();
  else if (vista === 'instrucciones') mostrarInstrucciones();
}
