# Project
13·09 — Para Diana

# Purpose
Regalo web interactivo de cumpleaños creado por su novio (Cesar) para Diana.
Lo abrirá ella, en su móvil, desde un enlace.

# Personal facts
- Nombre: Diana
- Cumpleaños: 13 de septiembre
- Aniversario: 20 de diciembre
- El vídeo del acto (01108, `graduacion-acto`) es la graduación **de Cesar**, no
  la de Diana. Lo confirmó él; del archivo no se deduce. Va en el capítulo de la
  luz buena y el pie cede el día: «El acto era mío. Las treinta y ocho fotos,
  tuyas.» No moverlo de ahí.
- Perro: Taysson — el **canela de pelo áspero con arnés rojo**.
  El perro blanco y negro de los paseos por el bosque **NO** es Taysson: no se nombra.
- **La escena de la nevera está retirada.** Cesar la quitó expresamente
  (01185 y 01280, y el pie `CAPITULOS.taysson.pies.nevera`). Los originales
  siguen en `Fotos_y_Videos/`; los ids están en `EXCLUDE_REASON.nevera`.
  No reincorporar.
- **En 01006, 01007, 01009 y 01067 aparece un chico que no es el mismo** que sale
  en la graduación (barba y pelo rizado = Cesar, confirmado por el vídeo del
  acto). No se puede saber quién es, así que están en
  `EXCLUDE_REASON.sinIdentificar`. Regla dura: no se supone quién sale en una foto.

# Non-negotiables
- Mobile first
- No estética genérica de IA
- No inventar recuerdos ni datos personales
- No borrar originales
- No subir fotos a APIs externas
- Mantener excelente rendimiento
- Preservar privacidad
- Material real en ./Fotos_y_Videos/
- Cumpleaños > aniversario en jerarquía narrativa
- La experiencia debe sentirse creada específicamente para Diana

# Key commands
- npm run dev
- npm run build
- npm run media:analyze        (informes en Fotos_y_Videos/_ANALISIS, sólo lee)
- npm run media:prepare        (SOLO=video para rehacer sólo los clips)
- npm run qa                   (QA_SIZE=390x844 para un solo tamaño)
- npm run qa:uso               (QA de interacción: 31 comprobaciones)
- npm run og                   (rehace la miniatura de WhatsApp)
- node scripts/fetch-fonts.mjs (sólo si hay que recuperar las tipografías)

# Important architecture

**El archivo no tiene metadatos.** El EXIF viene borrado (export de WhatsApp):
**0 de 399** fotos lo conservan. Sin fechas, sin cámara, sin GPS. No hay
cronología real y no se puede inventar. El único orden disponible es el número
de secuencia del nombre de fichero.

**Está exportado dos veces.** Medido con dHash idéntico (`npm run media:analyze`):
430 ficheros = 399 fotos + 31 vídeos, pero **≈367 fotos y ≈16 clips distintos**.
Los pares cruzan 007xx/008xx contra 010xx/012xx. La curación se queda siempre con
la copia grande — verificado: ningún fotograma usa la pequeña habiendo una mayor.

**Toda cifra que aparece en los textos es real y está contada del archivo**
(25 del ramo, 36 del coche de noche, 51 del camino, 38 del césped, 399 en total).
Las cifras cuentan **ficheros**, no momentos distintos (ver arriba): 399 y 31 son
ciertos como recuento del archivo, y así se dejan a propósito. Si alguna vez se
cambian a momentos (≈367 y ≈16), hay que tocar `FINAL.cierre` y la pregunta
«total» de `JUEGOS.cuantas` **a la vez**.
Si se recuratan las ráfagas, hay que recontar antes de tocar el copy.
Recuento reproducible: `npm run media:analyze`, o comparar rangos de id en
`scripts/curation.mjs`.

**La ráfaga** es el concepto y el detalle firma (ver DESIGN.md). Los fotogramas se
pintan en `<canvas>`, no cambiando el `src` de un `<img>`: en Safari iOS eso parpadea.
El fotograma elegido se sirve grande (hasta 1500px) y el resto a 420px, porque
sólo pasan volando a 11 fps.

**Curación a mano** en `scripts/curation.mjs`. Los hashes perceptuales agrupaban
fotos visiblemente distintas: sirven para orientar, no para decidir. La selección
se hizo mirando hojas de contactos.

**Segunda curación (ampliación).** `MOMENTOS` tiene ahora dos mitades: las 12
ráfagas y **27 fotos sueltas** (`kind: 'still'`, un solo fotograma). En total
**39 fotografías distintas a tamaño real**, frente a las 13 de la primera
versión. Las sueltas no laten, no se recorren y no ensucian el mosaico de
post-créditos (que sigue recogiendo sólo descartes de ráfaga). Interruptores por
momento: `grande` (hasta 1920), `menuda` (hasta 840), `memoria` (una de las seis
caras del juego), `cierre` (rotación de caras del final). Con 39 momentos, rotar
todos en el final ni se vería ni saldría gratis: por eso `cierre` es explícito.

**Material excluido a propósito**: fotos íntimas/privadas, un reel de Instagram
ajeno (00998), la escena de la nevera y las fotos con la persona sin identificar.
Listado en `EXCLUDE_REASON`. No reincorporar. `media:prepare` **se para** si un id
excluido aparece en la curación: la exclusión no es sólo documental.

**00998 ya no está en `Fotos_y_Videos/`.** Era el reel de Instagram ajeno y
estaba excluido desde el principio; nada de la web lo usaba. El archivo pasó de
430 a **429 ficheros** (399 fotos + **30** vídeos). Se deja su id en
`EXCLUDE_REASON.ajeno` a propósito: es una lista negra, no una lista de
referencias, y mantenerlo impide que vuelva a entrar. `media:analyze` marca
tachados los ids excluidos que ya no están en la carpeta.

**Vídeo**: los `.mov` se transcodifican a H.264 porque Chrome/Android no los
reproduce de forma fiable. `crf` por clip (por defecto 27) para el que se
desmadre: el del acto son 18 s de plano general y a 27 pesaba 3,8 MB, un tercio
de toda la descarga. `recorte` en la curación aplica un crop de ffmpeg —
necesario cuando el sujeto ocupa una franja del cuadro (01279: mesa al 60 %).
`object-position` **no** sirve para eso: los marcos conservan la proporción del
vídeo, así que `object-fit: cover` nunca recorta.

**Apaisado**: una foto 9:16 a todo el ancho en escritorio se convierte en un muro
de 2.500 px sin cara dentro. Los marcos se limitan por altura (78vh; la galería
68vh y las secuencias 46vh) y el ancho lo fija la proporción. La portada y el
final, que sí van a sangre, usan `object-position` alto para no decapitar a Diana.

**Nada se recorta salvo tres sitios.** Cada marco toma la proporción de su propia
foto (`--ratio`), así que `object-fit: cover` no llega a recortar. Las únicas
excepciones son la portada (`aspect-ratio: auto`), las caras del final y las
teselas cuadradas del mosaico — las tres, deliberadas y con encuadre corregido.

**Poda**: `media:prepare` borra al final lo que `media.json` no referencia.
Cambiar la escala de tamaños (`KEEP_W` pasó de `[720,1080,1500]` a
`[560,840,1080]`) dejaba 4 MB de derivados viejos que Vite copiaba a `dist`
porque `public/` se copia entera. Es seguro también con `SOLO=video`.

**Carga**: nada pesado al arrancar. Las ráfagas, los clips, las tiras del juego y
el mosaico de post-créditos se construyen con IntersectionObserver cuando su
capítulo se acerca. El mosaico son ~125 imágenes: crearlas al inicio retrasaba
el `load` de toda la página. Las fotos sueltas son `<img loading="lazy">` con
`srcset`/`sizes`: existen en el DOM desde el principio pero no se descargan hasta
que se acercan, y su `Burst` **no precarga fotogramas** (`frames.length > 1`),
porque el único que tendrían es el de 420px que la `<img>` no usa.

**QA** (`scripts/qa-shots.mjs`): un tamaño por proceso. Tres trampas ya resueltas —
`server.close()` se cuelga esperando las conexiones keep-alive de Chromium (por eso
el informe se escribe antes de desmontar), `page.screenshot` necesita
`animations: 'disabled'` o el cursor parpadeante del final impide la estabilidad,
y **con `ACCESO.activo` en `true` la puerta tapa la pantalla y se come todos los
clics**: los dos scripts de QA siembran `sessionStorage['diana-1309-dentro']='1'`
con `addInitScript`, que es la misma marca que deja la puerta al abrirse.
Los huecos vacíos o borrosos en las capturas son artefacto de tiempo de carga, no
un fallo — y la captura *de elemento* de un capítulo largo los provoca siempre:
para revisar fotos hay que capturar por viewport, no por elemento.

**Capas y apagables.** `ACCESO`, `MUSICA`, `RAZONES` y `QUIZ` viven en
`content.js`; lo vacío **no se dibuja**, ni el hueco. **Los cuatro están ahora
encendidos**: puerta `activo: true`, canción en `public/audio/`, doce razones y
cuatro preguntas. `.carta` es el capítulo de la carta — los naipes del memory se
llaman `.naipe` a propósito: llamarlos `.carta` le comía el papel y el margen a
la carta de Diana.

**La música cuelga de la puerta.** `montarMusica()` devuelve `{ audio, boton,
preguntar }` y `preguntar` es lo que dibuja «¿Con música?». Se llama desde el
`alEntrar` de `montarAcceso` y no desde dentro del módulo, porque sin un gesto
previo ningún navegador deja sonar nada: el propio sí/no es lo que permite que
arranque. La caja es `position: fixed` y se quita sola al dejar atrás la portada
—si no, la arrastraba por toda la web, encima de la carta— y no se dibuja si
recarga a mitad de página. `.musica` lleva `display: flex`, así que necesita
estar en la regla `[hidden] { display: none !important }` de `capas.css`.

**Ducking.** Los clips con `sound: true` emiten `clip-sonido` en `document` al
encender/apagar, al pausarse y al salir de pantalla; `musica.js` escucha y baja
la canción de 0.55 a 0.10 con rampa, y la devuelve al acabar. Van por evento y no
por import para que un clip no tenga que saber que existe una canción. Si ella
pausa la música a mano, el ducking cambia el volumen pero **no la reanuda**.

**La lupa va sólo en el mosaico de post-créditos.** No se monta sobre las
ráfagas: ahí el dedo ya sirve para recorrer fotogramas, y robarle el toque rompe
el gesto que sostiene la web. Las teselas no son focables (250 paradas de
tabulador no son accesibilidad); hay un botón que abre la lupa y dentro se pasa
con las flechas.

**Cuidado con `hidden`.** Cualquier regla `display:` gana al atributo `hidden`
del navegador. En las capas hay un `[hidden] { display: none !important }`
porque sin él la pregunta de la puerta se veía a la vez que la intro.

# Pendiente
- `CARTA.parrafos` en `src/data/content.js` es un marcador de posición.
  Lo escribe Cesar. Poner `esBorrador: false` para quitar el aviso amarillo.
