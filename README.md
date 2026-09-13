# 13·09 — Para Diana

Un regalo de cumpleaños. Se abre en el móvil.

---

## Lo único que falta por hacer

**Poner la dirección real en `.env`.** Ahora mismo pone un marcador:

```
VITE_SITE_URL=https://cambia-esto-por-tu-enlace.netlify.app
```

Sólo afecta a la miniatura del enlace en WhatsApp. Sube la web, copia el enlace
que te den, pégalo ahí, `npm run build` otra vez y vuelve a subir. Ver
**Publicarla**, más abajo.

Nada más es obligatorio: la carta está escrita, la puerta encendida, la música
puesta y las razones rellenas.

---

## Lo que puedes encender, apagar o rellenar

Todo vive en **`src/data/content.js`**. Nada de esto hay que programarlo.

| Qué | Dónde | Ahora está |
|---|---|---|
| La puerta de entrada («Esto no es para cualquiera») | `ACCESO.activo` | **encendida** — ponlo en `false` y se entra directo |
| Las preguntas de la puerta | `ACCESO.preguntas` | Taysson y el 20 de diciembre |
| Música | `MUSICA.archivo` | **puesta** — `audio/te-quiero-tanto.mp3` |
| «Unas cuantas razones» | `RAZONES.lista` | **12 frases** |
| La carta | `CARTA.parrafos` | **escrita**, 8 párrafos |
| Los títulos y pies de cada capítulo | `CAPITULOS` | varios **vacíos a propósito** |

Si vacías cualquiera de esos arrays, su sección **no deja hueco ni título**: no
se enseñan secciones a medio hacer. Lo mismo con los textos sueltos: un título,
un párrafo o un pie puesto a `''` no se dibuja, y tampoco su margen. Por eso la
las dos graduaciones y el camino no llevan ni una palabra — están vacíos a
propósito, no a medias. Escribe algo dentro y vuelven a aparecer solos. Y `CARTA.esBorrador: true` vuelve a poner
el aviso amarillo encima de la carta, por si la quieres seguir tocando.

La canción no suena nunca sola. Al entrar se pregunta una vez («Una cosa antes
de empezar»); si no contestas, la pregunta se quita en cuanto bajas y queda el
control discreto de la esquina. Mientras el clip de Taysson suena, la música se
aparta sola y vuelve al acabar.

Las respuestas de la puerta admiten variantes: da igual mayúsculas, tildes,
espacios o si escribe `20/12`, `20-12` o `20 de diciembre`. Y al tercer intento
se abre igual — nadie se va a quedar fuera de su propio regalo. No es seguridad
de verdad: quien mire el código ve las respuestas.

---

## Verla mientras la editas

```
npm install        (sólo la primera vez)
npm run dev
```

Se abre en `http://localhost:5173`. Los cambios en los textos se ven al momento.

---

## Publicarla

**Antes de nada**, abre el fichero **`.env`** y pon ahí la dirección donde la vas
a subir. Es una línea:

```
VITE_SITE_URL=https://lo-que-te-de-netlify.netlify.app
```

Sirve sólo para que WhatsApp encuentre la miniatura del enlace. Si no la tocas,
la web funciona igual, pero la vista previa saldrá sin imagen.

Como no sabes la URL hasta que la subes: sube una vez, copia el enlace que te
den, pégalo en `.env`, vuelve a hacer `npm run build` y vuelve a subir. Son dos
minutos y sólo hay que hacerlo una vez.

```
npm run build
```

Genera la carpeta **`dist/`**. Eso es la web entera: súbela tal cual.

- **Netlify** — arrastra la carpeta `dist` a [app.netlify.com/drop](https://app.netlify.com/drop). Te da un enlace al instante.
- **Vercel** — `npx vercel --prod` desde la raíz del proyecto.
- **GitHub Pages** — sube el contenido de `dist/` a la rama `gh-pages`.

No necesita servidor, ni base de datos, ni claves. Son ficheros estáticos.

La carpeta ocupa unos **39 MB** (20 MB de fotos, 10 de vídeo, 5 de respaldo para
navegadores viejos y 4 de tipografías y demás), pero eso **no** es lo que se
descarga ella: cada capítulo pide lo suyo cuando te acercas.

Medido en un navegador de verdad a 390 px, contando byte a byte lo que sale del
servidor:

| | |
|---|---|
| Primera pantalla | **~1,1 MB** (de los cuales 0,5 son los 25 fotogramas de la ráfaga de portada) |
| Bajar la web entera sin pararse, con los siete clips | **~19 MB** |

De las **27 fotos sueltas** que se añadieron en la segunda curación, en la
primera pantalla se descargan **cero**: todas son `loading="lazy"` con `srcset` y
`sizes`, y ninguna se pide hasta que su capítulo se acerca.

---

## Si cambias las fotos

Los originales viven en `./Fotos_y_Videos/` y **no se tocan nunca**.
La web usa copias optimizadas en `public/m/`.

### Quién decide qué foto sale

**`scripts/curation.mjs`. Nada es automático.** Ese fichero *es* la selección:
una lista escrita a mano. `media:prepare` genera sólo lo que aparece ahí y borra
lo demás, así que la selección es **reproducible**: mañana sale exactamente lo
mismo que hoy. No hay ningún algoritmo eligiendo fotos por su cuenta.

Los ids son los 5 dígitos del nombre del original
(`00001380-PHOTO-…jpg` → `01380`).

| Quiero… | Se hace así |
|---|---|
| **Meter una foto** | Añadir un momento a `MOMENTOS`: `{ id: 'loQueSea', kind: 'still', frames: ['01234'], keep: 0 }` |
| **Quitar una foto** | Meter su id en `EXCLUDE_REASON`, con su motivo. No se genera nada suyo, no llega a `public/m/`, no llega a `dist/` y si alguien la vuelve a nombrar por error, `media:prepare` se para y lo dice. El original **no se borra**. |
| **Elegir la foto que manda de una ráfaga** | `keep` es el índice dentro de `frames` (empieza en 0) |
| **Decidir en qué sección sale** | El `id` del momento es el que escribe `data-rafaga="…"` en `src/main.js`. Ahí se decide el sitio. Si el id ya no existe, el hueco desaparece solo: no quedan marcos vacíos ni pies huérfanos. |

Y cuatro interruptores por momento:

| | |
|---|---|
| `grande: true` | derivados hasta 1920px — sólo para lo que va a pantalla completa de verdad |
| `menuda: true` | derivados hasta 840px — piezas pequeñas (tríptico, tira de post-créditos) |
| `memoria: true` | es una de las seis caras del juego «Seis caras» |
| `cierre: true` | entra en la rotación de caras del final |

Después de tocar cualquier cosa de ahí:

```
npm run media:prepare
```

Tarda unos minutos. Al terminar borra de `public/m/` lo que ya no use nadie,
para que no se suban sobras de una selección anterior.

Para rehacer sólo los vídeos:

```
SOLO=video npm run media:prepare        # en PowerShell:  $env:SOLO='video'; npm run media:prepare
```

Necesita **ffmpeg** instalado (ya lo está en este equipo).

Y para volver a inventariar los originales (recuento, duplicados, fotos
repetidas, vídeos, qué entró y qué no):

```
npm run media:analyze
```

No toca nada: sólo lee y escribe informes en `Fotos_y_Videos/_ANALISIS/`.

- **`informe-multimedia.md`** — el recuento y las decisiones, en texto.
- **`informe-visual.html`** — ábrelo en el navegador: todas las miniaturas, con
  borde amarillo en la elegida de cada ráfaga y apagadas las que no entraron.
- **`manifiesto.json`** — lo mismo en crudo.

> Ningún texto de los que lee Diana cita ya una cifra: en la edición final se
> quitó el tono de inventario («once fotos», «treinta y seis fotos»…). Así que
> cambiar qué fotos entran en una secuencia no obliga a tocar ningún texto.
> Los recuentos siguen siendo reales, pero viven en los informes.

---

## Comprobar que se ve bien

```
npm run qa
```

Abre un navegador de verdad, recorre la web en seis tamaños de pantalla
(390×844, 393×852, 430×932, 768×1024, 1440×900 y 1920×1080) y guarda capturas en
`.qa/`, avisando de desbordes horizontales y errores de consola.

Para uno solo (va mucho más rápido):

```
QA_SIZE=390x844 npm run qa      # en PowerShell:  $env:QA_SIZE='390x844'; npm run qa
```

Y esto otro no mira capturas: **toca las cosas**.

```
npm run qa:uso
```

Abre la lupa y la cierra con ESC, encuentra dos secretos, juega una pareja del
memory, enciende y sopla la vela, y comprueba que no hay desborde en siete
tamaños más, incluidos 320×568 y apaisado. Son 31 comprobaciones; si alguna
falla, dice cuál.

---

## Lo que ve ella antes de abrirlo

Cuando pegues el enlace en WhatsApp aparece:

> **Para Diana ❤️**
> Tengo algo para ti.

y una imagen con **13·09** y *PARA DIANA* sobre negro. **No sale ninguna foto**:
la previsualización no puede destriparle la sorpresa.

Si quieres cambiarla, está en `scripts/og-image.mjs` y se regenera con:

```
node scripts/og-image.mjs
```

---

## Privacidad

Ninguna foto sale de tu ordenador ni del servidor donde la subas.
No hay analítica, ni cookies, ni fuentes cargadas desde Google.
Las tipografías van incluidas en el propio sitio.

El enlace no está protegido con contraseña: quien lo tenga, la ve.
No lo indexan los buscadores (`noindex`), pero trátalo como algo privado.
