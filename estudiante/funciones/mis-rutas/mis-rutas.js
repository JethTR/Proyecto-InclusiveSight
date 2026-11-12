// Vista mis-rutas: favoritos (5.1), recientes (5.2), editar favorito (5.3) y confirmar eliminación (5.4).
// Partes del hash: #mis-rutas/favoritos, #mis-rutas/recientes y #mis-rutas/editar/<id>.

import { cargarDatos, buscarDestino } from '../../../compartido/servicios/datos.js';
import { anunciar, anunciarAlLlegar } from '../../../compartido/servicios/anuncios.js';
import { abrirDialogo } from '../../../compartido/componentes/dialogo.js';
import { clonar, llenar } from '../../../compartido/componentes/plantillas.js';
import { favoritos, recientes, quitarFavorito, renombrarFavorito } from '../../servicios/rutas-guardadas.js';

let datos = { destinos: [] };
let editando = null; // id del favorito que se está editando

const $ = (selector, raiz = document) => raiz.querySelector(selector);
const seccion = () => $('#vista-mis-rutas');
const enlace = (vista, id) => `#${vista}/${encodeURIComponent(id)}`;

/* ===== Listas ===== */

function pintarFavoritos() {
  const filas = favoritos()
    .map((favorito) => [favorito, buscarDestino(datos, favorito.id)])
    .filter(([, destino]) => destino)
    .map(([favorito, destino]) => {
      const ubicacion = `${destino.edificio} · ${destino.piso}`;
      // Si la persona le cambió el nombre, el detalle dice cuál es el destino
      const detalle = favorito.nombre === destino.nombre ? ubicacion : `${destino.nombre} · ${ubicacion}`;
      const fila = clonar('favorito', { nombre: favorito.nombre, detalle });
      fila.querySelector('a[href="#ruta"]').href = enlace('ruta', destino.id);
      fila.querySelector('a[href="#guia"]').href = enlace('guia', destino.id);
      fila.querySelector('a[href="#mis-rutas/editar"]').href = `#mis-rutas/editar/${encodeURIComponent(destino.id)}`;
      fila.querySelector('[data-accion="eliminar-favorito"]').dataset.id = destino.id;
      return fila;
    });
  $('[data-lista="favoritos"]').replaceChildren(...filas);
  $('[data-mensaje="sin-favoritos"]').hidden = filas.length > 0;
  $('[data-accion="editar-favoritos"]').hidden = filas.length === 0;
}

/** "Hoy · 8:05", "Ayer · 13:10" o "Lun · 16:40" (5.2). */
function fechaCorta(iso) {
  const fecha = new Date(iso);
  const hora = fecha.toLocaleTimeString('es-PE', { hour: 'numeric', minute: '2-digit', hour12: false });
  const dias = Math.round((new Date().setHours(0, 0, 0, 0) - new Date(iso).setHours(0, 0, 0, 0)) / 86400000);
  if (dias === 0) return `Hoy · ${hora}`;
  if (dias === 1) return `Ayer · ${hora}`;
  const dia = fecha.toLocaleDateString('es-PE', { weekday: 'short' }).replace('.', '');
  return `${dia.charAt(0).toUpperCase()}${dia.slice(1)} · ${hora}`;
}

function pintarRecientes() {
  const filas = recientes()
    .map((reciente) => [reciente, buscarDestino(datos, reciente.id)])
    .filter(([, destino]) => destino)
    .map(([reciente, destino]) => {
      const fila = clonar('reciente', { nombre: destino.nombre, fecha: fechaCorta(reciente.fecha) });
      fila.querySelector('time').dateTime = reciente.fecha;
      // CA138: se puede iniciar la ruta de nuevo
      fila.querySelector('a').href = enlace('guia', destino.id);
      return fila;
    });
  $('[data-lista="recientes"]').replaceChildren(...filas);
  $('[data-mensaje="sin-recientes"]').hidden = filas.length > 0;
}

/** En celular solo se ve una pestaña a la vez (5.1 o 5.2). En escritorio (W3) se ven las dos tarjetas. */
function marcarPestana(parte) {
  const pestana = parte.startsWith('recientes') ? 'recientes' : 'favoritos';
  seccion().dataset.pestana = pestana;
  for (const enlacePestana of seccion().querySelectorAll('.pestana')) {
    if (enlacePestana.getAttribute('href') === `#mis-rutas/${pestana}`) enlacePestana.setAttribute('aria-current', 'page');
    else enlacePestana.removeAttribute('aria-current');
  }
}

/* ===== 5.3 · Editar favorito ===== */

function mostrarEditar(id) {
  const favorito = favoritos().find((f) => f.id === id);
  const destino = buscarDestino(datos, id);
  if (!favorito || !destino) {
    location.replace('#mis-rutas');
    return;
  }
  editando = id;
  $('#favorito-nombre').value = favorito.nombre;
  llenar(seccion(), { 'favorito-destino': `${destino.nombre} · ${destino.edificio} · ${destino.piso}` });
}

function guardarEdicion(evento) {
  evento.preventDefault();
  const destino = buscarDestino(datos, editando);
  // Si se deja vacío, vuelve a llamarse como el destino
  const nombre = $('#favorito-nombre').value.trim() || destino.nombre;
  renombrarFavorito(editando, nombre);
  anunciarAlLlegar(`Favorito guardado como ${nombre}.`);
  location.hash = '#mis-rutas';
}

/* ===== 5.4 · Eliminar (con confirmación, CA135) ===== */

async function eliminar(id, boton) {
  const favorito = favoritos().find((f) => f.id === id);
  if (!favorito) return;
  llenar(seccion(), { 'favorito-nombre': favorito.nombre });
  const respuesta = await abrirDialogo($('#dialogo-eliminar-favorito'), boton);
  if (respuesta !== 'eliminar') return;
  quitarFavorito(id);
  const texto = `${favorito.nombre} se eliminó de tus favoritos.`;
  if (location.hash.startsWith('#mis-rutas/editar')) {
    anunciarAlLlegar(texto);
    location.hash = '#mis-rutas';
  } else {
    anunciar(texto);
    pintarFavoritos();
  }
}

/* ===== Conexión con el router ===== */

export async function iniciar() {
  datos = await cargarDatos();
  $('[data-formulario="editar-favorito"]').addEventListener('submit', guardarEdicion);

  seccion().addEventListener('click', (evento) => {
    const borrar = evento.target.closest('[data-accion="eliminar-favorito"]');
    if (borrar) {
      eliminar(borrar.dataset.id ?? editando, borrar);
      return;
    }
    // 5.1 en celular: "Editar favoritos" muestra los botones de editar y eliminar de cada fila
    const editar = evento.target.closest('[data-accion="editar-favoritos"]');
    if (editar) {
      const activo = editar.getAttribute('aria-pressed') !== 'true';
      editar.setAttribute('aria-pressed', String(activo));
      $('[data-parte="favoritos"]').toggleAttribute('data-editando', activo);
    }
  });
}

export function mostrar({ parte }) {
  pintarFavoritos();
  pintarRecientes();
  marcarPestana(parte);
  if (parte.startsWith('editar/')) mostrarEditar(decodeURIComponent(parte.slice('editar/'.length)));
  else editando = null;
}
