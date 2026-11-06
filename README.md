# InclusiveSight

Sistema de orientación por voz y vibración para que estudiantes universitarios ciegos o con baja visión se muevan con autonomía dentro del campus. Proyecto del curso **HCI for UX Design (1ASI0784)** de la UPC, Grupo 3 · AccessTech Solutions.

**Sitio publicado:** https://jethtr.github.io/Proyecto-InclusiveSight/

El repositorio tiene la landing page y dos aplicaciones web, hechas con HTML, CSS y JavaScript puros, sin frameworks ni herramientas de compilación:

| Parte | Carpeta | Estado |
|---|---|---|
| Landing page | [`index.html`](index.html) y [`landing/`](landing/) | Publicada |
| Estudiante y visitante | [`estudiante/`](estudiante/README.md) | Fase 1: estructura HTML |
| Administrador (coordinador del campus) | [`administrador/`](administrador/README.md) | Pendiente |

## Carpetas

```
├── index.html         ← landing page (lo primero que se ve en GitHub Pages)
├── landing/           ← landing.css y landing.js
├── README.md
├── .gitignore
├── docs/              ← documento del proyecto, prompts y enlaces
├── compartido/        ← lo que usan las dos aplicaciones
│   ├── estilos/       ← variables.css, base.css, componentes.css
│   ├── componentes/   ← dialogo.js, campo.js, interruptor.js
│   ├── servicios/     ← cuenta.js (cuenta simulada), almacenamiento.js, anuncios.js
│   ├── img/           ← logo-inclusivesight.svg
│   └── datos/         ← destinos.json (solo desarrollo; se borra cuando haya backend)
├── estudiante/        ← aplicación del estudiante y visitante
└── administrador/     ← aplicación del administrador (pendiente)
```

Las carpetas se ordenan por función ("screaming architecture"): cada función guarda junto su HTML, su CSS y su JS. Lo que usan dos o más funciones va en `compartido/`, y una función nunca importa archivos de otra.

## Cómo correrlo

El JavaScript usa módulos ES, que no funcionan abriendo los archivos con doble clic (`file://`). Hay que usar un servidor local desde la raíz del repositorio. Por ejemplo, con Python:

```bash
python -m http.server 8000
```

Luego abre `http://localhost:8000/` (landing) o `http://localhost:8000/estudiante/` (app). También sirve la extensión Live Server de VS Code.

## Publicación

GitHub Pages, desde la rama `main` y la carpeta `/ (root)`: *Settings → Pages → Deploy from branch*. Todas las rutas son relativas y respetan mayúsculas y minúsculas, así que funcionan en la URL del repositorio.

## Enlaces

- Mockups en Figma: https://www.figma.com/design/mAMd9yocUOIolmdB7gkmNK

## Integrantes

- Contreras Chumbirayco, Aldair Kenedy
- Juarez Zapata, Gonzalo Alonso
- Quillca Berrocal, Alvaro Waldo
- Rubio Román, Fabrizio Alonso
- Toribio Romero, Jeanbeth Jeferi
- Vegas Campomanes, Carlos Antonio
