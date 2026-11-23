// 9.1 · Resumen: indicadores de los puntos (HU-0040, CA151), el primer punto inactivo y la actividad reciente.

import { cargarCampus } from '../../../compartido/servicios/campus.js';
import { elementos } from '../../../compartido/mapa/geojson.js';
import { clonar, llenar } from '../../../compartido/componentes/plantillas.js';
import { contarPuntos, estadoDe, tiempoDesde, ubicacionDe } from '../../servicios/estado-puntos.js';

const $ = (selector, raiz = document) => raiz.querySelector(selector);

function hora(iso) {
  const fecha = new Date(iso);
  const hoy = new Date().toDateString() === fecha.toDateString();
  return hoy
    ? fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false })
    : fecha.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
}

export async function mostrar({ seccion }) {
  const campus = await cargarCampus();
  const cuenta = contarPuntos(campus.mapa);
  const zonas = (campus.avisos ?? []).filter((a) => a.tipo === 'zona-cerrada');

  llenar(seccion, {
    activos: String(cuenta.activo + cuenta.bateria),
    'activos-detalle': `de ${cuenta.todos} registrados`,
    bateria: String(cuenta.bateria),
    'bateria-detalle': cuenta.bateria ? 'Atención: revisar esta semana' : 'Todo en orden',
    inactivos: String(cuenta.inactivo),
    'inactivos-detalle': cuenta.inactivo ? 'Atención: sin señal' : 'Todo en orden',
    zonas: String(zonas.length),
    'zonas-detalle': zonas[0]?.zona?.nombre ?? 'Ninguna',
  });
  // Los indicadores con algo pendiente se ven en amarillo, como en el mockup
  $('[data-indicador="bateria"]', seccion).classList.toggle('indicador-alerta', cuenta.bateria > 0);
  $('[data-indicador="inactivos"]', seccion).classList.toggle('indicador-alerta', cuenta.inactivo > 0);

  const inactivo = elementos(campus.mapa, 'punto').find((p) => estadoDe(p) === 'inactivo');
  const aviso = $('[data-mensaje="punto-inactivo"]', seccion);
  aviso.hidden = !inactivo;
  if (inactivo) {
    const desde = tiempoDesde(inactivo.properties.ultima_senal);
    llenar(aviso, {
      'inactivo-titulo': `Punto inactivo: ${inactivo.properties.id} · ${ubicacionDe(inactivo)}`,
      'inactivo-texto': `${desde === 'Sin datos' ? 'Sin señal.' : `Sin señal desde hace ${desde}.`} Los estudiantes reciben la ruta sin este punto.`,
    });
    $('[data-accion="revisar-punto"]', aviso).href = `#puntos/editar/${encodeURIComponent(inactivo.properties.id)}`;
  }

  const filas = (campus.actividad ?? []).map((a) => clonar('fila-actividad', { hora: hora(a.fecha), evento: a.evento, detalle: a.detalle ?? '' }));
  $('[data-lista="actividad"]', seccion).replaceChildren(...filas);
  $('[data-mensaje="sin-actividad"]', seccion).hidden = filas.length > 0;
  $('table', seccion).hidden = filas.length === 0;
}
