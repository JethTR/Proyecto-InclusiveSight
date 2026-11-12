// Vista avisos: lista de avisos (6.1), aviso de zona cerrada (6.2), programar recordatorio (6.3)
// y preferencias de notificación (6.4). Partes del hash: #avisos/zona-cerrada/<id>, #avisos/programar
// y #avisos/notificaciones. Las zonas cerradas vienen de los datos (las registra el administrador).

import { cargarDatos, buscarDestino } from '../../../compartido/servicios/datos.js';
import { anunciar, anunciarAlLlegar } from '../../../compartido/servicios/anuncios.js';
import { clonar, llenar } from '../../../compartido/componentes/plantillas.js';
import { mostrarError, limpiarError } from '../../../compartido/componentes/campo.js';
import { leerNotificaciones, guardarNotificaciones } from '../../servicios/preferencias.js';
import { recordatorios, agregarRecordatorio, eliminarRecordatorio, horaDeAviso } from '../../servicios/recordatorios.js';
import { decir } from '../../servicios/voz.js';

let datos = { destinos: [], avisos: [] };

const $ = (selector, raiz = document) => raiz.querySelector(selector);
const seccion = () => $('#vista-avisos');

/* ===== 6.1 · Lista ===== */

function filaAviso(aviso) {
  if (aviso.tipo === 'zona-cerrada') {
    const fila = clonar('aviso-destacado', { icono: 'block', titulo: aviso.titulo, detalle: aviso.detalle });
    fila.querySelector('a').href = `#avisos/zona-cerrada/${encodeURIComponent(aviso.id)}`;
    return fila;
  }
  const fila = clonar('aviso', { icono: 'alt_route', titulo: aviso.titulo, detalle: aviso.detalle });
  fila.querySelector('a').href = `#avisos/zona-cerrada/${encodeURIComponent(aviso.zonaId ?? aviso.id)}`;
  return fila;
}

function filaRecordatorio(recordatorio) {
  const destino = buscarDestino(datos, recordatorio.destino);
  const nombre = destino?.nombre ?? 'Destino eliminado';
  const repetir = recordatorio.repetir ? ' · de lunes a viernes' : '';
  const fila = clonar('recordatorio', {
    nombre,
    titulo: `Recordatorio: ${nombre}`,
    detalle: `Llegada a las ${recordatorio.hora} · te avisamos a las ${horaDeAviso(recordatorio, destino?.tiempo ?? 0)}${repetir}`,
  });
  fila.querySelector('[data-accion="eliminar-recordatorio"]').dataset.id = recordatorio.id;
  return fila;
}

function pintarLista() {
  const notificaciones = leerNotificaciones();
  // Con los avisos de zonas desactivados (CA034) no se muestran; las alertas de la guía siguen igual
  const avisos = notificaciones.zonas ? datos.avisos : [];
  const filas = [...avisos.map(filaAviso), ...recordatorios().map(filaRecordatorio)];
  $('[data-lista="avisos"]').replaceChildren(...filas);
  $('[data-mensaje="sin-avisos"]').hidden = filas.length > 0;
}

/* ===== 6.2 · Zona cerrada ===== */

function mostrarZona(id) {
  const aviso = datos.avisos.find((a) => a.id === id && a.tipo === 'zona-cerrada');
  if (!aviso) {
    location.replace('#avisos');
    return;
  }
  const parte = $('[data-parte="zona-cerrada"]');
  llenar(parte, { 'zona-nombre': aviso.zona.nombre, 'zona-detalle': aviso.zona.detalle });
  const alternativa = $('[data-mensaje="ruta-alternativa"]', parte);
  alternativa.hidden = !aviso.alternativa;
  if (aviso.alternativa) {
    llenar(alternativa, { 'alternativa-nombre': aviso.alternativa.nombre, 'alternativa-detalle': aviso.alternativa.detalle });
  }
  $('[data-accion="usar-ruta-alternativa"]', parte).href = `#guia/${encodeURIComponent(aviso.afecta)}`;
}

/* ===== 6.3 · Programar recordatorio ===== */

function llenarDestinos() {
  const select = $('#recordatorio-destino');
  if (select.options.length) return;
  for (const destino of [...datos.destinos].sort((a, b) => a.nombre.localeCompare(b.nombre))) {
    select.append(new Option(destino.nombre, destino.id));
  }
}

function guardarRecordatorio(evento) {
  evento.preventDefault();
  const hora = $('#recordatorio-hora');
  const error = $('#recordatorio-hora-error');
  if (!hora.value) {
    mostrarError(hora, error, 'Elige la hora a la que quieres llegar.');
    hora.focus();
    return;
  }
  limpiarError(hora, error);
  const recordatorio = agregarRecordatorio({
    destino: $('#recordatorio-destino').value,
    hora: hora.value,
    aviso: $('#recordatorio-aviso').value,
    repetir: $('[aria-labelledby="recordatorio-repetir-et"]').getAttribute('aria-checked') === 'true',
  });
  const destino = buscarDestino(datos, recordatorio.destino);
  // CA027 y escenario 1: se confirma a qué hora se avisará
  const texto = `Recordatorio guardado. Te avisaremos a las ${horaDeAviso(recordatorio, destino?.tiempo ?? 0)}.`;
  decir(texto);
  evento.currentTarget.reset();
  pintarLista();
  if (location.hash.startsWith('#avisos/programar')) {
    anunciarAlLlegar(texto);
    location.hash = '#avisos';
  } else {
    anunciar(texto);
  }
}

/* ===== 6.4 · Notificaciones ===== */

const INTERRUPTORES = { zonas: 'notif-zonas-et', recordatorios: 'notif-recordatorios-et', sistema: 'notif-sistema-et' };

function mostrarNotificaciones() {
  const notificaciones = leerNotificaciones();
  for (const [clave, id] of Object.entries(INTERRUPTORES)) {
    const boton = $(`[aria-labelledby="${id}"]`);
    boton.setAttribute('aria-checked', String(notificaciones[clave]));
    boton.textContent = notificaciones[clave] ? 'Sí' : 'No';
  }
  const canal = $(`[data-formulario="notificaciones"] input[name="canal-aviso"][value="${notificaciones.canal}"]`);
  if (canal) canal.checked = true;
}

function guardarFormularioNotificaciones(evento) {
  evento.preventDefault();
  const cambios = {};
  for (const [clave, id] of Object.entries(INTERRUPTORES)) {
    cambios[clave] = $(`[aria-labelledby="${id}"]`).getAttribute('aria-checked') === 'true';
  }
  cambios.canal = $('[data-formulario="notificaciones"] input[name="canal-aviso"]:checked')?.value ?? 'voz';
  guardarNotificaciones(cambios);
  // CA037: se aplican de inmediato
  anunciar('Preferencias de notificación guardadas.');
  decir('Preferencias de notificación guardadas.');
}

/* ===== Conexión con el router ===== */

export async function iniciar() {
  datos = await cargarDatos();
  llenarDestinos();
  $('[data-formulario="recordatorio"]').addEventListener('submit', guardarRecordatorio);
  $('[data-formulario="notificaciones"]').addEventListener('submit', guardarFormularioNotificaciones);

  seccion().addEventListener('click', (evento) => {
    const borrar = evento.target.closest('[data-accion="eliminar-recordatorio"]');
    if (!borrar) return;
    eliminarRecordatorio(borrar.dataset.id);
    pintarLista();
    anunciar('Recordatorio eliminado.');
  });
}

export function mostrar({ parte }) {
  // En celular, el formulario de recordatorio (6.3) se ve solo en #avisos/programar
  seccion().dataset.parteVisible = parte.split('/')[0];
  pintarLista();
  if (parte.startsWith('zona-cerrada/')) mostrarZona(decodeURIComponent(parte.slice('zona-cerrada/'.length)));
  else if (parte === 'notificaciones') mostrarNotificaciones();
}
