// Vistas ruta (W4), guia (M3 y estados 4.1 a 4.7) y contacto-emergencia (4.8).
// La guía nunca recarga la página: cambia de estado con hidden para no cortar la voz ni la vibración.
// El avance por la ruta lo marca estudiante/servicios/ubicacion.js (simulado mientras no haya balizas).

import { cargarDatos, buscarDestino } from '../../../compartido/servicios/datos.js';
import { anunciar, anunciarAlLlegar } from '../../../compartido/servicios/anuncios.js';
import { abrirDialogo } from '../../../compartido/componentes/dialogo.js';
import { clonar, llenar } from '../../../compartido/componentes/plantillas.js';
import { mostrarError, limpiarError } from '../../../compartido/componentes/campo.js';
import { decir, callar } from '../../servicios/voz.js';
import { vibrar, PATRONES } from '../../servicios/vibracion.js';
import { leerPreferencias } from '../../servicios/preferencias.js';
import { obtenerUbicacion, seguirRuta } from '../../servicios/ubicacion.js';
import { agregarReciente, esFavorito, agregarFavorito, quitarFavorito } from '../../servicios/rutas-guardadas.js';
import { leerContacto, guardarContacto } from '../../servicios/contacto-emergencia.js';
import { dibujarMapa } from '../../../compartido/mapa/dibujar.js';
import {
  calcularRuta, recalcularSinEscaleras, ICONOS, VIBRACIONES, metrosRestantes, minutosRestantes,
} from './calcular-ruta.js';

const SEGUNDOS_RECALCULANDO = 3;
const SEGUNDOS_AYUDA_EN_CAMINO = 6; // simulación: el personal de apoyo "atiende" la solicitud

let datos = { destinos: [] };
let guia = null; // { ruta, indice, estado, seguimiento }

const $ = (selector, raiz = document) => raiz.querySelector(selector);
const seccionGuia = () => $('#vista-guia');
const esRegistrado = () => document.body.dataset.modo === 'registrado';

/* ===== Textos de cada paso según las preferencias ===== */

function textoDelPaso(paso) {
  return leerPreferencias().detalle === 'detalladas' ? paso.detalle ?? paso.texto : paso.texto;
}

/** Lo que dice la voz: la frase corta del paso o, con instrucciones detalladas, el texto completo (HU-0018). */
function vozDelPaso(paso) {
  return leerPreferencias().detalle === 'detalladas' ? textoDelPaso(paso) : paso.voz ?? paso.texto;
}

function emitirPaso(paso) {
  // Al pasar por un punto de referencia activo se dice también su mensaje (HU-0041)
  decir([vozDelPaso(paso), paso.mensajePunto].filter(Boolean).join('. '));
  if (VIBRACIONES[paso.tipo]) vibrar(VIBRACIONES[paso.tipo]);
}

/* ===== Pintar la guía ===== */

function pasoActual() {
  return guia.ruta.pasos[guia.indice];
}

function mostrarEstado(nombre, { enfocar = true } = {}) {
  guia.estado = nombre;
  for (const estado of seccionGuia().querySelectorAll('.guia-estado')) estado.hidden = estado.dataset.estado !== nombre;
  // El foco solo se mueve cuando cambia el estado, no en cada paso automático
  if (enfocar) $(`[data-estado="${nombre}"] :is(button, a)`, seccionGuia())?.focus();
}

function pintarCabecera() {
  const { ruta, indice } = guia;
  const seccion = seccionGuia();
  llenar(seccion, {
    'destino-nombre': ruta.destino.nombre,
    'ruta-progreso': `Paso ${indice + 1} de ${ruta.pasos.length} · faltan ${metrosRestantes(ruta, indice)} m · ${minutosRestantes(ruta, indice)} min`,
  });
  const barra = $('progress', seccion);
  barra.max = ruta.pasos.length;
  barra.value = indice + 1;
}

function pintarInstruccion() {
  const paso = pasoActual();
  const preferencias = leerPreferencias();
  const tarjeta = $('.instruccion', seccionGuia());
  const patron = VIBRACIONES[paso.tipo];
  llenar(tarjeta, {
    'instruccion-icono': ICONOS[paso.tipo],
    'instruccion-texto': textoDelPaso(paso),
    'instruccion-vibracion': patron ? `: ${PATRONES[patron].detalle}` : '',
  });
  const voz = $('[data-dato="instruccion-voz"]', tarjeta);
  voz.hidden = !paso.voz || preferencias.modo === 'vibracion';
  voz.textContent = paso.voz ? `Voz: «${paso.voz}»` : '';
  $('[data-canal="voz"]', tarjeta).hidden = preferencias.modo === 'vibracion';
  $('[data-canal="vibracion"]', tarjeta).hidden = preferencias.modo === 'voz';

  // Zona de riesgo en el paso siguiente: aviso amarillo (M3)
  const siguiente = guia.ruta.pasos[guia.indice + 1];
  const aviso = $('[data-mensaje="riesgo-proximo"]', seccionGuia());
  aviso.hidden = siguiente?.tipo !== 'riesgo';
  if (!aviso.hidden) {
    llenar(aviso, {
      'riesgo-proximo-titulo': siguiente.aviso ?? `Atención: ${siguiente.texto}`,
      'riesgo-proximo-texto': siguiente.avisoDetalle ?? '',
    });
  }
}

/* ===== Recorrido ===== */

function iniciarGuia(destino) {
  detenerGuia();
  const ruta = calcularRuta(datos, destino);
  if (!ruta) {
    // CA096: sin un punto de referencia cerca no se puede calcular la ruta
    anunciarAlLlegar('No pudimos detectar tu ubicación. Acércate a un ingreso o a un pasillo principal e inténtalo de nuevo.');
    location.replace(`#destino/${encodeURIComponent(destino.id)}`);
    return;
  }
  guia = { ruta, indice: 0, estado: 'en-curso', seguimiento: null };
  if (esRegistrado()) agregarReciente(destino.id);

  pintarCabecera();
  pintarInstruccion();
  mostrarEstado('en-curso', { enfocar: false });

  // CA097: al iniciar se anuncian la distancia total, el tiempo y la primera instrucción
  const primero = pasoActual();
  decir(`Ruta a ${destino.nombre}. ${ruta.distancia} metros, unos ${ruta.tiempo} minutos. ${vozDelPaso(primero)}`);
  if (VIBRACIONES[primero.tipo]) vibrar(VIBRACIONES[primero.tipo]);
  guia.seguimiento = seguirRuta(avanzar);
}

function detenerGuia() {
  guia?.seguimiento?.detener();
  callar();
  guia = null;
}

function avanzar() {
  if (!guia || guia.estado !== 'en-curso') return;
  irAlPaso(guia.indice + 1);
}

function irAlPaso(indice) {
  guia.indice = Math.min(indice, guia.ruta.pasos.length - 1);
  const paso = pasoActual();
  pintarCabecera();
  if (paso.tipo === 'riesgo') {
    alertarRiesgo(paso);
    return;
  }
  if (paso.tipo === 'llegada') {
    llegar();
    return;
  }
  pintarInstruccion();
  guia.estado = 'en-curso';
  for (const estado of seccionGuia().querySelectorAll('.guia-estado')) estado.hidden = estado.dataset.estado !== 'en-curso';
  emitirPaso(paso);
}

/** 4.3: la alerta de riesgo usa voz y vibración siempre, sin importar el modo (CA075, CA120). */
function alertarRiesgo(paso) {
  guia.seguimiento.pausar();
  llenar(seccionGuia(), {
    'riesgo-icono': ICONOS.riesgo,
    'riesgo-titulo': paso.texto,
    'riesgo-texto': paso.detalle ?? '',
  });
  mostrarEstado('alerta-riesgo');
  vibrar('riesgo');
  decir(`${paso.texto}. ${paso.detalle ?? ''}`, { forzar: true });
}

/** 4.2: busca con A* otra ruta sin escaleras desde donde está la persona y retoma la guía. */
function buscarOtraRuta() {
  const nueva = recalcularSinEscaleras(datos, guia.ruta, guia.indice);
  if (!nueva) {
    const texto = 'No hay otra ruta sin escaleras. Avanza con cuidado.';
    anunciar(texto);
    decir(texto, { forzar: true });
    return;
  }
  llenar(seccionGuia(), { 'instruccion-siguiente': `«${vozDelPaso(nueva.pasos[0])}»` });
  mostrarEstado('recalculando');
  decir('Recalculando la ruta.');
  setTimeout(() => {
    if (!guia || guia.estado !== 'recalculando') return;
    guia.ruta = nueva;
    irAlPaso(0);
    retomarSiSigueEnCurso();
  }, SEGUNDOS_RECALCULANDO * 1000);
}

/** Después de una alerta o un recálculo: si el paso al que se llegó es normal, la guía sigue avanzando. */
function retomarSiSigueEnCurso() {
  if (guia.estado !== 'en-curso') return; // llegó a otra alerta o al destino
  mostrarEstado('en-curso');
  guia.seguimiento.reanudar();
}

function continuarRuta() {
  irAlPaso(guia.indice + 1);
  retomarSiSigueEnCurso();
}

/** 4.4: en pausa la guía no habla ni vibra (CA115). */
function pausar() {
  guia.seguimiento.pausar();
  llenar(seccionGuia(), {
    'pausa-resumen': `${guia.ruta.destino.nombre} · faltan ${metrosRestantes(guia.ruta, guia.indice)} m`,
  });
  mostrarEstado('pausa');
  decir('Ruta pausada.');
  anunciar('Ruta pausada.');
}

/** Al reanudar se anuncia la instrucción actual (CA116). */
function reanudar() {
  pintarInstruccion();
  mostrarEstado('en-curso');
  emitirPaso(pasoActual());
  guia.seguimiento.reanudar();
}

function pedirAyuda() {
  guia.seguimiento.pausar();
  const ubicacion = obtenerUbicacion(datos);
  llenar(seccionGuia(), { 'ubicacion-actual': ubicacion?.texto ?? 'Cerca del último punto de referencia' });
  $('[data-mensaje="ayuda-enviada"]', seccionGuia()).hidden = true;
  mostrarEstado('pedir-ayuda');
}

/** CA123 y CA124: se envía la ubicación, se confirma por voz y se avisa cuando la ayuda está en camino. */
function enviarPedidoDeAyuda(evento) {
  evento.preventDefault();
  const mensaje = $('[data-mensaje="ayuda-enviada"]', seccionGuia());
  mensaje.textContent = 'Enviamos tu ubicación al personal de apoyo. Te avisaremos cuando la ayuda esté en camino.';
  mensaje.hidden = false;
  decir(mensaje.textContent, { forzar: true });
  setTimeout(() => {
    if (!guia || guia.estado !== 'pedir-ayuda') return;
    mensaje.textContent = 'La ayuda está en camino. Quédate donde estás.';
    decir(mensaje.textContent, { forzar: true });
  }, SEGUNDOS_AYUDA_EN_CAMINO * 1000);
}

function llegar() {
  guia.seguimiento.detener();
  const { destino } = guia.ruta;
  llenar(seccionGuia(), { 'llegada-indicacion': destino.llegada ?? '' });
  actualizarFavorito();
  mostrarEstado('llegada');
  vibrar('llegada');
  decir(`Llegaste a ${destino.nombre}. ${destino.llegada ?? ''}`);
}

function repetir() {
  if (guia.estado === 'llegada') {
    const { destino } = guia.ruta;
    decir(`Llegaste a ${destino.nombre}. ${destino.llegada ?? ''}`, { forzar: true });
    vibrar('llegada');
    return;
  }
  emitirPaso(pasoActual());
}

async function cancelar(boton) {
  const respuesta = await abrirDialogo($('#dialogo-cancelar'), boton);
  if (respuesta !== 'cancelar') return;
  detenerGuia();
  anunciarAlLlegar('Ruta cancelada.');
  location.hash = '#buscar';
}

function actualizarFavorito() {
  const boton = $('[data-estado="llegada"] [data-accion="guardar-favorito"]', seccionGuia());
  boton.textContent = esFavorito(guia.ruta.destino.id) ? 'Quitar de favoritos' : 'Guardar en favoritos';
  boton.setAttribute('aria-pressed', String(esFavorito(guia.ruta.destino.id)));
}

function alternarFavorito() {
  const { destino } = guia.ruta;
  if (esFavorito(destino.id)) {
    quitarFavorito(destino.id);
    anunciar(`${destino.nombre} se quitó de tus favoritos.`);
  } else {
    agregarFavorito(destino.id, destino.nombre);
    anunciar(`${destino.nombre} se guardó en tus favoritos.`);
  }
  actualizarFavorito();
}

function mostrarGuia(id) {
  // Volver a la guía que ya está en curso (por ejemplo, después de cambiar el modo en ajustes, CA076)
  if (guia && (!id || guia.ruta.destino.id === id)) {
    pintarCabecera();
    if (guia.estado === 'en-curso') pintarInstruccion();
    mostrarEstado(guia.estado, { enfocar: false });
    return;
  }
  const destino = buscarDestino(datos, id);
  if (!destino) {
    location.replace('#buscar');
    return;
  }
  iniciarGuia(destino);
}

/* ===== W4 · Vista previa de la ruta ===== */

let rutaEnVista = null;

function mostrarRuta(seccion, id) {
  const destino = buscarDestino(datos, id);
  if (!destino) {
    location.replace('#buscar');
    return;
  }
  rutaEnVista = calcularRuta(datos, destino);
  if (!rutaEnVista) {
    anunciarAlLlegar('No pudimos detectar tu ubicación, así que no se puede calcular la ruta.');
    location.replace(`#destino/${encodeURIComponent(destino.id)}`);
    return;
  }
  llenar(seccion, {
    'destino-nombre': destino.nombre,
    'ruta-resumen': `${rutaEnVista.distancia} m · ${rutaEnVista.tiempo} min`,
    'mapa-descripcion': `Ruta de ${rutaEnVista.distancia} m desde tu ubicación hasta ${destino.nombre}, ${destino.edificio}, ${destino.piso.toLowerCase()}.`,
  });
  // En la vista previa no se muestra el paso de riesgo: la ruta ya indica la alternativa
  const filas = rutaEnVista.pasos
    .filter((paso) => paso.tipo !== 'riesgo')
    .map((paso) => clonar('paso', { icono: ICONOS[paso.tipo], texto: paso.texto }));
  $('[data-lista="pasos"]', seccion).replaceChildren(...filas);
  $('[data-accion="volver-destino"]', seccion).href = `#destino/${encodeURIComponent(destino.id)}`;
  $('[data-mensaje="ruta-enviada"]', seccion).hidden = true;
  // El mapa muestra el piso donde empieza la ruta; con los botones se ven los demás pisos que recorre
  dibujarMapa($('.mapa-lienzo', seccion), datos.mapa, {
    piso: rutaEnVista.nodos[0]?.piso ?? 1,
    pisos: rutaEnVista.nodos.map((n) => n.piso),
    ruta: rutaEnVista.nodos,
    destacar: destino.edificioId,
  });
}

async function enviarAlCelular() {
  const { destino } = rutaEnVista;
  const enlace = new URL(`app.html#guia/${encodeURIComponent(destino.id)}`, location.href).href;
  const mensaje = $('[data-mensaje="ruta-enviada"]');
  try {
    if (navigator.share) {
      await navigator.share({ title: `Ruta a ${destino.nombre} · InclusiveSight`, url: enlace });
      mensaje.textContent = 'Ruta enviada. Ábrela en tu celular cuando estés en el campus.';
    } else {
      await navigator.clipboard.writeText(enlace);
      mensaje.textContent = 'Copiamos el enlace de la ruta. Ábrelo en tu celular cuando estés en el campus.';
    }
  } catch {
    mensaje.textContent = `Abre este enlace en tu celular: ${enlace}`;
  }
  mensaje.hidden = false;
}

/* ===== 4.8 · Contacto de emergencia ===== */

const TELEFONO_VALIDO = /^\+?[\d\s-]{6,15}$/;

function mostrarContacto() {
  const contacto = leerContacto();
  $('#contacto-nombre').value = contacto?.nombre ?? '';
  $('#contacto-telefono').value = contacto?.telefono ?? '';
  const interruptor = $('[aria-labelledby="aviso-rapido-et"]');
  const activo = contacto?.avisoRapido ?? true;
  interruptor.setAttribute('aria-checked', String(activo));
  interruptor.textContent = activo ? 'Sí' : 'No';
  $('[data-mensaje="contacto"]').hidden = true;
}

function mostrarMensajeContacto(texto) {
  const mensaje = $('[data-mensaje="contacto"]');
  mensaje.textContent = texto;
  mensaje.hidden = false;
}

function guardarFormularioContacto(evento) {
  evento.preventDefault();
  const nombre = $('#contacto-nombre');
  const telefono = $('#contacto-telefono');
  const errores = [
    [nombre, $('#contacto-nombre-error'), nombre.value.trim() ? null : 'Escribe el nombre de tu contacto.'],
    [telefono, $('#contacto-telefono-error'), TELEFONO_VALIDO.test(telefono.value.trim()) ? null : 'Escribe un número de teléfono válido.'],
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
  if (primero) {
    primero.focus();
    return;
  }
  guardarContacto({
    nombre: nombre.value,
    telefono: telefono.value,
    avisoRapido: $('[aria-labelledby="aviso-rapido-et"]').getAttribute('aria-checked') === 'true',
  });
  mostrarMensajeContacto('Contacto guardado.');
}

/** Prueba simulada: no se envía ningún mensaje real hasta que exista el backend. */
function probarAviso() {
  const contacto = leerContacto();
  mostrarMensajeContacto(contacto
    ? `Aviso de prueba enviado a ${contacto.nombre}.`
    : 'Primero guarda los datos de tu contacto de emergencia.');
}

/* ===== Conexión con el router ===== */

export async function iniciar() {
  datos = await cargarDatos();

  seccionGuia().addEventListener('click', (evento) => {
    const boton = evento.target.closest('[data-accion]');
    if (!boton || !guia) return;
    switch (boton.dataset.accion) {
      case 'repetir-instruccion': repetir(); break;
      case 'pausar-ruta': pausar(); break;
      case 'reanudar-ruta': reanudar(); break;
      case 'pedir-ayuda': pedirAyuda(); break;
      case 'volver-a-ruta': reanudar(); break;
      case 'ver-alerta-riesgo': irAlPaso(guia.indice + 1); break;
      case 'continuar-ruta': continuarRuta(); break;
      case 'buscar-otra-ruta': buscarOtraRuta(); break;
      case 'cancelar-ruta': cancelar(boton); break;
      case 'guardar-favorito': alternarFavorito(); break;
      case 'terminar-ruta': detenerGuia(); break;
      default: break;
    }
  });
  $('[data-formulario="pedir-ayuda"]').addEventListener('submit', enviarPedidoDeAyuda);

  $('#vista-ruta').addEventListener('click', (evento) => {
    if (evento.target.closest('[data-accion="enviar-al-celular"]') && rutaEnVista) enviarAlCelular();
  });

  $('[data-formulario="emergencia"]').addEventListener('submit', guardarFormularioContacto);
  $('[data-accion="probar-aviso"]').addEventListener('click', probarAviso);
}

export function mostrar({ vista, parte, seccion }) {
  if (vista === 'ruta') mostrarRuta(seccion, parte);
  else if (vista === 'guia') mostrarGuia(parte);
  else if (vista === 'contacto-emergencia') mostrarContacto();
}
