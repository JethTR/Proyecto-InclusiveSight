# Prompt para Claude Code · InclusiveSight (arquitectura por funciones)

## Contexto

Estoy construyendo **InclusiveSight**, una aplicación web que guía a estudiantes universitarios ciegos o con baja visión dentro de un campus con rutas por voz y vibración. Es un proyecto del curso Interacción Humano-Computador (UPC).

El repositorio tendrá **dos aplicaciones**: la del **estudiante/visitante** y la del **administrador** (coordinador del campus). **Por ahora solo se elabora el HTML de la aplicación del estudiante/visitante.** La del administrador se hará después.

La aplicación del estudiante tiene dos modos:
- **Registrado:** tiene cuenta y puede usar todo.
- **Visitante (invitado):** no tiene cuenta. Las funciones que dependen de una cuenta no se le muestran bloqueadas: directamente no aparecen.

## Restricciones técnicas

- Solo **HTML, CSS y JavaScript** puros. Sin frameworks, sin TypeScript, sin herramientas de compilación y sin librerías en producción.
- JavaScript con módulos ES (`type="module"`). Se prueba con un servidor local, no con `file://`.
- No hay backend. La cuenta se simula con `localStorage`, aislada en un solo archivo (`compartido/servicios/cuenta.js`) para cambiarla por un backend después. La cuenta guarda un `rol` (`estudiante` o `administrador`).
- Se publicará como sitio estático en GitHub Pages desde `/ (root)`. Todas las rutas deben ser **relativas** (nunca empezar con `/`) y respetar mayúsculas y minúsculas.

## Fuentes de verdad

1. **Mockups en Figma** (archivo `mAMd9yocUOIolmdB7gkmNK`): https://www.figma.com/design/mAMd9yocUOIolmdB7gkmNK . Pantallas web W0–W6 y celular M1–7.3. Si tienes el conector de Figma, úsalo. Si no, usa el HTML de referencia en `referencia/` (32 páginas, una por pantalla, con las clases y la estructura ya definidas).
2. **Documento del proyecto:** `claude/prompt_contexto_InclusiveSight.md` (decisiones, épicas e historias de usuario).

Si algo no está en esas dos fuentes, **pregúntame. No lo inventes.** Si ya existe una versión anterior del módulo del estudiante en la carpeta, **reorganízala con esta arquitectura** y no rehagas desde cero lo que ya cumple.

## Arquitectura: por funciones ("screaming architecture")

Las carpetas se ordenan por **lo que hace la aplicación** (búsqueda, ruta guiada, mis rutas...) y no por tipo de archivo. Cada función guarda junto su HTML, su CSS y su JS.

Reglas:
- Lo que pertenece a una sola función va dentro de su carpeta.
- Lo que usan dos o más funciones va en `compartido/`.
- **Una función no importa archivos de otra función.** Si necesita algo en común, se mueve a `compartido/`.
- Lo que usan las dos aplicaciones (estudiante y administrador) va en `compartido/` de la raíz. Lo que solo usa el estudiante va dentro de `estudiante/`.

### Estructura del repositorio

```
inclusivesight/
├── README.md                    ← qué es, cómo correrlo, enlaces, integrantes
├── .gitignore
├── docs/                        ← informe, decisiones, enlaces a Figma, prompts
│
├── compartido/                  ← lo que usan LAS DOS apps
│   ├── estilos/{variables,base,componentes}.css
│   ├── componentes/             ← diálogo, campo, interruptor... (JS)
│   ├── servicios/{cuenta,almacenamiento,anuncios}.js
│   ├── img/logo-inclusivesight.svg
│   └── datos/destinos.json      ← solo desarrollo; se borra cuando haya backend
│
├── estudiante/                  ← ESTA FASE
│   ├── index.html               ← inicio (M1)
│   ├── auth.html                ← iniciar sesión, crear cuenta, recuperar
│   ├── app.html                 ← esqueleto + vistas de uso general
│   ├── funciones/
│   │   ├── acceso/              ← acceso.css, acceso.js
│   │   ├── busqueda/            ← busqueda.css, busqueda.js
│   │   ├── ruta-guiada/         ← ruta-guiada.html, .css, .js, calcular-ruta.js
│   │   ├── registrado/          ← registrado.html (solo HTML de las tres de abajo)
│   │   ├── mis-rutas/           ← mis-rutas.css, mis-rutas.js
│   │   ├── avisos/              ← avisos.css, avisos.js
│   │   ├── cuenta/              ← cuenta.css, cuenta.js
│   │   ├── ajustes/             ← ajustes.css, ajustes.js
│   │   └── ayuda/               ← ayuda.css, ayuda.js
│   ├── servicios/{voz,vibracion,ubicacion}.js
│   ├── nucleo/{app,router}.js
│   └── README.md
│
└── administrador/               ← NO se hace ahora
    └── README.md                ← una línea: "Pendiente. Se hará después."
```

### Los cinco archivos HTML del estudiante

| Archivo | Qué contiene | Quién lo descarga |
|---|---|---|
| `estudiante/index.html` | Inicio (M1) | Todos |
| `estudiante/auth.html` | Iniciar sesión, crear cuenta y recuperar contraseña | Todos |
| `estudiante/app.html` | Esqueleto (enlace de salto, menú, barra superior, `<main id="vista">`, región `aria-live`, diálogos comunes) + las vistas de uso general: **tutorial, ayuda, buscar, destino, ajustes, modo de guía e instrucciones** | Todos |
| `estudiante/funciones/ruta-guiada/ruta-guiada.html` | **Vista previa de la ruta, guía en curso con sus estados y contacto de emergencia** | Todos |
| `estudiante/funciones/registrado/registrado.html` | **Mis rutas, Avisos y Cuenta** | Solo registrado (el visitante no lo descarga) |

`ruta-guiada.html` y `registrado.html` son **fragmentos** (sin `<!DOCTYPE>`, `<html>` ni `<body>`, solo `<section>`). El router los carga con `fetch`, los inserta en `<main>`, los guarda en memoria para no pedirlos otra vez, y muestra un mensaje accesible si la carga falla.

### CSS y JS

- Todos los archivos de CSS y JS se crean **vacíos, con un comentario** que diga qué irá en cada uno.
- Cada función tiene su propio CSS y su propio JS, aunque su HTML esté en `app.html`.
- El router, al entrar a una función, carga su HTML (si es un fragmento), su CSS y su JS.
- Las funciones pequeñas sin lógica pueden compartir JS si el comentario lo explica.

## Qué hacer en esta fase

**Fase 1 (ahora): estructura de carpetas, los cinco HTML del estudiante y los archivos vacíos.** No escribas todavía estilos ni lógica. Crea `compartido/` y `administrador/README.md` solo como se muestra arriba. Cuando termines, **para y espera mi revisión**.

Fases siguientes (no las hagas ahora): 2) CSS fiel al mockup, escritorio y celular; 3) JavaScript: router, modo invitado/registrado, cuenta simulada, vistas; 4) voz, vibración, ruta y mapa; 5) aplicación del administrador.

## `index.html` (pantalla M1)

Solo esto, de arriba hacia abajo, sin nada más:
1. Logo y nombre "InclusiveSight".
2. La frase: "Llega a tu clase con rutas guiadas por voz y vibración".
3. Botón **Continuar como invitado** (va a `app.html`).
4. Botón **Iniciar sesión** (va a `auth.html#iniciar-sesion`). Sin campos.
5. Enlaces: **Crear cuenta** (`auth.html#crear-cuenta`), **Tutorial** (`app.html#tutorial`) y **Ayuda** (`app.html#ayuda`).

No agregues descripciones, notas, capturas, opiniones, "beneficios" ni nada de marketing. No es una landing page.

## `auth.html`

Tres secciones, y solo una visible a la vez, según el hash de la URL (`#iniciar-sesion`, `#crear-cuenta`, `#recuperar`). Ocúltalas con el atributo `hidden`, no con una clase.

- **Iniciar sesión (1.2):** flecha de volver, título, campo Correo (ícono de sobre y texto de ejemplo `nombre@correo.com`), campo Contraseña (ícono de candado y botón "Mostrar"), enlace "¿Olvidaste tu contraseña?", botón "Iniciar sesión" y enlace "Crear cuenta". El mensaje de error es genérico y no dice qué dato falló. Bloqueo tras 3 intentos fallidos.
- **Crear cuenta (1.1):** nombre, correo, contraseña (mínimo 8 caracteres), botón "Crear cuenta" y "Ahora no, seguir como invitado".
- **Recuperar contraseña (1.3):** correo, botón "Enviar enlace", mensaje de confirmación (oculto hasta enviar) y "Volver a iniciar sesión".

## Vistas de la aplicación (`app.html` y fragmentos)

Cada vista es una `<section>` con `hidden`, y se muestra según el hash (`#buscar`, `#destino`, ...). Hay un solo menú, que se escribe una vez en `app.html`: menú lateral en escritorio y barra inferior en celular. Usa las mismas clases y el mismo esqueleto del HTML de referencia.

| Vista (hash) | Pantallas del mockup | Dónde está su HTML | Quién la ve |
|---|---|---|---|
| `tutorial` | 2.1, 2.2, 2.3 (práctica de vibración) | `app.html` | Todos |
| `ayuda` | 2.4 y cuadro de ayuda contextual de cada vista | `app.html` | Todos |
| `buscar` | W1, M2, 3.1 voz, 3.2 texto, 3.3 categorías, 3.4 cerca de mí (estados) | `app.html` | Todos |
| `destino` | W2, 3.5 | `app.html` | Todos |
| `ajustes` | W6, 7.1 | `app.html` | Todos |
| `modo-guia` | 7.2 | `app.html` | Todos |
| `instrucciones` | 7.3 | `app.html` | Todos |
| `ruta` | W4 vista previa | `ruta-guiada.html` | Todos |
| `guia` | M3 y estados 4.1 giro, 4.2 recalculando, 4.3 alerta de riesgo, 4.4 pausa, 4.5 cancelar, 4.6 pedir ayuda, 4.7 llegada | `ruta-guiada.html` | Todos |
| `contacto-emergencia` | 4.8 | `ruta-guiada.html` | Todos |
| `mis-rutas` | W3, 5.1 favoritos, 5.2 recientes, 5.3 editar favorito, 5.4 confirmar eliminación | `registrado.html` | Solo registrado |
| `avisos` | W5, 6.1, 6.2 zona cerrada, 6.3 programar recordatorio, 6.4 notificaciones | `registrado.html` | Solo registrado |
| `cuenta` | 1.4 | `registrado.html` | Solo registrado |

La guía en curso nunca debe recargar la página entre pasos, para que no se corten la voz, la vibración ni el seguimiento de ubicación.

## Modo invitado y registrado

- `<body data-modo="invitado">` o `"registrado"`.
- `[data-requiere-cuenta]`: Mis rutas, Avisos, Favoritos, Recientes, Guardar en favoritos, Notificaciones y Cuenta. En modo invitado no aparecen.
- `[data-solo-invitado]`: "Invitado / Sin cuenta" e "Iniciar sesión o crear cuenta".
- Si un invitado entra por URL a una vista de solo registrados, redirígelo a `auth.html#iniciar-sesion`. El fragmento `registrado.html` ni siquiera se descarga para el invitado.
- **Ajustes es para todos.** Para el invitado se guardan solo en ese dispositivo.
- Las alertas de peligro no se pueden desactivar.

## Sin datos inventados (importante)

- No pongas nombres de personas, correos, edificios, aulas, distancias, tiempos, pasos de ruta, favoritos, recientes ni avisos de ejemplo. Nada de lo que en el mockup es relleno.
- Los datos que cambian se dejan como contenedores vacíos con una marca, por ejemplo `data-dato="nombre-usuario"`. Las listas llevan un `<template>` para cada elemento.
- El mapa es un contenedor vacío con una descripción de texto.
- Los mensajes que dependen de un resultado (error de inicio de sesión, "sin resultados") quedan ocultos hasta que hagan falta.
- Sí se quedan los textos fijos de la interfaz: botones, títulos, etiquetas, instrucciones, alertas de seguridad y el tutorial.
- Los únicos datos de ejemplo permitidos están en `compartido/datos/destinos.json`, y solo para desarrollo.

## Fidelidad al mockup

- Tipografía **Atkinson Hyperlegible**. Íconos **Material Symbols Rounded**, con el mismo nombre que tienen las capas `icon/xxx` del Figma.
- Colores y tamaños de `compartido/estilos/variables.css`, tomados del Figma.
- Logo: `compartido/img/logo-inclusivesight.svg` (ojo blanco con pin amarillo sobre fondo azul `#12307A`).

## Accesibilidad (obligatorio)

- `lang="es"`, enlace "Saltar al contenido principal" al inicio de **todas** las páginas, y regiones `header`, `nav`, `main`.
- Un solo `h1` por vista, encabezados sin saltos de nivel.
- Todos los campos con `label`. Los interruptores son `button role="switch"` con `aria-checked`. Las opciones de radio van en `fieldset` con `legend`.
- **Al cambiar de vista:** mover el foco al `h1` de la vista, actualizar `document.title` y anunciar el cambio en una región `aria-live`. El botón "atrás" del navegador debe funcionar.
- Instrucción de la guía y llegada con `aria-live`. Alertas de riesgo con `role="alert"`.
- Botones solo con ícono llevan `aria-label`. Íconos decorativos con `aria-hidden="true"`.
- El mapa es un complemento: toda su información también está en texto.
- Áreas táctiles de al menos 48 px y contraste AA o mejor.

## Entregables y revisión

- La estructura de carpetas, los cinco HTML y el `README.md` de la raíz y el de `estudiante/` (qué hay en cada carpeta, cómo correrlo con un servidor local, cómo funciona el modo invitado/registrado y la tabla de vistas).
- Valida con `html-validate` (reglas `recommended` y `a11y`). Los fragmentos no llevan `<!DOCTYPE>`, así que configura la validación para que los acepte, o valídalos dentro de una página de prueba. Revisa que no haya enlaces ni anclas rotos ni ids repetidos, y que **todas las rutas sean relativas**.
- Al terminar, dime en pocas líneas qué hiciste, qué dudas tuviste y qué decidiste por tu cuenta.

## Lo que no debes hacer

- No uses frameworks ni librerías.
- No agregues páginas ni secciones que no estén en el mockup (landing, opiniones, "beneficios").
- No inventes datos ni textos.
- No hagas nada de la aplicación del administrador.
- No empieces CSS ni JavaScript hasta que yo apruebe la Fase 1.
