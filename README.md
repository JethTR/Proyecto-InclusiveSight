# InclusiveSight

Sistema de orientación por voz y vibración para que estudiantes universitarios ciegos o con baja visión se muevan con autonomía dentro del campus. Proyecto del curso **HCI for UX Design (1ASI0784)** de la UPC, Grupo 3 · AccessTech Solutions.

| | Enlace |
|---|---|
| Sitio publicado (GitHub Pages) | https://jethtr.github.io/Proyecto-InclusiveSight/ |
| Repositorio | https://github.com/JethTR/Proyecto-InclusiveSight |
| Mockups y prototipo en Figma | https://www.figma.com/design/mAMd9yocUOIolmdB7gkmNK |

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

## Otros documentos

| Archivo | Qué es |
|---|---|
| [`docs/estudiante.md`](docs/estudiante.md) | Contexto del app web del estudiante y del visitante: vistas, servicios, modo invitado y registrado, accesibilidad |
| [`docs/administrador.md`](docs/administrador.md) | Contexto del panel del coordinador: acceso, vistas, formato del mapa GeoJSON y cálculo de rutas con A* |

## Créditos

**Grupo 3 · AccessTech Solutions**

- Contreras Chumbirayco, Aldair Kenedy
- Juarez Zapata, Gonzalo Alonso
- Quillca Berrocal, Alvaro Waldo
- Rubio Román, Fabrizio Alonso
- Toribio Romero, Jeanbeth Jeferi
- Vegas Campomanes, Carlos Antonio
