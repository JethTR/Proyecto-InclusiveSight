// Ubicación actual según el punto de referencia más cercano.
// Mientras no haya balizas, se simula con "ubicacionSimulada" de compartido/datos/destinos.json.
// Devuelve { texto, cercanos: [{ id, detalle }] } o null si no se detecta ningún punto (HU-0024).

export function obtenerUbicacion(datos) {
  return datos?.ubicacionSimulada ?? null;
}
