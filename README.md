# InclusiveSight

Sistema de orientación por voz y vibración para que estudiantes universitarios ciegos o con baja visión se muevan con autonomía dentro del campus. Proyecto del curso **HCI for UX Design (1ASI0784)** de la UPC, Grupo 3 · AccessTech Solutions.

| | Enlace |
|---|---|
| Sitio publicado (GitHub Pages) | https://jethtr.github.io/Proyecto-InclusiveSight/ |
| Repositorio | https://github.com/JethTR/Proyecto-InclusiveSight |
| Mockups y prototipo en Figma | https://www.figma.com/design/mAMd9yocUOIolmdB7gkmNK |

## Qué es la entrega

El handbook del curso (capítulo V) pide una **Landing Page funcional** hecha con **HTML, CSS y JavaScript**, **responsive** (un solo código para celular, tablet y escritorio), **accesible**, publicada en **GitHub Pages** y que evidencie **30 Historias de Usuario core**. Las pruebas de aceptación y la validación con usuarios se hacen sobre la versión publicada.

En este proyecto la Landing Page es el sitio completo que se publica en GitHub Pages:

```
index.html (portada de la startup, en la raíz)
 ├── «Probar la app»      → pages/estudiante/      app del estudiante y del visitante
 └── «Panel de control»   → pages/administrador/   panel del coordinador del campus
```

Todo funciona en el navegador, sin servidor: las cuentas, favoritos y ajustes se guardan en el `localStorage` del navegador, y el mapa sale de `assets/datos/`. Así el sitio publicado en GitHub Pages es la versión completa que se evalúa.

## Estructura del repositorio

Sigue la estructura que pide el handbook:

```
├── index.html            ← portada de la startup: enlaza la app y el panel
├── .gitignore
├── assets/
│   ├── images/           ← logo-inclusivesight.svg
│   ├── icons/            ← favicon.svg (ícono del sitio en SVG)
│   └── datos/            ← campus.geojson (mapa del campus) y campus.json (categorías y avisos)
├── css/
│   ├── styles.css        ← estilos principales: variables (colores, tipografía, espacios), base y componentes
│   ├── landing.css       ← portada
│   ├── estudiante/       ← un archivo por función de la app (busqueda.css, ajustes.css, ruta-guiada.css…)
│   └── administrador/    ← panel.css y un archivo por función del panel
├── js/
│   ├── main.js           ← JavaScript principal de la portada
│   ├── compartido/       ← lo que usan la app y el panel
│   │   ├── componentes/  ← diálogos, campos, interruptores, plantillas, cuenta regresiva
│   │   ├── servicios/    ← cuenta simulada, datos del campus, almacenamiento, anuncios para lector de pantalla
│   │   ├── mapa/         ← GeoJSON: validación, grafo de caminos, algoritmo A* y dibujo en SVG
│   │   └── nucleo/       ← router.js
│   ├── estudiante/       ← app.js (arranque) + servicios/ + funciones/<función>/
│   └── administrador/    ← app.js (arranque) + servicios/ + funciones/<función>/
├── pages/
│   ├── estudiante/       ← index, auth, app y ayuda + fragmentos ruta-guiada.html y registrado.html
│   └── administrador/    ← index (acceso institucional) y panel
└── docs/
    ├── README.md         ← copia de este documento (el handbook pide el README dentro de docs/)
    ├── estudiante.md     ← detalle de la app del estudiante y del visitante
    ├── administrador.md  ← detalle del panel, formato del mapa GeoJSON y cálculo de rutas
    └── prompt_*.md       ← contexto del proyecto, épicas e historias de usuario
```

Dentro de cada carpeta principal, los archivos se agrupan por aplicación y por función: la búsqueda tiene `css/estudiante/busqueda.css` y `js/estudiante/funciones/busqueda/busqueda.js`. Lo que usan dos o más funciones va en `js/compartido/`, y una función nunca importa archivos de otra.

No se usan `assets/fonts/` ni `assets/videos/`: las fuentes (Atkinson Hyperlegible y Material Symbols) vienen de Google Fonts y el sitio no tiene videos.

## Historias de usuario implementadas

**Propuesta de las 30 HU core** (el equipo debe confirmarla): son las que resuelven el problema principal, que es buscar un destino y llegar a él con voz y vibración, más lo que el coordinador necesita para que eso funcione. Todas se pueden probar en el sitio publicado.

| HU | Historia | Dónde probarla |
|---|---|---|
| HU-0006 | Aviso de zona cerrada o cambio en la ruta | App (con cuenta) → Avisos |
| HU-0007 | Recordatorio de ruta programada | App (con cuenta) → Avisos → Programar recordatorio |
| HU-0014 | Tutorial inicial por voz | App → Ajustes → Ayuda y tutorial |
| HU-0015 | Práctica de patrones de vibración | Tutorial → práctica de vibración (en Android) |
| HU-0017 | Ajuste de intensidad de vibración | Ajustes → Intensidad de vibración → Probar vibración |
| HU-0018 | Nivel de detalle de las instrucciones | Ajustes → Instrucciones |
| HU-0019 | Velocidad de las instrucciones | Ajustes → Instrucciones → Escuchar ejemplo |
| HU-0020 | Modo de guía | Ajustes → Modo de guía |
| HU-0021 | Búsqueda de destino por voz | Buscar → micrófono (Chrome o Edge) |
| HU-0022 | Búsqueda por texto con sugerencias | Buscar → escribir 3 letras, por ejemplo «aul» |
| HU-0023 | Exploración por categoría | Buscar → Categorías |
| HU-0024 | Destinos cercanos | Buscar → Cerca |
| HU-0025 | Información del destino | Elegir un destino |
| HU-0026 | Inicio de la ruta guiada | Destino → Iniciar ruta |
| HU-0027 | Instrucciones por voz paso a paso | Durante la ruta |
| HU-0028 | Vibración en los giros | Durante la ruta (en Android) |
| HU-0029 | Recálculo de la ruta | Durante la ruta → buscar otra ruta sin escaleras |
| HU-0030 | Confirmación de llegada | Al terminar la ruta |
| HU-0031 | Pausar, reanudar y cancelar | Durante la ruta |
| HU-0032 | Alerta de escaleras y zonas de riesgo | Ruta que pase por una escalera |
| HU-0033 | Pedir ayuda durante el recorrido | Durante la ruta → Pedir ayuda |
| HU-0034 | Contacto de emergencia | Ajustes → Contacto de emergencia |
| HU-0035 | Guardar favoritos | Destino → Guardar en favoritos (con cuenta) |
| HU-0036 | Renombrar y eliminar favoritos | Mis rutas → Favoritos |
| HU-0037 | Historial de rutas recientes | Inicio de la app (Recientes) y Mis rutas |
| HU-0038 | Registrar un punto de referencia | Panel → Puntos de referencia → Registrar |
| HU-0039 | Editar, activar y desactivar puntos | Panel → Puntos → elegir un punto |
| HU-0040 | Estado de los puntos | Panel → Resumen y Puntos (activo, inactivo, batería baja) |
| HU-0041 | Mensaje de voz de cada punto | Panel → Puntos → editar mensaje |
| HU-0042 | Edificios, pisos y destinos | Panel → Mapa del campus (cargar GeoJSON) |

**También implementadas (adicionales):**
- HU-0001 a HU-0005: crear cuenta, iniciar sesión con bloqueo temporal, recuperar contraseña, uso como visitante y acceso institucional al panel.
- HU-0008: el panel avisa de puntos inactivos.
- HU-0009: preferencias de notificación.
- HU-0016: ayuda contextual en cada pantalla.

**No implementadas:**
- HU-0010 a HU-0013 (TalkBack y VoiceOver): dependen del lector de pantalla del sistema. La app las facilita con HTML semántico, etiquetas y anuncios.
- HU-0043 y HU-0044: zonas de riesgo y cierres temporales desde el panel.
- HU-0045 a HU-0048: reportes y métricas.

Para probar las funciones de cuenta, crea una cuenta en la app. El panel tiene una cuenta de prueba documentada en [`docs/administrador.md`](docs/administrador.md).

## Limitaciones del navegador

- **Vibración:** solo en Android con Chrome. El iPhone y las computadoras no vibran desde una página web; la app lo explica en pantalla.
- **Búsqueda por voz:** Chrome y Edge. Si no está disponible, se ofrece escribir.
- **Ubicación en el campus:** simulada. Una página web no puede escuchar balizas BLE. En una versión real, el estudiante indicaría su ubicación leyendo un código QR o una etiqueta NFC (esta última solo en Android).

## Decisiones tomadas

- Bloqueo de inicio de sesión: en cada intento fallido se informa cuántos quedan; al tercero se bloquea 15 minutos con una cuenta regresiva visible (o hasta recuperar la contraseña). Igual en la app y en el panel.
- Búsqueda sin coincidencias: "Sin resultados" y sugerencia de buscar por categoría (HU-0022).
- Cerca de mí sin ubicación: se informa el problema y se sugiere acercarse a un ingreso o pasillo principal (HU-0024).
- "Ayuda" en el inicio (M1) abre una página propia, `pages/estudiante/ayuda.html`, y no la aplicación.
- La ruta guiada se puede iniciar también en escritorio, tomando como modelo la versión móvil.

## Otros documentos

| Archivo | Qué es |
|---|---|
| [`docs/estudiante.md`](docs/estudiante.md) | App del estudiante y del visitante: vistas, servicios, modo invitado y registrado, accesibilidad |
| [`docs/administrador.md`](docs/administrador.md) | Panel del coordinador: acceso, vistas, formato del mapa GeoJSON y cálculo de rutas con A* |
| [`docs/prompt_contexto_InclusiveSight.md`](docs/prompt_contexto_InclusiveSight.md) | Contexto del proyecto: decisiones, épicas e historias de usuario |
| [`docs/prompt_claude_code_inclusivesight_v2.md`](docs/prompt_claude_code_inclusivesight_v2.md) | Instrucciones originales para construir la aplicación |

## Créditos

**Grupo 3 · AccessTech Solutions**

- Contreras Chumbirayco, Aldair Kenedy
- Juarez Zapata, Gonzalo Alonso
- Quillca Berrocal, Alvaro Waldo
- Rubio Román, Fabrizio Alonso
- Toribio Romero, Jeanbeth Jeferi
- Vegas Campomanes, Carlos Antonio