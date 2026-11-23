// Lectura y escritura en localStorage. Si el navegador lo bloquea (modo privado, permisos), no rompe la app:
// leer devuelve el valor por defecto y guardar no hace nada.

const PREFIJO = 'inclusivesight:';

export function leer(clave, porDefecto = null) {
  try {
    const valor = localStorage.getItem(PREFIJO + clave);
    return valor === null ? porDefecto : JSON.parse(valor);
  } catch {
    return porDefecto;
  }
}

export function guardar(clave, valor) {
  try {
    localStorage.setItem(PREFIJO + clave, JSON.stringify(valor));
  } catch {
    // Sin almacenamiento: el dato vive solo mientras la página esté abierta
  }
}

export function borrar(clave) {
  try {
    localStorage.removeItem(PREFIJO + clave);
  } catch {
    // Nada que borrar
  }
}
