// Formato del mapa del campus: un GeoJSON (FeatureCollection, coordenadas [longitud, latitud] en WGS84).
// Cada elemento dice qué es en properties.tipo:
//
//   edificio   Polygon      { id, nombre, pisos: [1, 2, 3] }
//   pasillo    LineString   { piso }                    Tramo por el que se camina. Los pasillos se unen
//                                                       cuando comparten un vértice (o están a menos de 1,5 m)
//                                                       y cuando el extremo de uno cae sobre otro (cruce en "T").
//   escalera   LineString   { desde_piso, hasta_piso }  Primer punto en desde_piso, último en hasta_piso.
//   ascensor   Point        { pisos: [1, 2, 3] }
//   destino    Point        { id, nombre, categoria, edificio, piso, llegada?, punto? }
//   punto      Point        { id, tecnologia: "BLE"|"NFC", edificio, piso, referencia, mensaje?, activo, bateria?, ultima_senal? }
//
// Los destinos, puntos, ascensores y extremos de escaleras se conectan solos al pasillo más cercano de su piso.
// La documentación completa está en administrador/README.md.

const GEOMETRIAS = {
  edificio: ['Polygon'],
  pasillo: ['LineString'],
  escalera: ['LineString'],
  ascensor: ['Point'],
  destino: ['Point'],
  punto: ['Point'],
};

export const TIPOS = Object.keys(GEOMETRIAS);

export function elementos(mapa, tipo) {
  return (mapa?.features ?? []).filter((f) => f.properties?.tipo === tipo);
}

export function buscarElemento(mapa, tipo, id) {
  return elementos(mapa, tipo).find((f) => f.properties.id === id) ?? null;
}

/** Revisa que el archivo tenga el formato esperado. Devuelve { errores, resumen }. */
export function validarMapa(mapa) {
  const errores = [];
  if (mapa?.type !== 'FeatureCollection' || !Array.isArray(mapa.features)) {
    return { errores: ['El archivo no es un GeoJSON de tipo FeatureCollection.'], resumen: {} };
  }
  const resumen = Object.fromEntries(TIPOS.map((t) => [t, 0]));
  const ids = new Set();
  mapa.features.forEach((f, i) => {
    const n = `Elemento ${i + 1}`;
    const tipo = f?.properties?.tipo;
    if (!GEOMETRIAS[tipo]) {
      errores.push(`${n}: properties.tipo debe ser uno de: ${TIPOS.join(', ')}.`);
      return;
    }
    if (!GEOMETRIAS[tipo].includes(f.geometry?.type)) {
      errores.push(`${n} (${tipo}): la geometría debe ser ${GEOMETRIAS[tipo].join(' o ')}.`);
      return;
    }
    resumen[tipo] += 1;
    const p = f.properties;
    if (['edificio', 'destino', 'punto'].includes(tipo)) {
      if (!p.id) errores.push(`${n} (${tipo}): falta properties.id.`);
      else if (ids.has(`${tipo}:${p.id}`)) errores.push(`${n} (${tipo}): el id «${p.id}» está repetido.`);
      else ids.add(`${tipo}:${p.id}`);
    }
    if (tipo === 'edificio' && !Array.isArray(p.pisos)) errores.push(`${n} (edificio): falta properties.pisos, por ejemplo [1, 2].`);
    if (['pasillo', 'destino', 'punto'].includes(tipo) && !Number.isInteger(p.piso)) errores.push(`${n} (${tipo}): falta properties.piso (número).`);
    if (tipo === 'escalera' && !(Number.isInteger(p.desde_piso) && Number.isInteger(p.hasta_piso))) {
      errores.push(`${n} (escalera): faltan properties.desde_piso y hasta_piso.`);
    }
    if (tipo === 'ascensor' && !Array.isArray(p.pisos)) errores.push(`${n} (ascensor): falta properties.pisos.`);
    if (tipo === 'destino' && !p.nombre) errores.push(`${n} (destino): falta properties.nombre.`);
  });
  if (!resumen.pasillo) errores.push('El mapa no tiene pasillos: sin ellos no se pueden calcular rutas.');
  return { errores, resumen };
}

/**
 * Proyección local en metros (equirectangular) centrada en el mapa. Suficiente para un campus:
 * el error es de centímetros en unos cientos de metros.
 */
export function crearProyeccion(mapa) {
  const coords = [];
  const juntar = (c) => (typeof c[0] === 'number' ? coords.push(c) : c.forEach(juntar));
  for (const f of mapa?.features ?? []) if (f.geometry) juntar(f.geometry.coordinates);
  const lon0 = coords.reduce((s, c) => s + c[0], 0) / (coords.length || 1);
  const lat0 = coords.reduce((s, c) => s + c[1], 0) / (coords.length || 1);
  const mx = 111320 * Math.cos((lat0 * Math.PI) / 180);
  const my = 110540;
  return {
    aXY: ([lon, lat]) => [(lon - lon0) * mx, (lat - lat0) * my],
    aLonLat: ([x, y]) => [lon0 + x / mx, lat0 + y / my],
  };
}
