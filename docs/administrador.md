# InclusiveSight · Panel del coordinador

Panel web para que la oficina de inclusión cargue el **mapa del campus (GeoJSON)** y gestione los **puntos de referencia**. Todo lo que se guarda aquí lo usa la app del estudiante: búsqueda, distancias, rutas calculadas con **A\***, alertas de escaleras y mensajes de voz de los puntos.

**Estado:** acceso institucional, Resumen, Puntos de referencia y Mapa del campus. Pendiente: zonas de riesgo, cierres temporalesy reportes.

## Cómo entrar

Solo entran cuentas con rol `administrador`; una cuenta de estudiante ve "Esta cuenta no está autorizada para el panel". Mientras no haya backend existe una **cuenta de prueba de desarrollo**, que se crea sola al abrir el acceso:

| Correo | Contraseña |
|---|---|
| `coordinacion@universidad.edu.pe` | `Coordinacion2026` |

Está en `js/administrador/funciones/acceso/acceso.js`. Se borrara cuando exista el backend. El panel tiene su propia sesión: entrar aquí no abre sesión en la app del estudiante.

Tras 3 intentos fallidos el acceso se bloquea 15 minutos y el aviso muestra una cuenta regresiva; al terminar se puede volver a intentar.

## Dónde está cada archivo

```
pages/administrador/
├── index.html               ← Acceso institucional
└── panel.html               ← esqueleto + vistas resumen, puntos y mapa

css/administrador/
├── panel.css                ← estilos que usan varias funciones del panel (tablas, indicadores, estados)
└── acceso, resumen, puntos y mapa (.css)

js/administrador/
├── app.js                   ← sesión del panel, alertas y router (js/compartido/nucleo/router.js)
├── servicios/estado-puntos.js  ← estado de un punto (activo, inactivo, batería baja)
└── funciones/
    ├── acceso/              ← acceso.js
    ├── resumen/             ← resumen.js
    ├── puntos/              ← puntos.js
    └── mapa/                ← mapa.js
```
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
- Las categorías de los destinos (`aulas`, `banos`, `biblioteca`...) están en `assets/datos/campus.json`.
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

El mapa de ejemplo completo (edificios A, B y C del mockup) está en `assets/datos/campus.geojson`.

## Cálculo de rutas (A\*)

En `js/compartido/mapa/`, para que lo usen las dos aplicaciones:

- `geojson.js`: formato, validación y proyección a metros.
- `grafo.js`: construye el grafo. Cada vértice de pasillo es un nodo, con su piso; las escaleras y los ascensores unen pisos (3 m por piso, más 10 m de espera en el ascensor).
- `a-estrella.js`: A* con cola de prioridad. La heurística es la distancia en línea recta más la altura de los pisos que faltan; nunca sobreestima, así que la ruta es la más corta. Con `evitarEscaleras` busca la alternativa sin escaleras.
- `dibujar.js`: dibuja el mapa en SVG.

La app del estudiante convierte el camino en pasos (`js/estudiante/funciones/ruta-guiada/calcular-ruta.js`): une los tramos rectos, detecta giros de más de 35°, avisa antes de las escaleras y dice el mensaje de los puntos activos que se pasan.
