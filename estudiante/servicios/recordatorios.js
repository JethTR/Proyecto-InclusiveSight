// Recordatorios de ruta (HU-0007): se guardan con destino y hora de llegada, y avisan con el margen
// del tiempo de traslado más los minutos que eligió la persona (CA028). Mientras la app esté abierta,
// vigilar() revisa cada 30 segundos si toca avisar.

import { leerDelUsuario, guardarDelUsuario } from './datos-usuario.js';

export function recordatorios() {
  return leerDelUsuario('recordatorios', []);
}

export function agregarRecordatorio({ destino, hora, aviso, repetir }) {
  const nuevo = { id: String(Date.now()), destino, hora, aviso: Number(aviso), repetir, ultimoAviso: null };
  guardarDelUsuario('recordatorios', [...recordatorios(), nuevo]);
  return nuevo;
}

export function eliminarRecordatorio(id) {
  guardarDelUsuario('recordatorios', recordatorios().filter((r) => r.id !== id));
}

function aMinutos(hora) {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

function aHora(minutos) {
  const total = (minutos + 24 * 60) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/** Hora a la que se avisa: llegada − tiempo de traslado − minutos de anticipación. */
export function horaDeAviso(recordatorio, minutosDeTraslado = 0) {
  return aHora(aMinutos(recordatorio.hora) - minutosDeTraslado - recordatorio.aviso);
}

/** Revisa los recordatorios cada 30 s. tiempoDe(destinoId) devuelve los minutos de traslado. */
export function vigilar({ tiempoDe, alAvisar }) {
  const revisar = () => {
    const ahora = new Date();
    const hoy = ahora.toLocaleDateString('sv'); // fecha local AAAA-MM-DD
    const horaActual = aHora(ahora.getHours() * 60 + ahora.getMinutes());
    const esLaborable = ahora.getDay() >= 1 && ahora.getDay() <= 5;
    let cambios = false;
    const lista = recordatorios().map((r) => {
      if (r.ultimoAviso === hoy || (r.repetir && !esLaborable)) return r;
      if (horaDeAviso(r, tiempoDe(r.destino)) !== horaActual) return r;
      alAvisar(r);
      cambios = true;
      return { ...r, ultimoAviso: hoy };
    });
    // Un recordatorio sin repetición se borra después de avisar
    if (cambios) guardarDelUsuario('recordatorios', lista.filter((r) => r.repetir || r.ultimoAviso !== hoy));
  };
  revisar();
  return setInterval(revisar, 30 * 1000);
}
