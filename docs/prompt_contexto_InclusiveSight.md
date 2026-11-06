# Prompt de contexto: proyecto InclusiveSight (AccessTech Solutions)

> Copia todo este archivo en un chat nuevo con tu IA. Contiene el contexto del proyecto, las decisiones que ya tomamos, el formato del informe y las Historias de Usuario (HU) que faltan pasar al documento.

---

## 1. Instrucciones para la IA

Vas a ayudarme con el informe del curso **HCI for UX Design (1ASI0784)** de la UPC, ciclo 2026-02, profesor Ernesto Ocampo Tello, NRC 15419. Somos el **Grupo 3**, la startup **AccessTech Solutions**, y nuestro producto es **InclusiveSight**.

Reglas para trabajar conmigo:

1. Responde en español, con redacción formal pero clara, lista para pegar en el informe.
2. Respeta las decisiones de la sección 4. Si algo te parece mal, avísame antes de cambiarlo.
3. Usa exactamente el formato de HU de la sección 6 y continúa la numeración global (HU y CA).
4. No inventes resultados de entrevistas. Aún no las realizamos, así que todo lo de Needfinding (2.2.2 a 2.3.7) debe esperar a tener evidencia real.
5. Cuando cites fuentes, usa APA 7 y avísame si un dato necesita verificación.
6. Si te pido algo que contradice el handbook del curso, avísame.

---

## 2. El proyecto en breve

**Problema:** las personas con discapacidad visual se desorientan en campus universitarios complejos del Perú, porque la señalización y los mapas están pensados para personas que ven. Esto genera pérdida de tiempo, estrés y dependencia de terceros.

**Solución:** InclusiveSight es un sistema de orientación háptico-auditivo con tres partes:
- **App móvil** (Android e iOS), compatible con TalkBack y VoiceOver, que guía al usuario con **instrucciones de voz breves** y **patrones de vibración** (giro a la izquierda, giro a la derecha, llegada, peligro).
- **Puntos de referencia digitales** (balizas BLE o etiquetas NFC) instalados en zonas estratégicas: ingresos, escaleras, pasillos y servicios. La app los detecta **por proximidad**, sin que el usuario tenga que apuntar la cámara.
- **Panel web institucional** para que la oficina de inclusión gestione puntos, mapa, zonas y reportes sin depender de desarrolladores.

**Segmentos objetivo:**
1. Estudiantes universitarios con discapacidad visual parcial o total (18–35 años). Usuario final principal.
2. Personal universitario y visitantes con dificultades significativas de visión (25–65 años). Usuario final ocasional.
3. Oficinas de inclusión, bienestar e infraestructura (30–60 años). Cliente B2B.

**Lean UX:**
- **Supuestos:** los usuarios usan TalkBack o VoiceOver; prefieren sonido discreto más vibración frente a solo audio; se pueden instalar puntos de referencia en zonas estratégicas.
- **H1:** aumentaremos la autonomía de los estudiantes con instrucciones de voz y vibración. Lo sabremos cuando el 80% de los usuarios de prueba llegue de un edificio a otro sin ayuda de transeúntes.
- **H2:** los visitantes ocasionales completan una ruta desconocida sin registro previo.
- **H3:** al menos una universidad formaliza un piloto si los puntos son de bajo costo y fácil instalación.
- **Lo primero a aprender:** si la precisión de los puntos de referencia basta para emitir la vibración en el momento exacto.

**Benchmarking (2.1):** referentes Lazarillo, NaviLens y Google Maps. Aprendizajes clave:
1. Mantener toda la guía dentro de la app, sin derivar a apps externas.
2. Uso inmediato sin registro; la cuenta es opcional.
3. Guía por proximidad, sin escanear el entorno con la cámara.
4. Usar la vibración como instrucción de giro, que casi ningún competidor aprovecha.

**Contexto Perú:** Ley 29973 y Norma A.120 del RNE (accesibilidad). Lazarillo opera en Perú con Entel. Aliados posibles para entrevistas: CONADIS, Unión Nacional de Ciegos del Perú y oficinas de inclusión de universidades de Lima.

**Equipo:** Contreras Chumbirayco Aldair Kenedy, Juarez Zapata Gonzalo Alonso, Quillca Berrocal Alvaro Waldo, Rubio Román Fabrizio Alonso, Toribio Romero Jeanbeth Jeferi, Vegas Campomanes Carlos Antonio.

---

## 3. Requisitos clave del handbook

- **Estructura:** Cap. I Introducción · Cap. II Requirements Elicitation & Analysis · Cap. III Requirements Specification (3.1 To-Be Scenario Mapping, 3.2 User Stories, 3.3 Impact Mapping, 3.4 Product Backlog) · Cap. IV Product UX/UI Design · Cap. V Landing Page, Responsive y Despliegue · Cap. VI Validación del Producto.
- **TB1 (semana 7):** capítulos 1 a 4. **TB2 (semana 15):** capítulos 1 a 4 mejorados, más 5 y 6.
- **Antecedentes:** mínimo **6 fuentes académicas** citadas en APA.
- **Entrevistas:** mínimo 2 por segmento (6 en total), grabadas en video.
- **User Stories:** exactamente **48 HU**, cada una con **mínimo 3 criterios de aceptación y 2 escenarios Gherkin** (Dado–Cuando–Entonces).
- **Product Backlog:** las 48 HU con prioridad (por ejemplo MoSCoW) y estimación (por ejemplo Planning Poker con Story Points).
- **Impact Mapping:** objetivos → actores → impactos → entregables, coherente con las HU.
- **Trazabilidad que se debe poder demostrar:** HU → Arquitectura → User Flow → Wireframe → Mockup → Prototipo.
- **Landing Page:** HTML, CSS y JavaScript, desplegada en GitHub Pages, responsive y accesible. Debe evidenciar **30 HU core**. No cuentan HU accesorias como "configurar preferencias visuales sin impacto en la experiencia principal".
- **Validación:** 10 participantes por segmento (30 en total), pruebas de tareas y encuesta SUS.

---

## 4. Decisiones ya tomadas (no cambiar sin avisar)

1. **11 épicas y 48 HU.** Quitamos la épica de la Landing Page (información y adquisición del servicio).
2. **EP-007 incluye la seguridad** (alertas de escaleras y desniveles, pedir ayuda, contacto de emergencia). Por eso conviene renombrarla en el documento como **"Navegación guiada y seguridad en el recorrido"**.
3. **TalkBack y VoiceOver son épicas separadas** (EP-003 y EP-004). Sus HU se redactan como **acciones que el usuario percibe** (anuncios, orden de foco, gestos), no como requisitos técnicos del tipo "la app debe cumplir WCAG".
4. **Preferencias:** la app solo controla lo propio (intensidad de vibración, nivel de detalle, velocidad de las instrucciones de la app y modo de guía). El volumen general y la voz del lector de pantalla los controla el sistema operativo.
5. **Modo invitado:** la app se usa sin cuenta. El registro es opcional y activa favoritos y preferencias sincronizadas (según CA008 del documento).
6. **Bloqueo por intentos fallidos:** 3 intentos (app y panel). Contraseña mínima de 8 caracteres.
7. **Recuperación de contraseña:** sí se informa si el correo no está registrado (decisión de usabilidad, riesgo de enumeración aceptado). En el inicio de sesión, en cambio, el error es genérico.
8. **Separación entre épicas:** las alertas de peligro durante el recorrido son de EP-007. EP-002 (notificaciones) cubre los avisos del sistema y los que llegan fuera de la navegación activa. Las alertas críticas de seguridad no se pueden desactivar.
9. **Requisitos no funcionales** (tiempos de respuesta, privacidad, versiones de Android e iOS) van como criterios de aceptación o en una tabla aparte, no como HU.

---

## 5. Épicas y HU asociadas

| Epic ID | Nombre | HU asociadas |
|---|---|---|
| EP-001 | Gestión de inicio de sesión | HU-0001 a HU-0005 |
| EP-002 | Gestión de notificaciones | HU-0006 a HU-0009 |
| EP-003 | Compatibilidad con TalkBack | HU-0010 a HU-0011 |
| EP-004 | Compatibilidad con VoiceOver | HU-0012 a HU-0013 |
| EP-005 | Onboarding y preferencias de experiencia | HU-0014 a HU-0020 |
| EP-006 | Búsqueda y selección de destinos | HU-0021 a HU-0025 |
| EP-007 | Navegación guiada y seguridad en el recorrido | HU-0026 a HU-0034 |
| EP-008 | Rutas favoritas e historial | HU-0035 a HU-0037 |
| EP-009 | Gestión de puntos de referencia | HU-0038 a HU-0041 |
| EP-010 | Gestión de mapas y rutas del campus | HU-0042 a HU-0044 |
| EP-011 | Reportes y métricas | HU-0045 a HU-0048 |

**Total: 11 épicas y 48 HU.** HU-0001 a HU-0005 (CA001 a CA022) ya están en el documento.

---

## 6. Formato de cada HU en el informe

Cada HU va en una tabla con estos campos:

- **User Story ID:** HU-00XX · **Epic ID:** EP-0XX
- **Título**
- **Descripción:** "Como [usuario], quiero [acción], para [beneficio]".
- **Criterios de aceptación:** numeración global CA001, CA002… (continúa desde CA023).
- **Escenarios GHERKIN:** "Escenario N: DADO que…, CUANDO…, ENTONCES…", en una sola línea.

---

## 7. HU pendientes de pasar al documento (HU-0006 a HU-0048)

### EP-002: Gestión de notificaciones

**HU-0006** · Epic ID: EP-002
- **Título:** Aviso de zona cerrada o cambio en la ruta
- **Descripción:** Como estudiante con discapacidad visual, quiero recibir un aviso cuando una zona de mi ruta esté cerrada o haya cambiado, para evitar encontrarme con un obstáculo o un recorrido que ya no existe.
- **Criterios de aceptación:**
  - CA023: El sistema debe notificar al usuario cuando una zona de su ruta activa o de un favorito quede cerrada o modificada desde el panel.
  - CA024: La notificación debe indicar qué cambió y cuál es la alternativa, si existe.
  - CA025: La notificación debe anunciarse por voz y vibración, sin requerir mirar la pantalla.
  - CA026: Si hay una ruta activa, el sistema debe ofrecer recalcularla desde la ubicación actual.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el usuario está en una ruta que pasa por una zona recién cerrada, CUANDO el sistema detecta el cierre, ENTONCES anuncia el aviso por voz y vibración y ofrece recalcular la ruta.
  - Escenario 2: DADO que el usuario tiene un favorito que pasa por una zona cerrada, CUANDO el administrador marca la zona como cerrada, ENTONCES el sistema envía una notificación indicando qué favorito se ve afectado.
  - Escenario 3: DADO que la zona cerrada no tiene ruta alternativa, CUANDO el sistema intenta recalcular, ENTONCES informa que no hay alternativa y sugiere elegir otro destino.

**HU-0007** · Epic ID: EP-002
- **Título:** Recordatorio de ruta programada
- **Descripción:** Como estudiante que debe llegar puntualmente a clase, quiero programar un recordatorio para salir hacia mi destino, para contar con el tiempo suficiente de traslado.
- **Criterios de aceptación:**
  - CA027: El usuario debe poder programar un recordatorio indicando destino y hora de llegada deseada.
  - CA028: El sistema debe calcular el tiempo estimado de traslado y avisar con ese margen antes de la hora de llegada.
  - CA029: El recordatorio debe anunciarse por voz y vibración, y permitir iniciar la ruta con una sola acción, además de editarlo o eliminarlo.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el usuario elige un destino y una hora de llegada, CUANDO confirma el recordatorio, ENTONCES el sistema lo guarda y anuncia a qué hora avisará.
  - Escenario 2: DADO que existe un recordatorio programado, CUANDO llega el momento de salir según el tiempo estimado, ENTONCES el sistema notifica y ofrece iniciar la ruta de inmediato.
  - Escenario 3: DADO que existe un recordatorio programado, CUANDO el usuario lo elimina, ENTONCES el sistema lo borra y no emite el aviso.

**HU-0008** · Epic ID: EP-002
- **Título:** Alerta al administrador por punto de referencia inactivo
- **Descripción:** Como coordinador de inclusión, quiero recibir una alerta cuando un punto de referencia deje de funcionar, para repararlo antes de que afecte los recorridos de los usuarios.
- **Criterios de aceptación:**
  - CA030: El sistema debe marcar como inactivo un punto que no reporte señal durante el periodo definido por el equipo.
  - CA031: Debe enviarse una alerta al administrador por correo y en el panel, con el nombre y la ubicación del punto.
  - CA032: Las alertas del panel deben mostrar fecha y hora y poder marcarse como atendidas.
  - CA033: Si el punto vuelve a funcionar, el sistema debe actualizar su estado y notificar la recuperación.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que un punto de referencia no reporta señal en el periodo definido, CUANDO el sistema lo detecta, ENTONCES lo marca como inactivo y envía la alerta al administrador.
  - Escenario 2: DADO que existe una alerta pendiente en el panel, CUANDO el administrador la marca como atendida, ENTONCES el sistema la registra como atendida con fecha y hora.
  - Escenario 3: DADO que un punto estaba inactivo, CUANDO vuelve a reportar señal, ENTONCES el sistema lo marca como activo y notifica la recuperación.

**HU-0009** · Epic ID: EP-002
- **Título:** Preferencias de notificación
- **Descripción:** Como usuario de la app, quiero elegir qué notificaciones recibo y cómo me las anuncian, para estar informado sin que los avisos me distraigan en mi desplazamiento.
- **Criterios de aceptación:**
  - CA034: El usuario debe poder activar o desactivar por separado los avisos de cambios de ruta y los recordatorios.
  - CA035: El usuario debe poder elegir el modo de aviso: voz y vibración, solo vibración o solo notificación en pantalla.
  - CA036: Las alertas críticas de seguridad no deben poder desactivarse.
  - CA037: Los cambios deben aplicarse de inmediato y conservarse al cerrar la app.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el usuario tiene los recordatorios activados, CUANDO los desactiva en preferencias, ENTONCES el sistema deja de emitirlos y lo confirma por voz.
  - Escenario 2: DADO que el usuario eligió "solo vibración", CUANDO llega una notificación, ENTONCES el sistema avisa solo con vibración, sin voz.
  - Escenario 3: DADO que el usuario abre las preferencias, CUANDO intenta desactivar las alertas críticas de seguridad, ENTONCES el sistema indica que no pueden desactivarse.

### EP-003: Compatibilidad con TalkBack

**HU-0010** · Epic ID: EP-003
- **Título:** Lectura de controles y orden de foco con TalkBack
- **Descripción:** Como estudiante con ceguera que usa TalkBack en Android, quiero que cada elemento de la pantalla se anuncie con su nombre, tipo y estado, y que el foco avance en un orden lógico, para operar la app sin apoyo visual.
- **Criterios de aceptación:**
  - CA038: Todos los botones, campos y opciones deben tener una etiqueta descriptiva que TalkBack anuncie junto con su tipo (botón, campo de texto, interruptor).
  - CA039: El foco debe recorrer la pantalla siguiendo el orden de la tarea principal, empezando por el elemento más importante.
  - CA040: Los elementos decorativos deben ser ignorados por TalkBack.
  - CA041: El cambio de estado de un control (activado, desactivado, seleccionado) debe anunciarse al ocurrir.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que TalkBack está activo, CUANDO el usuario abre la pantalla principal, ENTONCES el foco inicia en el campo de búsqueda de destino y TalkBack anuncia su etiqueta y tipo.
  - Escenario 2: DADO que el foco está en un control, CUANDO el usuario desliza un dedo a la derecha, ENTONCES el foco pasa al siguiente control en orden lógico sin detenerse en elementos decorativos.
  - Escenario 3: DADO que el foco está en un interruptor, CUANDO el usuario lo activa con doble toque, ENTONCES TalkBack anuncia el nuevo estado.

**HU-0011** · Epic ID: EP-003
- **Título:** Anuncios de la guía y acciones rápidas con TalkBack
- **Descripción:** Como estudiante con ceguera que usa TalkBack, quiero que las instrucciones y cambios de la ruta se anuncien sin tocar la pantalla y poder repetir o pausar la guía con acciones de TalkBack, para no perder la orientación mientras camino.
- **Criterios de aceptación:**
  - CA042: Las instrucciones y cambios de estado de la ruta deben anunciarse automáticamente, sin mover el foco de TalkBack.
  - CA043: Las instrucciones de la app no deben superponerse con la lectura de TalkBack; deben esperar a que termine.
  - CA044: "Repetir instrucción" y "Pausar ruta" deben estar disponibles como acciones personalizadas del menú de TalkBack.
  - CA045: Los anuncios deben seguir funcionando con la app en segundo plano.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el usuario está en una ruta activa con TalkBack, CUANDO se acerca a un giro, ENTONCES la app anuncia la instrucción sin que el usuario toque la pantalla.
  - Escenario 2: DADO que TalkBack está leyendo un elemento, CUANDO llega una instrucción de la guía, ENTONCES la app espera a que TalkBack termine y luego la anuncia.
  - Escenario 3: DADO que el usuario abre el menú de acciones de TalkBack durante la ruta, CUANDO elige "Repetir instrucción", ENTONCES la app repite la última instrucción.

### EP-004: Compatibilidad con VoiceOver

**HU-0012** · Epic ID: EP-004
- **Título:** Lectura de controles y navegación con el rotor de VoiceOver
- **Descripción:** Como estudiante con ceguera que usa VoiceOver en iOS, quiero que cada elemento se anuncie con su nombre, rasgo y estado, y poder saltar entre secciones con el rotor, para encontrar rápido lo que necesito sin apoyo visual.
- **Criterios de aceptación:**
  - CA046: Todos los controles deben tener etiqueta y rasgo de accesibilidad (botón, encabezado, campo) que VoiceOver anuncie.
  - CA047: Los títulos de cada sección deben marcarse como encabezados para navegar con el rotor.
  - CA048: El orden de lectura debe seguir el orden de la tarea principal de cada pantalla.
  - CA049: Los elementos decorativos deben quedar ocultos para VoiceOver.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que VoiceOver está activo, CUANDO el usuario abre la pantalla principal, ENTONCES VoiceOver anuncia primero el campo de búsqueda de destino con su etiqueta y rasgo.
  - Escenario 2: DADO que el usuario elige "Encabezados" en el rotor, CUANDO desliza hacia abajo, ENTONCES el foco salta a la siguiente sección de la pantalla.
  - Escenario 3: DADO que el foco está en una opción de preferencias, CUANDO el usuario la activa con doble toque, ENTONCES VoiceOver anuncia el nuevo estado.

**HU-0013** · Epic ID: EP-004
- **Título:** Anuncios de la guía y Magic Tap con VoiceOver
- **Descripción:** Como estudiante con ceguera que usa VoiceOver, quiero que las instrucciones de la ruta se anuncien sin tocar la pantalla y poder pausar o reanudar la guía con el Magic Tap, para controlar el recorrido sin buscar botones.
- **Criterios de aceptación:**
  - CA050: Las instrucciones y cambios de estado de la ruta deben anunciarse automáticamente mediante anuncios de VoiceOver.
  - CA051: El gesto Magic Tap (doble toque con dos dedos) debe pausar y reanudar la ruta activa.
  - CA052: Las instrucciones de la app no deben interrumpir la lectura en curso de VoiceOver.
  - CA053: Los anuncios deben seguir funcionando con la app en segundo plano.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el usuario está en una ruta activa con VoiceOver, CUANDO se acerca a un giro, ENTONCES la app anuncia la instrucción sin que el usuario toque la pantalla.
  - Escenario 2: DADO que hay una ruta activa, CUANDO el usuario hace Magic Tap, ENTONCES la ruta se pausa y VoiceOver anuncia "Ruta pausada".
  - Escenario 3: DADO que la ruta está pausada, CUANDO el usuario vuelve a hacer Magic Tap, ENTONCES la ruta se reanuda y se anuncia la siguiente instrucción.

### EP-005: Onboarding y preferencias de experiencia

**HU-0014** · Epic ID: EP-005
- **Título:** Tutorial inicial por voz
- **Descripción:** Como usuario nuevo con discapacidad visual, quiero escuchar un tutorial breve al abrir la app por primera vez, para entender cómo buscar un destino y seguir la guía.
- **Criterios de aceptación:**
  - CA054: El tutorial debe ofrecerse en el primer uso y poder omitirse en cualquier momento.
  - CA055: El tutorial debe durar como máximo 3 minutos y explicar búsqueda, inicio de ruta y patrones de vibración.
  - CA056: Cada paso debe poder repetirse antes de avanzar.
  - CA057: El tutorial debe poder volver a abrirse desde el menú de ayuda.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el usuario abre la app por primera vez, CUANDO termina la carga, ENTONCES la app ofrece iniciar u omitir el tutorial.
  - Escenario 2: DADO que el usuario está en el tutorial, CUANDO elige "Omitir", ENTONCES la app pasa a la pantalla principal y recuerda que el tutorial está en ayuda.
  - Escenario 3: DADO que el usuario ya completó el tutorial, CUANDO lo abre desde ayuda, ENTONCES la app lo reproduce desde el inicio.

**HU-0015** · Epic ID: EP-005
- **Título:** Práctica de patrones de vibración
- **Descripción:** Como usuario nuevo, quiero sentir cada patrón de vibración junto con su significado, para reconocerlos con seguridad durante el recorrido.
- **Criterios de aceptación:**
  - CA058: La app debe reproducir cada patrón (giro izquierda, giro derecha, llegada, peligro) y anunciar su significado.
  - CA059: El usuario debe poder repetir cualquier patrón las veces que necesite.
  - CA060: La práctica debe estar disponible en el tutorial y desde el menú de ayuda.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el usuario abre la práctica de vibración, CUANDO elige "Giro a la izquierda", ENTONCES la app reproduce el patrón y anuncia su significado.
  - Escenario 2: DADO que el usuario acaba de sentir un patrón, CUANDO elige "Repetir", ENTONCES la app vuelve a reproducir el mismo patrón.

**HU-0016** · Epic ID: EP-005
- **Título:** Ayuda contextual por pantalla
- **Descripción:** Como usuario con discapacidad visual, quiero pedir ayuda en cualquier pantalla y escuchar qué puedo hacer en ella, para resolver dudas sin depender de otra persona.
- **Criterios de aceptación:**
  - CA061: Cada pantalla debe incluir una opción "Ayuda" accesible con lector de pantalla.
  - CA062: La ayuda debe explicar en máximo tres frases las acciones disponibles en esa pantalla.
  - CA063: Al cerrar la ayuda, el foco debe volver al elemento donde estaba el usuario.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el usuario está en la pantalla de búsqueda, CUANDO activa "Ayuda", ENTONCES la app anuncia cómo buscar por voz, por texto o por categoría.
  - Escenario 2: DADO que la ayuda está abierta, CUANDO el usuario la cierra, ENTONCES el foco regresa al elemento anterior.

**HU-0017** · Epic ID: EP-005
- **Título:** Ajuste de intensidad de vibración
- **Descripción:** Como usuario con discapacidad visual, quiero elegir la intensidad de la vibración, para percibir las señales con claridad sin que resulten incómodas.
- **Criterios de aceptación:**
  - CA064: El usuario debe poder elegir entre intensidad baja, media o alta.
  - CA065: Al seleccionar una intensidad, la app debe reproducir un patrón de prueba.
  - CA066: La intensidad elegida debe aplicarse a todos los patrones, salvo la alerta de peligro, que siempre usa la intensidad máxima.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el usuario está en preferencias, CUANDO selecciona intensidad alta, ENTONCES la app reproduce un patrón de prueba con esa intensidad y guarda el cambio.
  - Escenario 2: DADO que el usuario eligió intensidad baja, CUANDO recibe una alerta de peligro, ENTONCES la vibración se emite con intensidad máxima.

**HU-0018** · Epic ID: EP-005
- **Título:** Elección del nivel de detalle de las instrucciones
- **Descripción:** Como usuario con discapacidad visual, quiero elegir entre instrucciones breves o detalladas, para recibir solo la información que necesito según conozca o no el lugar.
- **Criterios de aceptación:**
  - CA067: El usuario debe poder elegir entre nivel "breve" y "detallado".
  - CA068: En nivel detallado, las instrucciones deben incluir referencias del entorno (por ejemplo, "puerta a la derecha").
  - CA069: El cambio debe aplicarse desde la siguiente instrucción, incluso con una ruta activa.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el usuario eligió nivel breve, CUANDO recibe una instrucción, ENTONCES la app anuncia solo la acción y la distancia.
  - Escenario 2: DADO que el usuario cambia a nivel detallado durante una ruta, CUANDO llega la siguiente instrucción, ENTONCES la app la anuncia con referencias del entorno.

**HU-0019** · Epic ID: EP-005
- **Título:** Ajuste de velocidad de las instrucciones
- **Descripción:** Como usuario con discapacidad visual, quiero ajustar la velocidad con la que la app dice sus instrucciones, para entenderlas a mi ritmo.
- **Criterios de aceptación:**
  - CA070: El usuario debe poder elegir entre velocidad lenta, normal o rápida para las instrucciones de la app.
  - CA071: Al cambiar la velocidad, la app debe reproducir una frase de prueba.
  - CA072: El ajuste no debe modificar la velocidad del lector de pantalla del sistema.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el usuario está en preferencias, CUANDO elige velocidad rápida, ENTONCES la app reproduce una frase de prueba a esa velocidad y guarda el cambio.
  - Escenario 2: DADO que el usuario cambió la velocidad de la app, CUANDO navega con TalkBack o VoiceOver, ENTONCES el lector mantiene su propia velocidad.

**HU-0020** · Epic ID: EP-005
- **Título:** Elección del modo de guía
- **Descripción:** Como usuario con discapacidad visual, quiero elegir si la guía usa voz y vibración, solo vibración o solo voz, para adaptarla al ruido del entorno y a mis preferencias.
- **Criterios de aceptación:**
  - CA073: El usuario debe poder elegir entre "voz y vibración", "solo vibración" y "solo voz".
  - CA074: El modo predeterminado debe ser "voz y vibración".
  - CA075: Las alertas de peligro deben emitirse siempre con voz y vibración, sin importar el modo elegido.
  - CA076: El modo debe poder cambiarse durante una ruta activa.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el usuario eligió "solo vibración", CUANDO se acerca a un giro, ENTONCES la app emite solo el patrón de vibración correspondiente.
  - Escenario 2: DADO que el usuario eligió "solo voz", CUANDO se acerca a una escalera, ENTONCES la app emite la alerta con voz y vibración.

### EP-006: Búsqueda y selección de destinos

**HU-0021** · Epic ID: EP-006
- **Título:** Búsqueda de destino por voz
- **Descripción:** Como estudiante con ceguera, quiero decir el nombre de mi destino, para encontrarlo sin escribir.
- **Criterios de aceptación:**
  - CA077: La pantalla principal debe ofrecer un botón de búsqueda por voz, accesible con lector de pantalla.
  - CA078: La app debe reconocer nombres de aulas, oficinas, servicios y edificios en español.
  - CA079: Si hay varios resultados, la app debe anunciarlos como lista para elegir.
  - CA080: Si no entiende la frase, la app debe pedir repetirla u ofrecer la búsqueda por texto.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el usuario activa la búsqueda por voz, CUANDO dice "biblioteca", ENTONCES la app anuncia el resultado y ofrece iniciar la ruta.
  - Escenario 2: DADO que el usuario dice "aula 3", CUANDO existen varias aulas con ese número, ENTONCES la app anuncia las opciones con su edificio.
  - Escenario 3: DADO que la app no reconoce lo dicho, CUANDO termina el reconocimiento, ENTONCES pide repetir u ofrece escribir el destino.

**HU-0022** · Epic ID: EP-006
- **Título:** Búsqueda de destino por texto con sugerencias
- **Descripción:** Como usuario con baja visión, quiero escribir mi destino y recibir sugerencias mientras escribo, para encontrarlo rápido aunque no sepa su nombre exacto.
- **Criterios de aceptación:**
  - CA081: La app debe mostrar sugerencias a partir del tercer carácter escrito.
  - CA082: Las sugerencias deben tolerar errores menores de escritura y tildes.
  - CA083: El número de sugerencias debe anunciarse al lector de pantalla.
  - CA084: Si no hay resultados, la app debe informarlo y sugerir buscar por categoría.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el usuario escribe "bibl", CUANDO aparecen las sugerencias, ENTONCES la app anuncia cuántas hay y muestra "Biblioteca central".
  - Escenario 2: DADO que el usuario escribe "secretaria" sin tilde, CUANDO se generan las sugerencias, ENTONCES la app muestra "Secretaría académica".
  - Escenario 3: DADO que el texto no coincide con ningún destino, CUANDO termina la búsqueda, ENTONCES la app informa que no hay resultados y sugiere buscar por categoría.

**HU-0023** · Epic ID: EP-006
- **Título:** Exploración de destinos por categoría
- **Descripción:** Como visitante con discapacidad visual, quiero explorar destinos por categorías, para encontrar un servicio aunque no sepa su nombre.
- **Criterios de aceptación:**
  - CA085: La app debe ofrecer categorías: aulas, oficinas, servicios, servicios higiénicos, alimentación y salidas.
  - CA086: Al elegir una categoría, la app debe listar sus destinos ordenados por cercanía.
  - CA087: Cada destino de la lista debe anunciar nombre, edificio y piso.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el usuario abre la búsqueda por categoría, CUANDO elige "Servicios higiénicos", ENTONCES la app lista los más cercanos con edificio y piso.
  - Escenario 2: DADO que el usuario está en una categoría, CUANDO selecciona un destino, ENTONCES la app muestra su información y la opción de iniciar la ruta.

**HU-0024** · Epic ID: EP-006
- **Título:** Consulta de destinos cercanos
- **Descripción:** Como usuario con discapacidad visual, quiero saber dónde estoy y qué destinos tengo cerca, para orientarme y decidir adónde ir.
- **Criterios de aceptación:**
  - CA088: La app debe anunciar la ubicación actual según el punto de referencia más cercano.
  - CA089: La app debe listar los destinos cercanos con su distancia aproximada.
  - CA090: Si no detecta ningún punto cercano, debe informarlo y sugerir acercarse a un ingreso o pasillo principal.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el usuario está cerca de un punto de referencia, CUANDO elige "¿Dónde estoy?", ENTONCES la app anuncia su ubicación y los destinos cercanos.
  - Escenario 2: DADO que no hay puntos de referencia cerca, CUANDO el usuario consulta su ubicación, ENTONCES la app informa que no puede ubicarlo y sugiere qué hacer.

**HU-0025** · Epic ID: EP-006
- **Título:** Información del destino antes de iniciar la ruta
- **Descripción:** Como usuario con discapacidad visual, quiero conocer la información del destino y del recorrido antes de iniciarlo, para decidir si voy y prepararme.
- **Criterios de aceptación:**
  - CA091: La ficha del destino debe indicar edificio, piso, distancia y tiempo estimado.
  - CA092: La ficha debe indicar si la ruta incluye escaleras, rampas o ascensor.
  - CA093: Si el destino está cerrado o fuera de horario, la ficha debe advertirlo.
  - CA094: Desde la ficha, el usuario debe poder iniciar la ruta o volver a la búsqueda.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el usuario seleccionó un destino, CUANDO se abre su ficha, ENTONCES la app anuncia edificio, piso, distancia, tiempo estimado y tipo de accesos.
  - Escenario 2: DADO que el destino está fuera de horario, CUANDO el usuario abre su ficha, ENTONCES la app advierte el horario antes de ofrecer iniciar la ruta.

### EP-007: Navegación guiada y seguridad en el recorrido

**HU-0026** · Epic ID: EP-007
- **Título:** Inicio de la ruta guiada
- **Descripción:** Como estudiante con ceguera, quiero iniciar la ruta hacia el destino elegido con una sola acción, para empezar a desplazarme de inmediato.
- **Criterios de aceptación:**
  - CA095: La app debe tomar como punto de partida el punto de referencia más cercano.
  - CA096: Si no detecta un punto cercano, debe pedir al usuario que indique dónde está o que se acerque a un ingreso.
  - CA097: Al iniciar, la app debe anunciar la distancia total, el tiempo estimado y la primera instrucción.
  - CA098: El usuario debe poder preferir rutas sin escaleras.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el usuario está cerca de un punto de referencia y eligió un destino, CUANDO selecciona "Iniciar ruta", ENTONCES la app anuncia distancia, tiempo y la primera instrucción.
  - Escenario 2: DADO que no se detecta ningún punto cercano, CUANDO el usuario intenta iniciar la ruta, ENTONCES la app pide indicar el punto de partida.
  - Escenario 3: DADO que el usuario activó "evitar escaleras", CUANDO inicia una ruta, ENTONCES la app calcula un recorrido con rampas o ascensor.

**HU-0027** · Epic ID: EP-007
- **Título:** Instrucciones por voz paso a paso
- **Descripción:** Como estudiante con ceguera, quiero recibir instrucciones de voz breves en cada tramo, para saber en todo momento qué hacer.
- **Criterios de aceptación:**
  - CA099: Cada instrucción debe indicar acción y distancia (por ejemplo, "gira a la derecha en 5 metros").
  - CA100: La app debe anunciar la instrucción con anticipación suficiente antes de cada cambio de dirección.
  - CA101: En tramos largos sin giros, la app debe confirmar periódicamente que el usuario sigue en la ruta.
  - CA102: El usuario debe poder repetir la última instrucción en cualquier momento.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el usuario está en una ruta activa, CUANDO se aproxima a un cambio de dirección, ENTONCES la app anuncia la acción y la distancia.
  - Escenario 2: DADO que el usuario camina por un tramo recto largo, CUANDO pasa el intervalo definido, ENTONCES la app confirma que sigue en la ruta.
  - Escenario 3: DADO que el usuario no escuchó la instrucción, CUANDO elige "Repetir", ENTONCES la app vuelve a anunciarla.

**HU-0028** · Epic ID: EP-007
- **Título:** Patrones de vibración en giros
- **Descripción:** Como estudiante con ceguera, quiero sentir un patrón de vibración distinto para cada giro, para confirmar la dirección aunque haya ruido o no use auriculares.
- **Criterios de aceptación:**
  - CA103: Giro a la izquierda, giro a la derecha y llegada deben tener patrones de vibración distintos entre sí.
  - CA104: La vibración debe emitirse entre 2 y 3 metros antes del giro.
  - CA105: La vibración debe acompañar a la instrucción de voz, salvo que el usuario haya elegido "solo voz".
  - CA106: La vibración debe funcionar con la pantalla apagada y la app en segundo plano.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el usuario está a 3 metros de un giro a la izquierda, CUANDO la app lo detecta, ENTONCES emite el patrón de giro a la izquierda junto con la instrucción de voz.
  - Escenario 2: DADO que el usuario tiene el teléfono en el bolsillo con la pantalla apagada, CUANDO se acerca a un giro, ENTONCES el teléfono vibra con el patrón correspondiente.

**HU-0029** · Epic ID: EP-007
- **Título:** Recálculo de ruta al desviarse
- **Descripción:** Como estudiante con ceguera, quiero que la app detecte si me desvié y me guíe de vuelta, para no perderme si tomo un camino equivocado.
- **Criterios de aceptación:**
  - CA107: La app debe detectar que el usuario se alejó de la ruta prevista a partir de los puntos de referencia.
  - CA108: Al detectar un desvío, la app debe avisarlo con voz y vibración.
  - CA109: La app debe recalcular la ruta desde la ubicación actual y anunciar la nueva instrucción.
  - CA110: Cada desvío debe registrarse de forma anónima para los reportes institucionales.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el usuario pasa por un punto que no pertenece a su ruta, CUANDO la app lo detecta, ENTONCES avisa del desvío y anuncia la nueva instrucción.
  - Escenario 2: DADO que la app recalculó la ruta, CUANDO el usuario retoma el camino, ENTONCES la guía continúa normalmente.

**HU-0030** · Epic ID: EP-007
- **Título:** Confirmación de llegada al destino
- **Descripción:** Como estudiante con ceguera, quiero que la app me confirme que llegué y dónde está la entrada, para estar seguro de que estoy en el lugar correcto.
- **Criterios de aceptación:**
  - CA111: Al llegar, la app debe emitir el patrón de llegada y anunciar el nombre del destino.
  - CA112: La app debe indicar la posición de la entrada respecto al usuario, si está registrada.
  - CA113: Tras la llegada, la app debe ofrecer guardar el destino como favorito o volver a la pantalla principal.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el usuario llega al punto del destino, CUANDO la app lo detecta, ENTONCES emite el patrón de llegada y anuncia "Llegaste a la biblioteca, la entrada está a tu derecha".
  - Escenario 2: DADO que el usuario llegó, CUANDO termina el anuncio, ENTONCES la app ofrece guardar el destino como favorito.

**HU-0031** · Epic ID: EP-007
- **Título:** Pausar, reanudar y cancelar la ruta
- **Descripción:** Como usuario con discapacidad visual, quiero pausar, reanudar o cancelar la ruta, para detenerme o cambiar de plan sin perder el control de la guía.
- **Criterios de aceptación:**
  - CA114: La pantalla de ruta debe ofrecer "Pausar", "Reanudar" y "Cancelar", accesibles con lector de pantalla.
  - CA115: Al pausar, la app debe dejar de emitir instrucciones y anunciar que la ruta está pausada.
  - CA116: Al reanudar, la app debe recalcular desde la ubicación actual y anunciar la siguiente instrucción.
  - CA117: Antes de cancelar, la app debe pedir confirmación.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que hay una ruta activa, CUANDO el usuario elige "Pausar", ENTONCES la app detiene las instrucciones y anuncia "Ruta pausada".
  - Escenario 2: DADO que la ruta está pausada, CUANDO el usuario elige "Reanudar", ENTONCES la app recalcula y anuncia la siguiente instrucción.
  - Escenario 3: DADO que hay una ruta activa, CUANDO el usuario elige "Cancelar" y confirma, ENTONCES la app finaliza la ruta y vuelve a la pantalla principal.

**HU-0032** · Epic ID: EP-007
- **Título:** Alerta de escaleras, desniveles y zonas de riesgo
- **Descripción:** Como estudiante con ceguera, quiero recibir una alerta especial al acercarme a escaleras, desniveles u obras, para evitar caídas y accidentes.
- **Criterios de aceptación:**
  - CA118: La alerta debe usar un sonido y un patrón de vibración propios, distintos de las instrucciones normales.
  - CA119: La alerta debe emitirse antes de llegar a la zona de riesgo e indicar su tipo (escalera de subida, de bajada, desnivel u obra).
  - CA120: La alerta no debe poder desactivarse.
  - CA121: Las zonas de riesgo deben provenir de las registradas en el panel institucional.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el usuario se acerca a una escalera de bajada, CUANDO entra en el área de alerta, ENTONCES la app emite el sonido y la vibración de peligro y anuncia "Escalera de bajada al frente".
  - Escenario 2: DADO que el administrador registró una obra en un pasillo, CUANDO el usuario se acerca, ENTONCES la app emite la alerta de peligro y sugiere una alternativa.

**HU-0033** · Epic ID: EP-007
- **Título:** Solicitud de ayuda durante el recorrido
- **Descripción:** Como estudiante con ceguera, quiero pedir ayuda desde la app si me pierdo o tengo un problema, para recibir asistencia sin tener que explicar dónde estoy.
- **Criterios de aceptación:**
  - CA122: La pantalla de ruta debe tener un botón "Pedir ayuda" fácil de encontrar con lector de pantalla.
  - CA123: La solicitud debe enviar al servicio de apoyo del campus la ubicación aproximada según el último punto de referencia.
  - CA124: La app debe confirmar el envío por voz y avisar cuando la solicitud sea atendida.
  - CA125: El usuario debe poder cancelar la solicitud.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el usuario está en una ruta, CUANDO activa "Pedir ayuda" y confirma, ENTONCES la app envía su ubicación al servicio de apoyo y confirma el envío por voz.
  - Escenario 2: DADO que el usuario envió una solicitud, CUANDO el servicio de apoyo la atiende, ENTONCES la app avisa que la ayuda está en camino.
  - Escenario 3: DADO que el usuario envió una solicitud, CUANDO la cancela, ENTONCES la app informa que la solicitud fue cancelada.

**HU-0034** · Epic ID: EP-007
- **Título:** Contacto de emergencia
- **Descripción:** Como estudiante con ceguera, quiero registrar un contacto de emergencia y avisarle con una acción rápida, para tener respaldo si ocurre algo grave.
- **Criterios de aceptación:**
  - CA126: El usuario debe poder registrar un contacto con nombre y número de teléfono.
  - CA127: Durante la ruta debe existir la opción "Avisar a mi contacto", que envía un mensaje con la ubicación aproximada.
  - CA128: La app debe pedir confirmación antes de enviar el aviso.
  - CA129: Si no hay contacto registrado, la app debe ofrecer registrarlo o llamar al servicio de apoyo del campus.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el usuario tiene un contacto registrado, CUANDO elige "Avisar a mi contacto" y confirma, ENTONCES la app envía el mensaje con su ubicación y lo confirma por voz.
  - Escenario 2: DADO que el usuario no tiene contacto registrado, CUANDO elige "Avisar a mi contacto", ENTONCES la app ofrece registrarlo o llamar al servicio de apoyo.

### EP-008: Rutas favoritas e historial

**HU-0035** · Epic ID: EP-008
- **Título:** Guardar destinos favoritos
- **Descripción:** Como estudiante que recorre el campus a diario, quiero guardar mis destinos frecuentes como favoritos, para iniciar la ruta más rápido.
- **Criterios de aceptación:**
  - CA130: El usuario con cuenta debe poder guardar un destino como favorito desde su ficha o al llegar.
  - CA131: Los favoritos deben aparecer en la pantalla principal y anunciarse en orden.
  - CA132: Si el usuario está en modo invitado, la app debe explicar que los favoritos requieren una cuenta y ofrecer registrarse.
  - CA133: Desde un favorito, la ruta debe poder iniciarse con una sola acción.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el usuario tiene sesión iniciada, CUANDO guarda un destino como favorito, ENTONCES la app lo confirma por voz y lo muestra en la pantalla principal.
  - Escenario 2: DADO que el usuario está en modo invitado, CUANDO intenta guardar un favorito, ENTONCES la app explica que necesita una cuenta y ofrece registrarse.

**HU-0036** · Epic ID: EP-008
- **Título:** Renombrar y eliminar favoritos
- **Descripción:** Como estudiante con favoritos guardados, quiero renombrarlos o eliminarlos, para identificarlos fácilmente y mantener mi lista ordenada.
- **Criterios de aceptación:**
  - CA134: El usuario debe poder renombrar un favorito escribiendo o dictando el nuevo nombre.
  - CA135: Antes de eliminar un favorito, la app debe pedir confirmación.
  - CA136: Los cambios deben sincronizarse con la cuenta.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el usuario tiene un favorito "Aula A-301", CUANDO lo renombra por voz como "Clase de cálculo", ENTONCES la app guarda el nuevo nombre y lo confirma.
  - Escenario 2: DADO que el usuario elige eliminar un favorito, CUANDO confirma la acción, ENTONCES la app lo borra y anuncia que fue eliminado.

**HU-0037** · Epic ID: EP-008
- **Título:** Historial de rutas recientes
- **Descripción:** Como estudiante con discapacidad visual, quiero consultar mis rutas recientes y repetir una, para volver a lugares que visité sin buscarlos de nuevo.
- **Criterios de aceptación:**
  - CA137: La app debe mostrar las últimas 10 rutas, de la más reciente a la más antigua.
  - CA138: Cada elemento debe anunciar destino y fecha, y permitir iniciar la ruta de nuevo.
  - CA139: El usuario debe poder borrar el historial completo.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el usuario abre el historial, CUANDO selecciona una ruta reciente, ENTONCES la app ofrece iniciarla desde su ubicación actual.
  - Escenario 2: DADO que el usuario elige "Borrar historial", CUANDO confirma, ENTONCES la app elimina todas las rutas recientes y lo confirma por voz.

### EP-009: Gestión de puntos de referencia (panel web)

**HU-0038** · Epic ID: EP-009
- **Título:** Registro de punto de referencia
- **Descripción:** Como coordinador de inclusión, quiero registrar un nuevo punto de referencia desde el panel web, para incorporarlo al sistema sin depender de desarrolladores.
- **Criterios de aceptación:**
  - CA140: El formulario debe pedir nombre, edificio, piso, tipo de punto, identificador del dispositivo y ubicación en el plano.
  - CA141: Los campos obligatorios deben validarse antes de guardar, con mensajes de error junto a cada campo.
  - CA142: El sistema no debe permitir dos puntos con el mismo identificador de dispositivo.
  - CA143: El formulario debe poder completarse con teclado y tener etiquetas visibles.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el coordinador completa todos los campos obligatorios, CUANDO selecciona "Guardar", ENTONCES el sistema registra el punto y muestra un mensaje de confirmación.
  - Escenario 2: DADO que falta un campo obligatorio, CUANDO selecciona "Guardar", ENTONCES el sistema no registra el punto e indica el campo faltante.
  - Escenario 3: DADO que el identificador ya existe, CUANDO selecciona "Guardar", ENTONCES el sistema informa que el dispositivo ya está registrado.

**HU-0039** · Epic ID: EP-009
- **Título:** Edición, activación y desactivación de puntos
- **Descripción:** Como coordinador de inclusión, quiero editar o desactivar un punto de referencia, para mantener actualizada la información cuando cambie el campus.
- **Criterios de aceptación:**
  - CA144: El coordinador debe poder modificar los datos de un punto registrado.
  - CA145: El coordinador debe poder desactivar un punto sin eliminarlo, para que la app deje de usarlo.
  - CA146: Antes de desactivar un punto que forma parte de rutas, el sistema debe advertir cuántas rutas se verán afectadas.
  - CA147: Cada cambio debe quedar registrado con usuario, fecha y hora.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el coordinador edita el nombre de un punto, CUANDO guarda los cambios, ENTONCES el sistema actualiza el punto y registra el cambio.
  - Escenario 2: DADO que un punto forma parte de rutas activas, CUANDO el coordinador intenta desactivarlo, ENTONCES el sistema muestra cuántas rutas se verán afectadas y pide confirmación.

**HU-0040** · Epic ID: EP-009
- **Título:** Monitoreo del estado de los puntos
- **Descripción:** Como coordinador de inclusión, quiero ver el estado de todos los puntos de referencia, para detectar a tiempo los que fallan o tienen batería baja.
- **Criterios de aceptación:**
  - CA148: El panel debe listar los puntos con su estado (activo, inactivo o batería baja) y la fecha de su última señal.
  - CA149: La lista debe poder filtrarse por edificio, piso y estado.
  - CA150: El estado no debe depender solo del color; debe incluir texto o ícono con etiqueta.
  - CA151: El panel debe mostrar un resumen con el total de puntos por estado.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el coordinador abre el listado de puntos, CUANDO filtra por estado "inactivo", ENTONCES el panel muestra solo los puntos inactivos con su última señal.
  - Escenario 2: DADO que un punto tiene batería baja, CUANDO el coordinador abre el listado, ENTONCES el punto aparece marcado como "batería baja" con texto e ícono.

**HU-0041** · Epic ID: EP-009
- **Título:** Configuración del mensaje de cada punto
- **Descripción:** Como coordinador de inclusión, quiero definir el mensaje que la app anuncia al pasar por cada punto, para dar referencias útiles del entorno.
- **Criterios de aceptación:**
  - CA152: Cada punto debe permitir un mensaje de hasta 120 caracteres.
  - CA153: El panel debe permitir escuchar una vista previa del mensaje.
  - CA154: Los cambios deben reflejarse en la app sin necesidad de actualizarla.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el coordinador escribe "Entrada del pabellón A, escaleras a la derecha", CUANDO guarda el mensaje, ENTONCES el sistema lo asocia al punto y la app lo anuncia al pasar por él.
  - Escenario 2: DADO que el coordinador escribe un mensaje, CUANDO selecciona "Escuchar vista previa", ENTONCES el panel reproduce el mensaje con voz sintética.

### EP-010: Gestión de mapas y rutas del campus (panel web)

**HU-0042** · Epic ID: EP-010
- **Título:** Registro de edificios, pisos y destinos
- **Descripción:** Como coordinador de inclusión, quiero registrar edificios, pisos y destinos del campus, para que la app pueda guiar hacia ellos.
- **Criterios de aceptación:**
  - CA155: El coordinador debe poder registrar edificios con sus pisos.
  - CA156: Cada destino debe registrarse con nombre, categoría, edificio, piso, horario y punto de referencia asociado.
  - CA157: El sistema no debe permitir guardar un destino sin punto de referencia asociado.
  - CA158: Los destinos registrados deben aparecer en la búsqueda de la app.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el coordinador completa los datos de un destino, CUANDO lo guarda, ENTONCES el sistema lo registra y queda disponible en la búsqueda de la app.
  - Escenario 2: DADO que el coordinador no asoció un punto de referencia, CUANDO intenta guardar el destino, ENTONCES el sistema lo impide e indica el dato faltante.

**HU-0043** · Epic ID: EP-010
- **Título:** Registro de zonas de riesgo
- **Descripción:** Como coordinador de inclusión, quiero marcar escaleras, desniveles y obras en el mapa del campus, para que la app alerte a los usuarios antes de llegar a ellas.
- **Criterios de aceptación:**
  - CA159: El coordinador debe poder registrar una zona de riesgo indicando tipo, ubicación y descripción.
  - CA160: Las zonas temporales, como obras, deben tener fecha de inicio y de fin.
  - CA161: Al vencer la fecha de fin, la zona debe desactivarse automáticamente.
  - CA162: Las zonas registradas deben usarse en las alertas de peligro de la app.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el coordinador registra una escalera de bajada, CUANDO guarda la zona, ENTONCES la app comienza a emitir la alerta de peligro al acercarse a ella.
  - Escenario 2: DADO que una obra tiene fecha de fin, CUANDO esa fecha vence, ENTONCES el sistema desactiva la zona y deja de alertar.

**HU-0044** · Epic ID: EP-010
- **Título:** Cierre temporal de zonas o rutas
- **Descripción:** Como coordinador de inclusión, quiero cerrar temporalmente un pasillo o acceso, para que la app guíe por caminos disponibles.
- **Criterios de aceptación:**
  - CA163: El coordinador debe poder cerrar una zona indicando motivo y periodo de vigencia.
  - CA164: Las rutas que pasen por una zona cerrada deben recalcularse con una alternativa.
  - CA165: Al cerrar una zona, el sistema debe notificar a los usuarios afectados.
  - CA166: El coordinador debe poder reabrir la zona antes de que termine el periodo.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el coordinador cierra un pasillo por mantenimiento, CUANDO confirma el cierre, ENTONCES el sistema excluye el pasillo de las rutas y notifica a los usuarios afectados.
  - Escenario 2: DADO que una zona está cerrada, CUANDO el coordinador la reabre, ENTONCES el sistema vuelve a incluirla en las rutas.

### EP-011: Reportes y métricas (panel web)

**HU-0045** · Epic ID: EP-011
- **Título:** Dashboard de uso del sistema
- **Descripción:** Como jefe de bienestar universitario, quiero ver un resumen del uso de InclusiveSight, para evaluar si el sistema está ayudando a los usuarios.
- **Criterios de aceptación:**
  - CA167: El dashboard debe mostrar usuarios activos, rutas iniciadas, rutas completadas y porcentaje de llegadas sin solicitud de ayuda.
  - CA168: Los datos deben poder filtrarse por rango de fechas.
  - CA169: Los datos deben ser agregados y anónimos, sin identificar a ningún usuario.
  - CA170: Los gráficos deben incluir una tabla alternativa con los mismos datos.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el jefe de bienestar abre el dashboard, CUANDO selecciona el último mes, ENTONCES el panel muestra los indicadores de ese periodo.
  - Escenario 2: DADO que el usuario navega con lector de pantalla, CUANDO llega a un gráfico, ENTONCES puede consultar la tabla con los mismos datos.

**HU-0046** · Epic ID: EP-011
- **Título:** Rutas y destinos más usados
- **Descripción:** Como coordinador de inclusión, quiero conocer las rutas y destinos más usados, para priorizar el mantenimiento de esos recorridos.
- **Criterios de aceptación:**
  - CA171: El panel debe mostrar un ranking de los 10 destinos y rutas más usados.
  - CA172: El ranking debe poder filtrarse por rango de fechas y edificio.
  - CA173: Cada elemento debe mostrar la cantidad de recorridos y la tasa de llegada.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el coordinador abre el reporte de uso, CUANDO selecciona un rango de fechas, ENTONCES el panel muestra los 10 destinos más usados en ese periodo.
  - Escenario 2: DADO que el coordinador filtra por un edificio, CUANDO se actualiza el reporte, ENTONCES solo aparecen rutas y destinos de ese edificio.

**HU-0047** · Epic ID: EP-011
- **Título:** Zonas problemáticas y sin cobertura
- **Descripción:** Como coordinador de inclusión, quiero identificar dónde ocurren más desvíos, solicitudes de ayuda o pérdidas de señal, para decidir dónde instalar o reubicar puntos.
- **Criterios de aceptación:**
  - CA174: El panel debe mostrar las zonas con más desvíos y solicitudes de ayuda.
  - CA175: El panel debe mostrar las zonas donde la app no detectó puntos de referencia.
  - CA176: Cada zona debe indicar edificio, piso y cantidad de eventos.
  - CA177: El reporte debe sugerir zonas candidatas para nuevos puntos.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el coordinador abre el reporte de zonas problemáticas, CUANDO selecciona un periodo, ENTONCES el panel muestra las zonas con más desvíos y solicitudes de ayuda.
  - Escenario 2: DADO que existen zonas sin cobertura, CUANDO el coordinador revisa el reporte, ENTONCES el panel las marca como candidatas para nuevos puntos.

**HU-0048** · Epic ID: EP-011
- **Título:** Exportación de reportes
- **Descripción:** Como jefe de bienestar universitario, quiero exportar los reportes en PDF o CSV, para presentarlos en auditorías de accesibilidad y justificar la inversión.
- **Criterios de aceptación:**
  - CA178: El usuario debe poder exportar cualquier reporte en PDF o CSV.
  - CA179: La exportación debe respetar los filtros aplicados.
  - CA180: El archivo debe incluir el periodo, la fecha de generación y el nombre de la institución.
  - CA181: Si no hay datos en el periodo, el sistema debe informarlo y no generar un archivo vacío.
- **Escenarios GHERKIN:**
  - Escenario 1: DADO que el usuario aplicó un rango de fechas, CUANDO selecciona "Exportar PDF", ENTONCES el sistema descarga el reporte con ese periodo y la fecha de generación.
  - Escenario 2: DADO que no hay datos en el periodo elegido, CUANDO el usuario intenta exportar, ENTONCES el sistema informa que no hay datos para exportar.

---

## 8. Pendientes detectados en el documento actual

Antes de seguir, corrige esto en el avance:

1. **HU-0003:** el CA010 dice que el error de inicio de sesión no debe indicar qué dato falló, pero el Escenario 2 dice "anuncia un mensaje especificando el error". Deben coincidir; lo acordado es el error genérico.
2. **EP-007:** cambiar el nombre a "Navegación guiada y seguridad en el recorrido" y actualizar su descripción para incluir alertas de riesgo y pedido de ayuda.
3. **EP-010:** la descripción dice "para que la app guppy"; debe decir "para que la app guíe".
4. **Tabla de épicas:** la columna "User Stories asociadas al Epic" está vacía; llenarla con los rangos de la sección 5.
5. **2.1.1, NaviLens:** dice "se leen entre 1-30 s"; lo correcto es "en menos de 0,03 s" (1/30 de segundo).
6. **Referencias:** solo hay 2 referencias en la lista, pero en el texto se citan WHO (2019), Real y Araujo (2019), Hepzibah et al. (2021), Bamdad et al. (2023), Prandi et al. (2021) y MDPI (2023), además de las fuentes del benchmarking. Hay que agregarlas en APA y verificar que haya mínimo 6 fuentes académicas.
7. **Landing Page:** al quitar la épica de landing, las 30 HU core deberán implementarse en la landing como **demostraciones interactivas** en HTML, CSS y JavaScript (por ejemplo: búsqueda de destinos, ficha del destino, simulación de la guía con instrucciones, patrones de vibración con la Vibration API del navegador, formularios del panel con validación, dashboard con datos de ejemplo). Conviene definir cuáles serán las 30 HU core antes de diseñar en Figma.
8. **Valores a confirmar por el equipo:** periodo sin señal para marcar un punto inactivo (HU-0008), intervalo de confirmación en tramos rectos (HU-0027) y vigencia del enlace de recuperación (HU-0005).

---

## 9. Próximos pasos del informe

- 3.1 To-Be Scenario Mapping (depende de 2.3.6 As-Is, que requiere entrevistas).
- 3.3 Impact Mapping con objetivos ligados a H1, H2 y H3.
- 3.4 Product Backlog: las 48 HU con prioridad MoSCoW y Story Points.
- Capítulo IV: guía de estilos, arquitectura web y móvil, user flows, wireframes, wireflows, mockups y prototipo en Figma.
