// Landing page: práctica de vibración (los mismos patrones de la pantalla 2.3 de la app).
// Usa la Vibration API, que funciona en Android; en computadoras e iPhone se muestra un aviso.

import { anunciar } from '../compartido/servicios/anuncios.js';

// Duraciones en milisegundos: vibra, pausa, vibra...
const PATRONES = {
  izquierda: { nombre: 'Giro a la izquierda', detalle: 'dos pulsos cortos', vibracion: [150, 120, 150] },
  derecha: { nombre: 'Giro a la derecha', detalle: 'un pulso largo', vibracion: [600] },
  llegada: { nombre: 'Llegada al destino', detalle: 'tres pulsos', vibracion: [200, 120, 200, 120, 200] },
  riesgo: { nombre: 'Alerta de riesgo', detalle: 'vibración continua fuerte', vibracion: [1500] },
};

const puedeVibrar = 'vibrate' in navigator;

document.querySelector('[data-mensaje="sin-vibracion"]').hidden = puedeVibrar;

document.addEventListener('click', (evento) => {
  const boton = evento.target.closest('[data-patron]');
  if (!boton) return;
  const patron = PATRONES[boton.dataset.patron];
  if (puedeVibrar) navigator.vibrate(patron.vibracion);
  anunciar(`${patron.nombre}: ${patron.detalle}`);
});
