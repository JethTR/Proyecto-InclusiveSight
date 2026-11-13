# InclusiveSight · Aplicación del estudiante y visitante

Rutas guiadas por voz y vibración dentro del campus, para estudiantes ciegos o con baja visión. Tiene dos modos: **registrado** (con cuenta, puede usar todo) y **visitante** (sin cuenta; lo que depende de una cuenta no aparece).

**Estado:** HTML, CSS y JavaScript completos para todas las vistas. Sin backend: la cuenta se simula con `localStorage`. Los destinos, los puntos de referencia y los caminos salen del mapa GeoJSON del campus (el que carga el administrador o, si no cargó ninguno, `compartido/datos/campus.geojson`). Las distancias, los tiempos, los avisos de escaleras y los pasos de la guía se calculan con el algoritmo A* (`compartido/mapa/`). Mientras no haya balizas, `servicios/ubicacion.js` simula la ubicación (un punto de referencia fijo) y el avance por la ruta (un paso cada 8 segundos). El mapa se dibuja en SVG como complemento: su información también está en texto. Se encuadra solo en la ruta o el destino, se puede acercar, alejar y arrastrar, y tiene botones para ver cada piso que recorre la ruta.

### Servicios del estudiante (`servicios/`)

| Archivo | Qué hace |
|---|---|
| `voz.js` | Síntesis de voz (respeta modo y velocidad; elige una voz en español, de preferencia de Perú o Latinoamérica) y reconocimiento para la búsqueda por voz |
| `vibracion.js` | Patrones de vibración (respeta modo e intensidad; la alerta de riesgo siempre vibra al máximo). `motivoSinVibracion()` explica por qué un dispositivo no vibra: las computadoras y el iPhone no vibran desde el navegador |
| `ubicacion.js` | Ubicación actual y avance por la ruta (simulados) |
| `preferencias.js` | Modo de guía, tipo de pulso, intensidad, detalle, velocidad de la voz (multiplicador) y notificaciones |
| `rutas-guardadas.js` | Favoritos y recientes (últimas 10; el visitante las guarda solo en el dispositivo) |
| `recordatorios.js` | Recordatorios de ruta y aviso a la hora calculada |
| `contacto-emergencia.js` | Contacto de emergencia |
| `datos-usuario.js` | Guarda cada dato a nombre del usuario, o solo en el dispositivo si es visitante |

## Carpetas

```
estudiante/
├── index.html               ← inicio (M1)
├── auth.html                ← iniciar sesión (1.2), crear cuenta (1.1) y recuperar contraseña (1.3)
├── app.html                 ← esqueleto + vistas de uso general
├── ayuda.html               ← ayuda (se abre desde "Ayuda" en M1)
├── funciones/
│   ├── acceso/              ← acceso.css, acceso.js            (index.html y auth.html)
│   ├── busqueda/            ← busqueda.css, busqueda.js        (vistas buscar y destino)
│   ├── ruta-guiada/         ← ruta-guiada.html, .css, .js, calcular-ruta.js
│   ├── registrado/          ← registrado.html                  (solo el HTML de mis-rutas, avisos y cuenta)
│   ├── mis-rutas/           ← mis-rutas.css, mis-rutas.js
│   ├── avisos/              ← avisos.css, avisos.js
│   ├── cuenta/              ← cuenta.css, cuenta.js
│   ├── ajustes/             ← ajustes.css, ajustes.js          (ajustes, modo-guia e instrucciones)
│   └── ayuda/               ← ayuda.css, ayuda.js              (ayuda.html, tutorial y cuadros de ayuda)
├── servicios/               ← voz.js, vibracion.js, ubicacion.js
└── nucleo/                  ← app.js (arranque) y router.js
```

Lo que usan también el administrador (estilos base, componentes, cuenta simulada, logo, datos de desarrollo) está en [`../compartido/`](../README.md).

## Los HTML

| Archivo | Qué contiene | Quién lo descarga |
|---|---|---|
| `index.html` | Inicio (M1) | Todos |
| `auth.html` | Iniciar sesión, crear cuenta y recuperar contraseña | Todos |
| `app.html` | Esqueleto (enlace de salto, menú, `<main id="vista">`, mensaje de error de carga, región `aria-live`) y las vistas tutorial, buscar, destino, ajustes, modo-guia e instrucciones | Todos |
| `ayuda.html` | Los textos de ayuda de cada pantalla, el tutorial y la práctica de vibración | Todos |
| `funciones/ruta-guiada/ruta-guiada.html` | Fragmento: vistas ruta, guia y contacto-emergencia | Todos |
| `funciones/registrado/registrado.html` | Fragmento: vistas mis-rutas, avisos y cuenta | Solo registrado |

Los fragmentos no llevan `<!DOCTYPE>`, `<html>` ni `<body>`: son solo `<section>` y `<template>`. El router los carga con `fetch`, los inserta en `<main id="vista">`, los guarda en memoria para no pedirlos otra vez y, si la carga falla, muestra el mensaje `[data-mensaje="error-carga"]` con el botón "Reintentar". Sus rutas internas son relativas a `app.html`.

## Cómo correrlo

Necesita un servidor local, porque los módulos ES y `fetch` no funcionan con `file://`. Desde la raíz del repositorio:

```bash
python -m http.server 8000
```

y abre `http://localhost:8000/estudiante/`. También sirve Live Server de VS Code.

## Vistas y hash

`auth.html` y `app.html` muestran una sola sección a la vez según el hash. Las demás llevan `hidden`.

- Formato: `#vista` o `#vista/parte` (ej. `#mis-rutas/recientes`, `#buscar/voz`, `#tutorial/2`). En `destino`, `ruta` y `guia`, la segunda parte es el id del destino (`#destino/<id>`).
- Sin hash: `auth.html` muestra `#iniciar-sesion` y `app.html` muestra `#buscar`.
- Al cambiar de vista, el router mueve el foco al `h1`, actualiza `document.title` y anuncia el cambio. El botón "atrás" funciona porque cada cambio es un hash nuevo.
- Al entrar a una función, el router carga su CSS y su JS (y su HTML si es un fragmento).
- La guía en curso nunca recarga la página: sus estados se cambian con `data-estado` y `hidden`.

| Vista (hash) | Pantallas del mockup | Dónde está su HTML | CSS y JS | Quién la ve |
|---|---|---|---|---|
| `tutorial` | 2.1, 2.2, 2.3 | `app.html` | `ayuda/` | Todos |
| `buscar` | W1, M2, 3.1, 3.2, 3.3, 3.4 (sin búsqueda muestra las rutas recientes) | `app.html` | `busqueda/` | Todos |
| `destino` | W2, 3.5 | `app.html` | `busqueda/` | Todos |
| `ajustes` | 7.1 (también en la web, en lugar de W6) | `app.html` | `ajustes/` | Todos |
| `modo-guia` | 7.2 (voz y vibración, solo vibración o solo voz) | `app.html` | `ajustes/` | Todos |
| `intensidad` | 7.2 (tipo de pulso: largo, medio o suave, y barra de intensidad) | `app.html` | `ajustes/` | Todos |
| `instrucciones` | 7.3 (detalle y velocidad de la voz, de x0.5 a x2) | `app.html` | `ajustes/` | Todos |
| `ruta` | W4 | `ruta-guiada.html` | `ruta-guiada/` | Todos |
| `guia` | M3, 4.1 a 4.7 | `ruta-guiada.html` | `ruta-guiada/` | Todos |
| `contacto-emergencia` | 4.8 | `ruta-guiada.html` | `ruta-guiada/` | Todos |
| `mis-rutas` | W3, 5.1 a 5.4 | `registrado.html` | `mis-rutas/` | Solo registrado |
| `avisos` | W5, 6.1 a 6.4 | `registrado.html` | `avisos/` | Solo registrado |
| `cuenta` | 1.4 | `registrado.html` | `cuenta/` | Solo registrado |

La ayuda contextual (2.4) de cada vista es un `<dialog>` dentro de esa vista. La página `ayuda.html` reúne esos mismos textos.

## Modo invitado y registrado

- `<body data-modo="invitado">` o `"registrado"`. Lo pone `nucleo/app.js` según `compartido/servicios/cuenta.js`.
- `[data-requiere-cuenta]`: Mis rutas, Avisos, Favoritos, Recientes, Guardar en favoritos, Notificaciones y Cuenta. En modo invitado no aparecen.
- `[data-solo-invitado]`: "Invitado / Sin cuenta" e "Iniciar sesión o crear cuenta".
- Un invitado que entra por URL a una vista de solo registrados va a `auth.html#iniciar-sesion`, y `registrado.html` no se descarga.
- Ajustes es para todos. Para el invitado se guardan solo en ese dispositivo.
- Ajustes tiene la misma estructura en la web y en el celular (la lista de 7.1). Modo de guía e Intensidad de vibración son pantallas separadas.
- Intensidad: la Vibration API no cambia la fuerza del motor, así que la intensidad alarga o acorta cada vibración (Baja ×0.6, Media ×1, Alta ×1.4, y Alta acorta las pausas); el tipo de pulso también cambia la duración. Ninguna vibración baja de 80 ms: muchos motores Android no arrancan con pulsos más cortos (por eso se descartó prender y apagar el motor cada 40 ms).
- El inicio (`#buscar`) muestra las últimas 5 rutas recientes mientras no se escribe ni se elige una categoría; si no hay, un mensaje lo dice. Al buscar, aparecen los resultados.
- Después de buscar por voz siempre aparece «Buscar otra vez por voz». "Probar vibración" y "Escuchar ejemplo" muestran en pantalla qué se está probando o por qué el dispositivo no puede hacerlo.
- Las alertas de peligro no se pueden desactivar.

Mientras no exista el JavaScript, el CSS puede ocultar lo que no corresponde:

```css
body[data-modo="invitado"] [data-requiere-cuenta],
body[data-modo="registrado"] [data-solo-invitado] { display: none; }
```

## Inicio de sesión

- El error es genérico ("Correo o contraseña incorrectos") y no dice qué dato falló. En cada intento fallido también dice cuántos intentos quedan.
- Al tercer intento fallido el inicio de sesión se bloquea, y el mensaje lleva a recuperar la contraseña.
- Al recuperar la contraseña sí se informa si el correo no está registrado (decisión del equipo).

## Marcas en el HTML

| Marca | Para qué sirve |
|---|---|
| `data-dato="..."` | Texto que llena el JavaScript |
| `data-lista` + `<template data-plantilla>` | Listas: el JavaScript clona la plantilla por cada elemento |
| `data-mensaje="..."` | Mensajes que dependen de un resultado; quedan ocultos hasta que hacen falta |
| `data-accion="..."` | Botones que conecta el JavaScript |
| `data-parte` / `data-estado` | Partes de una vista (segundo segmento del hash) y estados de la guía |
| `data-pantalla-completa` | Vista sin menú (tutorial y guía) |
| `data-barra-movil="oculta"` | En celular no se muestra la barra inferior |
| `data-dispositivo="movil"` / `"escritorio"` | Contenido que solo aparece en uno de los dos |

No hay datos inventados en el HTML. Los únicos datos de ejemplo están en `compartido/datos/` (`campus.geojson` y `campus.json`).

## Íconos y tipografía

- **Atkinson Hyperlegible** y **Material Symbols Rounded**, de Google Fonts.
- Ícono: `<span class="icono material-symbols-rounded" aria-hidden="true">nombre</span>`.
- El enlace de Material Symbols lleva en `icon_names` solo los íconos usados (incluidos los de los fragmentos), en orden alfabético y con la misma lista en las cuatro páginas. Si agregas un ícono, agrégalo a la lista de las cuatro.

## Accesibilidad

- `lang="es"` y "Saltar al contenido principal" en todas las páginas.
- Un `h1` por vista y encabezados sin saltos de nivel.
- Todos los campos con `label`. Interruptores con `button role="switch"` y `aria-checked`. Radios en `fieldset` con `legend`.
- Instrucción de la guía y llegada con `aria-live`. Alertas de riesgo con `role="alert"`.
- Botones solo con ícono con `aria-label`. Íconos decorativos con `aria-hidden="true"`.
- El mapa es un complemento: toda su información también está en texto.

## Verificación

Revisado con un verificador propio (Python) sobre las páginas y sobre `app.html` con los dos fragmentos insertados: no hay ids repetidos, enlaces o anclas rotos, referencias ARIA rotas, encabezados vacíos ni campos sin etiqueta; cada vista tiene un solo `h1` y todas las rutas son relativas.

Falta pasar `html-validate` (reglas `recommended` y `a11y`), que necesita Node.js. Hay que activar `allowMultipleH1` en `heading-level` (un `h1` por vista) y validar los fragmentos dentro de una página de prueba o con la opción para fragmentos.
