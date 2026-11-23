// Puntos de referencia: lista con búsqueda y filtros (9.2, HU-0040), registrar (9.3, HU-0038)
// y editar punto y mensaje (9.4, HU-0039 y HU-0041). Los puntos se guardan dentro del mapa GeoJSON del campus,
// así que la app del estudiante los usa en cuanto se guardan (CA154).

import { cargarCampus, guardarCampus } from '../../../compartido/servicios/campus.js';
import { anunciar, anunciarAlLlegar } from '../../../compartido/servicios/anuncios.js';
import { elementos, buscarElemento } from '../../../compartido/mapa/geojson.js';
import { dibujarMapa } from '../../../compartido/mapa/dibujar.js';
import { clonar, llenar } from '../../../compartido/componentes/plantillas.js';
import { mostrarError, limpiarError } from '../../../compartido/componentes/campo.js';
import {
  ESTADOS, BATERIA_BAJA, estadoDe, contarPuntos, tiempoDesde, ubicacionDe, avisarCambio,
} from '../../servicios/estado-puntos.js';

const LARGO_MENSAJE = 120; // CA152

let campus = null;
let editando = null;     // código del punto que se edita
let nuevaUbicacion = null; // [lon, lat] del punto que se registra
const estado = { filtro: 'todos', consulta: '' };

const $ = (selector, raiz = document) => raiz.querySelector(selector);
const seccion = () => $('#vista-puntos');

/* ===== 9.2 · Lista ===== */

function coincide(punto) {
  const p = punto.properties;
  if (estado.filtro !== 'todos' && estadoDe(punto) !== estado.filtro) return false;
  const consulta = estado.consulta.trim().toLowerCase();
  return !consulta || `${p.id} ${p.referencia} ${p.tecnologia}`.toLowerCase().includes(consulta);
}

function pintarLista({ anunciarConteo = false } = {}) {
  const cuenta = contarPuntos(campus.mapa);
  llenar(seccion(), Object.fromEntries(Object.entries(cuenta).map(([clave, n]) => [`total-${clave}`, String(n)])));
  for (const chip of seccion().querySelectorAll('[data-filtro]')) {
    chip.setAttribute('aria-pressed', String(chip.dataset.filtro === estado.filtro));
  }

  const puntos = elementos(campus.mapa, 'punto').filter(coincide);
  const filas = puntos.map((punto) => {
    const p = punto.properties;
    const estadoPunto = ESTADOS[estadoDe(punto)];
    const fila = clonar('fila-punto', {
      nombre: p.id,
      codigo: p.id,
      ubicacion: ubicacionDe(punto),
      tipo: p.tecnologia,
      bateria: p.bateria !== undefined ? `${p.bateria} %` : '—',
      estado: estadoPunto.texto,
      'estado-icono': estadoPunto.icono,
    });
    fila.querySelector('.estado').dataset.estado = estadoDe(punto);
    fila.querySelector('a').href = `#puntos/editar/${encodeURIComponent(p.id)}`;
    return fila;
  });
  $('[data-lista="puntos"]').replaceChildren(...filas);
  $('[data-mensaje="sin-puntos"]').hidden = filas.length > 0;
  if (anunciarConteo) llenar(seccion(), { 'conteo-puntos': `${filas.length} ${filas.length === 1 ? 'punto' : 'puntos'}` });
}

/* ===== 9.3 · Registrar punto ===== */

function opcionesEdificios() {
  const select = $('#punto-ubicacion');
  const opciones = [];
  for (const edificio of elementos(campus.mapa, 'edificio')) {
    for (const piso of edificio.properties.pisos) {
      opciones.push(new Option(`${edificio.properties.nombre} · Piso ${piso}`, `${edificio.properties.id}|${piso}`));
    }
  }
  opciones.push(new Option('Exteriores · Piso 1', '|1'));
  select.replaceChildren(...opciones);
}

function pisoElegido() {
  const [edificio, piso] = $('#punto-ubicacion').value.split('|');
  return { edificio: edificio || null, piso: Number(piso) || 1 };
}

function dibujarRegistro() {
  const { edificio, piso } = pisoElegido();
  dibujarMapa($('[data-mapa="registrar"]'), campus.mapa, {
    piso,
    destacar: edificio,
    puntos: true,
    marcador: nuevaUbicacion,
    alTocar: (lonLat) => {
      ponerUbicacion(lonLat);
      anunciar('Punto colocado en el mapa.');
    },
  });
  llenar(seccion(), {
    'mapa-registrar-descripcion': nuevaUbicacion
      ? `Nuevo punto en latitud ${nuevaUbicacion[1].toFixed(6)}, longitud ${nuevaUbicacion[0].toFixed(6)}.`
      : `Mapa del piso ${piso}. Todavía no colocaste el punto.`,
  });
}

function ponerUbicacion(lonLat) {
  nuevaUbicacion = lonLat;
  $('#punto-latitud').value = lonLat[1].toFixed(7);
  $('#punto-longitud').value = lonLat[0].toFixed(7);
  dibujarRegistro();
}

function prepararRegistro() {
  $('[data-formulario="registrar-punto"]').reset();
  for (const id of ['punto-codigo', 'punto-referencia']) limpiarError($(`#${id}`), $(`#${id}-error`));
  $('#punto-coordenadas-error').hidden = true;
  nuevaUbicacion = null;
  opcionesEdificios();
  dibujarRegistro();
}

function registrar(evento) {
  evento.preventDefault();
  const codigo = $('#punto-codigo');
  const referencia = $('#punto-referencia');
  const id = codigo.value.trim().toUpperCase();
  const errores = [
    [codigo, $('#punto-codigo-error'),
      !id ? 'Escribe el código del punto.'
        : buscarElemento(campus.mapa, 'punto', id) ? 'Ya hay un punto registrado con este código.' : null], // CA142
    [referencia, $('#punto-referencia-error'), referencia.value.trim() ? null : 'Escribe una referencia del lugar.'],
  ];
  let primero = null;
  for (const [campo, error, texto] of errores) {
    if (texto) {
      mostrarError(campo, error, texto);
      primero ??= campo;
    } else {
      limpiarError(campo, error);
    }
  }
  const lat = Number($('#punto-latitud').value);
  const lon = Number($('#punto-longitud').value);
  const sinUbicacion = !$('#punto-latitud').value || !$('#punto-longitud').value || Number.isNaN(lat) || Number.isNaN(lon);
  const errorUbicacion = $('#punto-coordenadas-error');
  errorUbicacion.hidden = !sinUbicacion;
  errorUbicacion.textContent = sinUbicacion ? 'Toca el mapa o escribe la latitud y la longitud del punto.' : '';
  if (sinUbicacion) primero ??= $('#punto-latitud');
  if (primero) {
    primero.focus();
    return;
  }

  const { edificio, piso } = pisoElegido();
  campus.mapa.features.push({
    type: 'Feature',
    properties: {
      tipo: 'punto',
      id,
      tecnologia: $('[data-formulario="registrar-punto"] input[name="tecnologia"]:checked').value,
      edificio,
      piso,
      referencia: referencia.value.trim(),
      mensaje: '',
      activo: true,
      bateria: 100,
      ultima_senal: new Date().toISOString(),
    },
    geometry: { type: 'Point', coordinates: [lon, lat] },
  });
  guardarCampus(campus, { evento: 'Punto registrado', detalle: `${id} · ${referencia.value.trim()}` });
  avisarCambio();
  anunciarAlLlegar(`Punto ${id} registrado.`); // CA (HU-0038, escenario 1): mensaje de confirmación
  location.hash = '#puntos';
}

/* ===== 9.4 · Editar punto y mensaje ===== */

function interruptorActivo() {
  return $('[aria-labelledby="punto-activo-et"]');
}

function mostrarEditar(id) {
  const punto = buscarElemento(campus.mapa, 'punto', id);
  if (!punto) {
    location.replace('#puntos');
    return;
  }
  editando = id;
  const p = punto.properties;
  const activo = p.activo !== false;
  interruptorActivo().setAttribute('aria-checked', String(activo));
  interruptorActivo().textContent = activo ? 'Sí' : 'No';
  $('#editar-referencia').value = p.referencia ?? '';
  $('#editar-mensaje').value = p.mensaje ?? '';
  limpiarError($('#editar-referencia'), $('#editar-referencia-error'));
  $('[data-mensaje="punto-guardado"]').hidden = true;
  pintarEstado(punto);
}

function pintarEstado(punto) {
  const p = punto.properties;
  const parte = $('[data-parte="editar"]');
  const desde = tiempoDesde(p.ultima_senal);
  llenar(parte, {
    'punto-titulo': ubicacionDe(punto).replace(' · piso', ', piso').replace(/^/, `${p.id} · `),
    'punto-bateria': p.bateria !== undefined ? `${p.bateria} %` : '—',
    'punto-bateria-detalle': p.bateria === undefined ? 'Sin datos' : p.bateria < BATERIA_BAJA ? 'Batería baja: cámbiala pronto' : 'Normal',
    'punto-senal': desde,
    'punto-senal-detalle': p.activo === false ? 'Atención: sin señal' : 'Recibiendo señal',
    'mensaje-largo': String(($('#editar-mensaje').value ?? '').length),
  });
  $('[data-indicador="bateria-punto"]', parte).classList.toggle('indicador-alerta', (p.bateria ?? 100) < BATERIA_BAJA);
  $('[data-indicador="senal-punto"]', parte).classList.toggle('indicador-alerta', p.activo === false);
  $('[data-mensaje="punto-inactivo-aviso"]', parte).hidden = p.activo !== false;
}

function guardarEdicion(evento) {
  evento.preventDefault();
  const punto = buscarElemento(campus.mapa, 'punto', editando);
  const referencia = $('#editar-referencia');
  if (!referencia.value.trim()) {
    mostrarError(referencia, $('#editar-referencia-error'), 'Escribe una referencia del lugar.');
    referencia.focus();
    return;
  }
  limpiarError(referencia, $('#editar-referencia-error'));
  const p = punto.properties;
  const activo = interruptorActivo().getAttribute('aria-checked') === 'true';
  const cambioDeEstado = activo !== (p.activo !== false);
  p.activo = activo;
  p.referencia = referencia.value.trim();
  p.mensaje = $('#editar-mensaje').value.trim().slice(0, LARGO_MENSAJE);
  const registro = cambioDeEstado ? (activo ? 'Punto reactivado' : 'Punto desactivado') : 'Punto actualizado';
  guardarCampus(campus, { evento: registro, detalle: `${p.id} · ${p.referencia}` });
  avisarCambio();
  pintarEstado(punto);
  const mensaje = $('[data-mensaje="punto-guardado"]');
  mensaje.textContent = 'Cambios guardados. La app del estudiante ya los usa.';
  mensaje.hidden = false;
}

/** CA153: vista previa del mensaje con voz sintética. */
function escucharMensaje() {
  const texto = $('#editar-mensaje').value.trim();
  if (!texto) {
    anunciar('El mensaje está vacío.');
    return;
  }
  if (!('speechSynthesis' in window)) {
    anunciar('Este navegador no puede leer el mensaje en voz alta.');
    return;
  }
  speechSynthesis.cancel();
  const frase = new SpeechSynthesisUtterance(texto);
  frase.lang = 'es';
  speechSynthesis.speak(frase);
}

/* ===== Conexión con el router ===== */

export function iniciar() {
  $('#buscar-punto').addEventListener('input', (evento) => {
    estado.consulta = evento.target.value;
    pintarLista({ anunciarConteo: true });
  });
  seccion().addEventListener('click', (evento) => {
    const chip = evento.target.closest('[data-filtro]');
    if (chip) {
      estado.filtro = chip.dataset.filtro;
      pintarLista({ anunciarConteo: true });
      return;
    }
    if (evento.target.closest('[data-accion="escuchar-mensaje"]')) escucharMensaje();
  });
  $('[data-formulario="registrar-punto"]').addEventListener('submit', registrar);
  $('[data-formulario="editar-punto"]').addEventListener('submit', guardarEdicion);
  $('#punto-ubicacion').addEventListener('change', dibujarRegistro);
  for (const id of ['punto-latitud', 'punto-longitud']) {
    $(`#${id}`).addEventListener('change', () => {
      const lat = Number($('#punto-latitud').value);
      const lon = Number($('#punto-longitud').value);
      if ($('#punto-latitud').value && $('#punto-longitud').value && !Number.isNaN(lat + lon)) {
        nuevaUbicacion = [lon, lat];
        dibujarRegistro();
      }
    });
  }
  $('#editar-mensaje').addEventListener('input', (evento) => {
    llenar(seccion(), { 'mensaje-largo': String(evento.target.value.length) });
  });
}

export async function mostrar({ parte }) {
  campus = await cargarCampus();
  if (parte === 'inactivos') estado.filtro = 'inactivo';
  pintarLista();
  if (parte === 'registrar') prepararRegistro();
  else if (parte.startsWith('editar/')) mostrarEditar(decodeURIComponent(parte.slice('editar/'.length)));
  else editando = null;
}
