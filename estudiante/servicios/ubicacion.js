// Ubicación y avance por la ruta.
// Mientras no haya balizas BLE o etiquetas NFC, todo se simula:
// - obtenerUbicacion usa el punto de referencia de "ubicacionSimulada" (compartido/datos/campus.json).
//   Si ese punto no existe o el administrador lo desactivó, no hay ubicación (HU-0024).
// - seguirRuta avanza un paso cada cierto tiempo, como si la persona pasara por el siguiente punto de referencia.
// Cuando existan los puntos reales, se cambia este archivo y el resto de la app no se toca.

export function obtenerUbicacion(datos) {
  return datos?.ubicacionSimulada ?? null;
}

const SEGUNDOS_POR_PASO = 8;

/** Llama a alAvanzar() cada vez que la persona llega al siguiente punto de la ruta. */
export function seguirRuta(alAvanzar, segundos = SEGUNDOS_POR_PASO) {
  let temporizador = null;
  const control = {
    reanudar() {
      if (!temporizador) temporizador = setInterval(alAvanzar, segundos * 1000);
    },
    pausar() {
      clearInterval(temporizador);
      temporizador = null;
    },
    detener() {
      control.pausar();
    },
  };
  control.reanudar();
  return control;
}
