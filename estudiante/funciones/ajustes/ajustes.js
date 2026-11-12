// Vistas ajustes (7.1), modo-guia (7.2) e instrucciones (7.3): preferencias de la guía.
// En la web se usa la misma estructura que en el celular: la lista de 7.1 lleva a cada pantalla.
// Las tres vistas comparten este archivo porque editan los mismos datos (estudiante/servicios/preferencias.js).
// El invitado también puede cambiarlas: se guardan solo en este dispositivo.

import { anunciar } from '../../../compartido/servicios/anuncios.js';
import { llenar } from '../../../compartido/componentes/plantillas.js';
import { NOMBRES, leerPreferencias, guardarPreferencias } from '../../servicios/preferencias.js';
import { leerContacto } from '../../servicios/contacto-emergencia.js';
import { vibrar, motivoSinVibracion, PATRONES } from '../../servicios/vibracion.js';
import { decir, puedeHablar } from '../../servicios/voz.js';

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
  const contacto = leerContacto();

  llenar($('#vista-ajustes'), {
    'ajuste-modo': NOMBRES.modo[p.modo],
    'ajuste-intensidad': NOMBRES.intensidad[p.intensidad],
    'ajuste-instrucciones': `${NOMBRES.detalle[p.detalle]} · velocidad ${NOMBRES.velocidad[p.velocidad].toLowerCase()}`,
    'ajuste-contacto': contacto?.nombre ?? '',
  });
}

function mostrarModoGuia() {
  const p = leerPreferencias();
  marcarRadio($('[data-formulario="modo-guia"]'), 'modo', p.modo);
  ponerNivel($('#nivel-intensidad'), p.intensidad, NOMBRES.intensidad);
  ocultarPrueba('prueba-vibracion');
}

function mostrarInstrucciones() {
  const p = leerPreferencias();
  marcarRadio($('[data-formulario="instrucciones"]'), 'detalle', p.detalle);
  ponerNivel($('#nivel-velocidad'), p.velocidad, NOMBRES.velocidad);
  ocultarPrueba('prueba-voz');
}

/* ===== Guardar ===== */

function confirmar() {
  anunciar('Ajustes guardados.');
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
  const intensidad = Number($('#nivel-intensidad').value);
  const { detalle } = PATRONES.derecha;
  const nivel = NOMBRES.intensidad[intensidad].toLowerCase();
  const motivo = motivoSinVibracion();
  if (motivo) {
    // El ícono se mueve para mostrar el patrón aunque no se sienta
    mostrarPrueba('prueba-vibracion', `${motivo} El patrón de prueba es ${detalle}, intensidad ${nivel}.`, { activa: true });
    return;
  }
  // CA065: al elegir la intensidad se reproduce un patrón de prueba
  const vibro = vibrar('derecha', { forzar: true, intensidad });
  mostrarPrueba('prueba-vibracion', vibro
    ? `Vibrando: ${detalle}, intensidad ${nivel}. Si no lo sientes, revisa que la vibración del celular esté activada y que no esté en modo de ahorro de batería.`
    : 'El celular no vibró. Revisa que la vibración esté activada y vuelve a tocar «Probar vibración».', { activa: vibro });
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
  const texto = `«${EJEMPLOS[detalle]}», velocidad ${NOMBRES.velocidad[velocidad].toLowerCase()}.`;
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
