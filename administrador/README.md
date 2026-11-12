# InclusiveSight · Panel del coordinador

Panel web para que la oficina de inclusión cargue el **mapa del campus (GeoJSON)** y gestione los **puntos de referencia**. Todo lo que se guarda aquí lo usa la app del estudiante: búsqueda, distancias, rutas calculadas con **A\***, alertas de escaleras y mensajes de voz de los puntos.

**Estado:** acceso institucional (1.5), Resumen (9.1), Puntos de referencia (9.2, 9.3 y 9.4) y Mapa del campus (9.5 + carga del GeoJSON). Pendiente: zonas de riesgo (9.6), cierres temporales (9.7) y reportes (10.1 a 10.4).

## Cómo entrar

Abre `http://localhost:8000/administrador/` con un servidor local desde la raíz del repositorio (ver el README principal).

Solo entran cuentas con rol `administrador`; una cuenta de estudiante ve "Esta cuenta no está autorizada para el panel". Mientras no haya backend existe una **cuenta de prueba de desarrollo**, que se crea sola al abrir el acceso:

| Correo | Contraseña |
|---|---|
| `coordinacion@universidad.edu.pe` | `Coordinacion2026` |

Está en `funciones/acceso/acceso.js`. Bórrala cuando exista el backend. El panel tiene su propia sesión: entrar aquí no abre sesión en la app del estudiante.

## Carpetas

```
administrador/
├── index.html               ← 1.5 · Acceso institucional
├── panel.html               ← esqueleto + vistas resumen, puntos y mapa
├── estilos/panel.css        ← estilos que usan varias funciones del panel (tablas, indicadores, estados)
├── funciones/
│   ├── acceso/              ← acceso.css, acceso.js
│   ├── resumen/             ← resumen.css, resumen.js        (9.1)
│   ├── puntos/              ← puntos.css, puntos.js          (9.2, 9.3, 9.4)
│   └── mapa/                ← mapa.css, mapa.js              (9.5, carga del GeoJSON, prueba de A*)
├── servicios/estado-puntos.js  ← estado de un punto (activo, inactivo, batería baja)
└── nucleo/app.js            ← sesión del panel, alertas y router (compartido/nucleo/router.js)
```

| Vista (hash) | Pantallas | Qué hace |
|---|---|---|
| `#resumen` | 9.1 | Puntos activos, con batería baja e inactivos; zonas cerradas; primer punto inactivo; actividad reciente |
| `#puntos` | 9.2 | Lista con búsqueda y filtros (todos, activos, inactivos, batería baja) |
| `#puntos/registrar` | 9.3 | Código, tipo (BLE/NFC), edificio y piso, referencia y ubicación tocando el mapa (o con latitud y longitud, para usarlo con teclado) |
| `#puntos/editar/<código>` | 9.4 | Activar o desactivar, ubicación, mensaje de voz (120 caracteres, con vista previa) y estado |
| `#mapa` | 9.5 | Cargar el GeoJSON, exportarlo, volver al del repositorio, edificios y pisos con sus destinos, y probar una ruta con A* |

## Cómo llega la información al estudiante

No hay backend, así que:

1. Lo que guarda el panel queda en el `localStorage` del navegador (`compartido/servicios/campus.js`). La app del estudiante, **en el mismo navegador**, lo usa al recargar.
2. Para que lo vean todos (GitHub Pages), usa **Exportar campus.geojson** y reemplaza `compartido/datos/campus.geojson` en el repositorio. Ese archivo es el mapa que usa cualquiera que no tenga cambios guardados.
3. **Volver al mapa del repositorio** borra lo guardado en el navegador.

## Formato del mapa (GeoJSON)

Un `FeatureCollection` con coordenadas `[longitud, latitud]` (WGS84). Cada elemento dice qué es en `properties.tipo`:

| tipo | Geometría | Propiedades | Para qué sirve |
|---|---|---|---|
| `edificio` | Polygon | `id`, `nombre`, `pisos` (ej. `[1, 2, 3]`) | Dibujo del mapa, edificio de los destinos y puntos |
| `pasillo` | LineString | `piso` | Caminos por donde se puede ir: son las aristas del grafo |
| `escalera` | LineString | `desde_piso`, `hasta_piso` | Une dos pisos; el primer punto está en `desde_piso` y el último en `hasta_piso`. Genera la alerta de riesgo |
| `ascensor` | Point | `pisos` | Une los pisos que tengan pasillos (alternativa sin escaleras) |
| `destino` | Point | `id`, `nombre`, `categoria`, `edificio`, `piso`, opcionales `llegada` (texto al llegar) y `punto` (punto de referencia asociado) | Lo que se busca en la app |
| `punto` | Point | `id` (código), `tecnologia` (`BLE` o `NFC`), `edificio`, `piso`, `referencia`, opcionales `mensaje`, `activo`, `bateria`, `ultima_senal` | Puntos de referencia. Se gestionan en el panel |

Reglas:

- Dos pasillos se unen cuando comparten un vértice, cuando están a menos de 1,5 m o cuando el extremo de uno cae sobre otro (cruce en "T").
- Los destinos, los puntos, los ascensores y los extremos de las escaleras se conectan solos al pasillo más cercano de su piso.
- Las categorías de los destinos (`aulas`, `banos`, `biblioteca`...) están en `compartido/datos/campus.json`.
- Al cargar un mapa nuevo, los puntos ya registrados que no vienen en el archivo se conservan.
- El panel revisa el archivo antes de guardarlo y muestra qué elemento tiene qué error.

Ejemplo mínimo:

```json
{
  "type": "FeatureCollection",
  "features": [
    { "type": "Feature", "properties": { "tipo": "edificio", "id": "B", "nombre": "Edificio B", "pisos": [1] },
      "geometry": { "type": "Polygon", "coordinates": [[[-76.9700, -12.1030], [-76.9696, -12.1030], [-76.9696, -12.1025], [-76.9700, -12.1025], [-76.9700, -12.1030]]] } },
    { "type": "Feature", "properties": { "tipo": "pasillo", "piso": 1 },
      "geometry": { "type": "LineString", "coordinates": [[-76.9700, -12.1028], [-76.9696, -12.1028]] } },
    { "type": "Feature", "properties": { "tipo": "destino", "id": "aula-b-101", "nombre": "Aula B-101", "categoria": "aulas", "edificio": "B", "piso": 1 },
      "geometry": { "type": "Point", "coordinates": [-76.9697, -12.10283] } },
    { "type": "Feature", "properties": { "tipo": "punto", "id": "BLE-0023", "tecnologia": "BLE", "edificio": "B", "piso": 1, "referencia": "Entrada B", "activo": true },
      "geometry": { "type": "Point", "coordinates": [-76.96995, -12.10278] } }
  ]
}
```

El mapa de ejemplo completo (edificios A, B y C del mockup) está en `compartido/datos/campus.geojson`.

## Cálculo de rutas (A\*)

En `compartido/mapa/`, para que lo usen las dos aplicaciones:

- `geojson.js`: formato, validación y proyección a metros.
- `grafo.js`: construye el grafo. Cada vértice de pasillo es un nodo, con su piso; las escaleras y los ascensores unen pisos (3 m por piso, más 10 m de espera en el ascensor).
- `a-estrella.js`: A* con cola de prioridad. La heurística es la distancia en línea recta más la altura de los pisos que faltan; nunca sobreestima, así que la ruta es la más corta. Con `evitarEscaleras` busca la alternativa sin escaleras.
- `dibujar.js`: dibuja el mapa en SVG.

La app del estudiante convierte el camino en pasos (`estudiante/funciones/ruta-guiada/calcular-ruta.js`): une los tramos rectos, detecta giros de más de 35°, avisa antes de las escaleras y dice el mensaje de los puntos activos que se pasan.
