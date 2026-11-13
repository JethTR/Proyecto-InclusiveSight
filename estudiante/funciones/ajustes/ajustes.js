// Vistas ajustes (7.1), modo-guia (7.2), intensidad (7.2, intensidad de vibración) e instrucciones (7.3).
// En la web se usa la misma estructura que en el celular: la lista de 7.1 lleva a cada pantalla.
// - Modo de guía: voz y vibración, solo vibración o solo voz.
// - Intensidad de vibración: tipo de pulso (largo, medio, suave) y la barra de intensidad.
// - Instrucciones: nivel de detalle y velocidad de la voz (x0.5 a x2).
// Las vistas comparten este archivo porque editan los mismos datos (estudiante/servicios/preferencias.js).
// El invitado también puede cambiarlas: se guardan solo en este dispositivo.

import { anunciar } from '../../../compartido/servicios/anuncios.js';
import { llenar } from '../../../compartido/componentes/plantillas.js';
import { NOMBRES, multiplicador, leerPreferencias, guardarPreferencias } from '../../servicios/preferencias.js';
import { leerContacto } from '../../servicios/contacto-emergencia.js';
import { vibrar, motivoSinVibracion, PATRONES } from '../../servicios/vibracion.js';
import { decir, puedeHablar } from '../../servicios/voz.js';

const $ = (selector, raiz = document) => raiz.querySelector(selector);

// Frases de prueba de 7.3: las mismas que muestra cada opción
const EJEMPLOS = {
  breves: 'Gira a la derecha',
  detalladas: 'Gira a la derecha y avanza 20 metros por el pasillo',
};

/* ===== Radios y niveles ===== */

function marcarRadio(formulario, nombre, valor) {
  const radio = formulario.querySelector(`input[name="${nombre}"][value="${valor}"]`);
  if (radio) radio.checked = true;
}

function radioElegido(formulario, nombre) {
  return formulario.querySelector(`input[name="${nombre}"]:checked`)?.value;
}

/** Texto de cada nivel: "Media" para la intensidad y "Normal · x1" para la velocidad. */
const TEXTO_NIVEL = {
  'nivel-intensidad': (valor) => NOMBRES.intensidad[valor],
  'nivel-velocidad': (valor) => `${NOMBRES.velocidad(valor)} · ${multiplicador(valor)}`,
};

/** Pone el valor en el control deslizante (dentro de su mínimo y máximo), su texto visible y su aria-valuetext. */
function ponerNivel(control, valor) {
  const min = Number(control.min);
  const max = Number(control.max);
  const paso = Number(control.step) || 1;
  const nivel = Math.min(max, Math.max(min, Math.round(Number(valor) / paso) * paso));
  control.value = nivel;
  const texto = TEXTO_NIVEL[control.id](nivel);
  control.setAttribute('aria-valuetext', texto.replace(' · ', ', '));
  const salida = document.querySelector(`output[for="${control.id}"]`);
  if (salida) salida.textContent = texto;
  return nivel;
}

/* ===== Cargar valores en cada vista ===== */

function mostrarAjustes() {
  const p = leerPreferencias();
  const contacto = leerContacto();

  llenar($('#vista-ajustes'), {
    'ajuste-modo': NOMBRES.modo[p.modo],
    'ajuste-intensidad': `${NOMBRES.pulso[p.pulso]} · intensidad ${NOMBRES.intensidad[p.intensidad].toLowerCase()}`,
    'ajuste-instrucciones': `${NOMBRES.detalle[p.detalle]} · velocidad ${NOMBRES.velocidad(p.velocidadVoz).toLowerCase()} (${multiplicador(p.velocidadVoz)})`,
    'ajuste-contacto': contacto?.nombre ?? '',
  });
}

function mostrarModoGuia() {
  marcarRadio($('[data-formulario="modo-guia"]'), 'modo', leerPreferencias().modo);
}

function mostrarIntensidad() {
  const p = leerPreferencias();
  marcarRadio($('[data-formulario="intensidad"]'), 'pulso', p.pulso);
  ponerNivel($('#nivel-intensidad'), p.intensidad);
  ocultarPrueba('prueba-vibracion');
}

function mostrarInstrucciones() {
  const p = leerPreferencias();
  marcarRadio($('[data-formulario="instrucciones"]'), 'detalle', p.detalle);
  ponerNivel($('#nivel-velocidad'), p.velocidadVoz);
  ocultarPrueba('prueba-voz');
}

/* ===== Guardar ===== */

function confirmar() {
  anunciar('Ajustes guardados.');
}

function guardarModoGuia(evento) {
  evento.preventDefault();
  guardarPreferencias({ modo: radioElegido(evento.currentTarget, 'modo') });
  confirmar();
}

function guardarIntensidad(evento) {
  evento.preventDefault();
  guardarPreferencias({
    pulso: radioElegido(evento.currentTarget, 'pulso'),
    intensidad: Number($('#nivel-intensidad').value),
  });
  confirmar();
}

function guardarInstrucciones(evento) {
  evento.preventDefault();
  guardarPreferencias({
    detalle: radioElegido(evento.currentTarget, 'detalle'),
    velocidadVoz: Number($('#nivel-velocidad').value),
  });
  confirmar();
}

/* ===== Pruebas ===== */

// El resultado de cada prueba se ve en pantalla (role="status" también lo lee el lector de pantalla),
// así se sabe si funcionó o por qué el dispositivo no puede vibrar o hablar.
function mostrarPrueba(nombre, texto, { activa = false } = {}) {
  const mensaje = $(`[data-mensaje="${nombre}"]`);
  mensaje.hidden = false;
  // Se quita y se vuelve a poner la clase para que la animación se repita en cada prueba
  mensaje.classList.remove('prueba-activa');
  void mensaje.offsetWidth;
  mensaje.classList.toggle('prueba-activa', activa);
  llenar(mensaje, { [nombre]: texto });
}

function ocultarPrueba(nombre) {
  const mensaje = $(`[data-mensaje="${nombre}"]`);
  if (mensaje) mensaje.hidden = true;
}

function probarVibracion() {
  const pulso = radioElegido($('[data-formulario="intensidad"]'), 'pulso') ?? 'medio';
  const intensidad = Number($('#nivel-intensidad').value);
  const eleccion = `${NOMBRES.pulso[pulso].toLowerCase()}, intensidad ${NOMBRES.intensidad[intensidad].toLowerCase()}`;
  const motivo = motivoSinVibracion();
  if (motivo) {
    // El ícono se mueve para mostrar la prueba aunque no se sienta
    mostrarPrueba('prueba-vibracion', `${motivo} La prueba es ${PATRONES.prueba.detalle} con ${eleccion}.`, { activa: true });
    return;
  }
  // CA065: al elegir el pulso o la intensidad se reproduce un patrón de prueba
  const vibro = vibrar('prueba', { forzar: true, pulso, intensidad });
  mostrarPrueba('prueba-vibracion', vibro
    ? `Vibrando: ${PATRONES.prueba.detalle}, ${eleccion}. Si no lo sientes, revisa que la vibración del celular esté activada, que no esté en silencio total ni en ahorro de batería.`
    : 'El celular no aceptó vibrar. Revisa que la vibración esté activada y vuelve a tocar «Probar vibración».', { activa: vibro });
}

function escucharEjemplo() {
  const detalle = radioElegido($('[data-formulario="instrucciones"]'), 'detalle') ?? 'breves';
  const velocidad = Number($('#nivel-velocidad').value);
  if (!puedeHablar()) {
    mostrarPrueba('prueba-voz', 'Este navegador no puede leer en voz alta. Prueba con Chrome, Edge o Safari actualizados.');
    return;
  }
  // CA071: frase de prueba con la velocidad elegida, aunque todavía no se haya guardado
  const frase = decir(EJEMPLOS[detalle], { forzar: true, velocidad });
  const texto = `«${EJEMPLOS[detalle]}», velocidad ${NOMBRES.velocidad(velocidad).toLowerCase()} (${multiplicador(velocidad)}).`;
  mostrarPrueba('prueba-voz', `Reproduciendo ${texto} Si no se oye, sube el volumen y revisa que el celular no esté en silencio.`, { activa: true });
  frase?.addEventListener('end', () => mostrarPrueba('prueba-voz', `Se reprodujo ${texto}`));
  frase?.addEventListener('error', (evento) => {
    if (evento.error === 'interrupted' || evento.error === 'canceled') return;
    mostrarPrueba('prueba-voz', 'No se pudo reproducir la voz. Revisa el volumen y que el dispositivo tenga una voz en español instalada.');
  });
}

/* ===== Conexión con el router ===== */

export function iniciar() {
  $('[data-formulario="modo-guia"]').addEventListener('submit', guardarModoGuia);
  $('[data-formulario="intensidad"]').addEventListener('submit', guardarIntensidad);
  $('[data-formulario="instrucciones"]').addEventListener('submit', guardarInstrucciones);

  // Al elegir otro tipo de pulso se prueba al instante
  $('[data-formulario="intensidad"]').addEventListener('change', (evento) => {
    if (evento.target.name === 'pulso') probarVibracion();
  });

  // Botones − y + de los niveles
  document.addEventListener('click', (evento) => {
    const boton = evento.target.closest('[data-accion="bajar"], [data-accion="subir"]');
    if (boton) {
      const control = document.getElementById(boton.getAttribute('aria-controls'));
      const paso = (Number(control.step) || 1) * (boton.dataset.accion === 'subir' ? 1 : -1);
      ponerNivel(control, Number(control.value) + paso);
      anunciar(control.getAttribute('aria-valuetext'));
      if (control.id === 'nivel-intensidad') probarVibracion();
      return;
    }
    if (evento.target.closest('[data-accion="probar-vibracion"]')) probarVibracion();
    if (evento.target.closest('[data-accion="escuchar-ejemplo"]')) escucharEjemplo();
  });

  for (const id of Object.keys(TEXTO_NIVEL)) {
    const control = document.getElementById(id);
    control.addEventListener('input', () => ponerNivel(control, control.value));
    if (id === 'nivel-intensidad') control.addEventListener('change', probarVibracion);
  }
}

export function mostrar({ vista }) {
  if (vista === 'ajustes') mostrarAjustes();
  else if (vista === 'modo-guia') mostrarModoGuia();
  else if (vista === 'intensidad') mostrarIntensidad();
  else if (vista === 'instrucciones') mostrarInstrucciones();
}
