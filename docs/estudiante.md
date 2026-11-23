# InclusiveSight · Aplicación del estudiante y visitante

Rutas guiadas por voz y vibración dentro del campus, para estudiantes ciegos o con baja visión. Tiene dos modos: **registrado** (con cuenta, puede usar todo) y **visitante** (sin cuenta; lo que depende de una cuenta no aparece).

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

## Dónde está cada archivo

Siguiendo la estructura del handbook (carpetas `pages/`, `css/`, `js/` y `assets/`), cada función de la app tiene su HTML en `pages/estudiante/`, su CSS en `css/estudiante/` y su JS en `js/estudiante/funciones/<función>/`:

```
pages/estudiante/
├── index.html               ← inicio 
├── auth.html                ← iniciar sesión, crear cuenta y recuperar contraseña
├── app.html                 ← esqueleto + vistas de uso general
├── ayuda.html               ← ayuda
├── ruta-guiada.html         ← fragmento: vistas ruta, guia y contacto-emergencia
└── registrado.html          ← fragmento: vistas mis-rutas, avisos y cuenta (solo con cuenta)

css/estudiante/              ← acceso, busqueda, ruta-guiada, mis-rutas, avisos, cuenta, ajustes y ayuda (.css)

js/estudiante/
├── app.js                   ← arranque y lista de vistas (el router está en js/compartido/nucleo/)
├── servicios/               ← voz, vibración, ubicación, preferencias, rutas guardadas, recordatorios… (tabla de arriba)
└── funciones/
    ├── acceso/              ← acceso.js            (index.html y auth.html)
    ├── busqueda/            ← busqueda.js          (vistas buscar y destino)
    ├── ruta-guiada/         ← ruta-guiada.js y calcular-ruta.js
    ├── mis-rutas/           ← mis-rutas.js
    ├── avisos/              ← avisos.js
    ├── cuenta/              ← cuenta.js
    ├── ajustes/             ← ajustes.js           (ajustes, modo-guia, intensidad e instrucciones)
    └── ayuda/               ← ayuda.js             (ayuda.html, tutorial y cuadros de ayuda)
```

Lo que usa también el panel está en `css/styles.css` (estilos principales), `js/compartido/` (componentes, cuenta simulada, mapa y router) y `assets/` (logo y datos del campus).

## Los HTML

| Archivo | Qué contiene | Quién lo descarga |
|---|---|---|
| `index.html` | Inicio (M1) | Todos |
| `auth.html` | Iniciar sesión, crear cuenta y recuperar contraseña | Todos |
| `app.html` | Esqueleto (enlace de salto, menú, `<main id="vista">`, mensaje de error de carga, región `aria-live`) y las vistas tutorial, buscar, destino, ajustes, modo-guia e instrucciones | Todos |
| `ayuda.html` | Los textos de ayuda de cada pantalla, el tutorial y la práctica de vibración | Todos |
| `ruta-guiada.html` | Fragmento: vistas ruta, guia y contacto-emergencia | Todos |
| `registrado.html` | Fragmento: vistas mis-rutas, avisos y cuenta | Solo registrado |

Los fragmentos no llevan `<!DOCTYPE>`, `<html>` ni `<body>`: son solo `<section>` y `<template>`. El router los carga con `fetch`, los inserta en `<main id="vista">`, los guarda en memoria para no pedirlos otra vez y, si la carga falla, muestra el mensaje `[data-mensaje="error-carga"]` con el botón "Reintentar". Sus rutas internas son relativas a `app.html`.

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

## Accesibilidad

- `lang="es"` y "Saltar al contenido principal" en todas las páginas.
- Un `h1` por vista y encabezados sin saltos de nivel.
- Todos los campos con `label`. Interruptores con `button role="switch"` y `aria-checked`. Radios en `fieldset` con `legend`.
- Instrucción de la guía y llegada con `aria-live`. Alertas de riesgo con `role="alert"`.
- Botones solo con ícono con `aria-label`. Íconos decorativos con `aria-hidden="true"`.
- El mapa es un complemento: toda su información también está en texto.