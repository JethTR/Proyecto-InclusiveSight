# Documentos del proyecto

| Archivo | Qué es |
|---|---|
| [`prompt_contexto_InclusiveSight.md`](prompt_contexto_InclusiveSight.md) | Contexto del proyecto: decisiones, épicas e historias de usuario |
| [`prompt_claude_code_inclusivesight_v2.md`](prompt_claude_code_inclusivesight_v2.md) | Instrucciones para construir la aplicación (arquitectura por funciones) |

## Enlaces

- Mockups y prototipo en Figma: https://www.figma.com/design/mAMd9yocUOIolmdB7gkmNK

## Decisiones tomadas durante la fase 1

- Bloqueo de inicio de sesión: en cada intento fallido se informa cuántos quedan; al tercero se bloquea y se ofrece recuperar la contraseña.
- Búsqueda sin coincidencias: "Sin resultados" y sugerencia de buscar por categoría (HU-0022).
- Cerca de mí sin ubicación: se informa el problema y se sugiere acercarse a un ingreso o pasillo principal (HU-0024).
- "Ayuda" en el inicio (M1) abre una página propia, `estudiante/ayuda.html`, y no la aplicación.
