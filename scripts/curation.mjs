// CURACIÓN — hecha a mano tras revisar las 399 fotos y los 31 vídeos.
// Los ids son los 5 dígitos del nombre original (00001380-PHOTO-… -> '01380').
// `keep` es el índice dentro de `frames` del fotograma elegido.
//
// ─────────────────────────────────────────────────────────────────────────
// ESTE FICHERO ES LA SELECCIÓN. No hay nada automático.
//
//   incluir una foto   -> añadir un momento con `frames: ['0xxxx']`
//   excluir una foto   -> meter su id en EXCLUDE_REASON (no se copia ni se
//                         genera nada suyo, y media:analyze la marca aparte)
//   fijar el hero      -> `keep` apunta al fotograma que manda de esa ráfaga
//   fijar una sección  -> el `id` del momento es el que pone `data-rafaga`
//                         en src/main.js; ahí se decide dónde sale
//
// `media:prepare` sólo genera lo que aparece aquí y borra lo demás, así que
// la selección es reproducible: mañana sale exactamente lo mismo.
// ─────────────────────────────────────────────────────────────────────────
//
// Tamaños de los derivados:
//   grande  -> hasta 1920px. Sólo lo que va de verdad a sangre.
//   (nada)  -> hasta 1080px. Marcos de capítulo.
//   menuda  -> hasta 840px.  Piezas pequeñas (tríptico, post-créditos).
//
// Otros interruptores:
//   memoria -> una de las seis caras del juego "Seis caras"
//   cierre  -> entra en la rotación de caras del final
//
// Nada aquí afirma fechas ni lugares: el EXIF está borrado y no hay cronología real.

export const EXCLUDE_REASON = {
  privado: ['01010', '01011', '01012', '01068', '01156', '01189', '01195', '01198', '01281', '01286'],
  ajeno: ['00998'], // reel de Instagram de otra persona, no es material suyo
  // La escena de la nevera. Cesar pidió expresamente que no saliera en la web.
  // Los originales siguen intactos en Fotos_y_Videos/: esto sólo impide que se
  // generen derivados y que aparezcan en ninguna selección.
  nevera: ['01185', '01280'],
  // Sale otra persona a la que no podemos identificar con el material que hay.
  // Regla dura de DESIGN.md: no se supone quién aparece en una foto.
  sinIdentificar: ['01006', '01007', '01009', '01067'],
};

export const MOMENTOS = [
  // ── Ráfagas ────────────────────────────────────────────────────────────
  // La imagen no es una imagen: son los fotogramas reales de ese segundo.
  {
    id: 'ramo',
    kind: 'burst',
    grande: true, // portada y final, a sangre
    grade: '#473722',
    memoria: true,
    cierre: true,
    // Las 25 del pasillo, enteras. El texto dice "veinticinco" y se ven veinticinco.
    // (01362 es vídeo, por eso no está.)
    frames: ['01360', '01361', '01363', '01364', '01365', '01366', '01367', '01368', '01369',
             '01370', '01371', '01372', '01373', '01374', '01375', '01376', '01377', '01378',
             '01379', '01380', '01381', '01382', '01383', '01384', '01385'],
    keep: 19, // 01380 — la carcajada abierta
  },
  {
    id: 'lavadero',
    kind: 'burst',
    grade: '#211D1E',
    cierre: true,
    frames: ['01109', '01110', '01111', '01112', '01113', '01114', '01115', '01116', '01117', '01118', '01119'],
    keep: 3, // 01112 — mira a cámara con la manguera
  },
  {
    id: 'gimnasio',
    kind: 'burst',
    grade: '#1B1B1B',
    memoria: true,
    cierre: true,
    frames: ['01140', '01141', '01142', '01143', '01144', '01145', '01146', '01147', '01148', '01149'],
    keep: 7, // 01147 — la sonrisa grande
  },
  {
    id: 'cocheNoche',
    kind: 'burst',
    grande: true, // plano a sangre del capítulo
    grade: '#171412',
    cierre: true,
    frames: ['01158', '01159', '01160', '01161', '01162', '01163', '01164', '01165', '01166',
             '01167', '01168', '01169', '01170', '01171', '01172', '01173'],
    keep: 8, // 01166 — de pie, riéndose, cuerpo entero
  },
  {
    id: 'monte',
    kind: 'burst',
    grade: '#13141B',
    frames: ['01176', '01177', '01178', '01252', '01255', '01258'],
    keep: 1, // 01177 — la roca oscura y el cielo azul
  },
  {
    id: 'ascensor',
    kind: 'burst',
    grade: '#21201C',
    cierre: true,
    frames: ['01179', '01180', '01182', '01183'],
    keep: 2, // 01182
  },
  {
    id: 'cocheNocturno',
    kind: 'burst',
    grade: '#120E0C',
    frames: ['01090', '01091', '01093', '01097', '01098', '01099', '01100'],
    keep: 5, // 01099
  },
  {
    id: 'graduacion',
    kind: 'burst',
    grande: true, // plano a sangre del capítulo
    grade: '#23231F',
    memoria: true,
    cierre: true,
    frames: ['01290', '01291', '01292', '01293', '01294', '01295', '01296', '01297',
             '01298', '01299', '01300', '01301', '01302', '01303', '01304', '01305', '01306', '01307'],
    keep: 16, // 01306 — de frente, manos en la cintura, sonrisa completa
  },
  {
    id: 'enBrazos',
    kind: 'burst',
    grade: '#23231F',
    cierre: true,
    frames: ['01222', '01223', '01225', '01226', '01227', '01230', '01309', '01312'],
    keep: 5, // 01230
  },
  {
    id: 'familia',
    kind: 'still',
    grade: '#23231F',
    frames: ['01234'],
    keep: 0,
  },
  {
    id: 'senda',
    kind: 'burst',
    grade: '#3B402D',
    cierre: true,
    // Secuencia real de marcha: al pasar los fotogramas, camina de verdad.
    frames: ['01319', '01320', '01321', '01322', '01323', '01324', '01325', '01326', '01327',
             '01328', '01329', '01330', '01331', '01332', '01333', '01334', '01335', '01336', '01337'],
    keep: 11, // 01330
  },
  {
    id: 'arco',
    kind: 'burst',
    grade: '#333D2B',
    memoria: true,
    cierre: true,
    frames: ['01397', '01398', '01399', '01400', '01401', '01402', '01403', '01405', '01406', '01407', '01408', '01409'],
    keep: 5, // 01402 — se gira y sonríe
  },

  // ── Fotos sueltas ──────────────────────────────────────────────────────
  // Segunda curación, hecha sobre las hojas de contacto de las 399.
  // Una foto = un momento de un solo fotograma: no late, no se recorre, y no
  // ensucia el mosaico de post-créditos (que sólo recoge descartes de ráfaga).
  // Ninguna lleva pie que afirme nada: están para mirarlas.

  // Lo que no posaste
  { id: 'mesa',    kind: 'still', grade: '#4F4437', memoria: true, cierre: true, frames: ['01107'], keep: 0 },
  { id: 'suelo',   kind: 'still', grade: '#221D1C', frames: ['01125'], keep: 0 },
  { id: 'volante', kind: 'still', grade: '#14171C', frames: ['01120'], keep: 0 },

  // El amarillo — el túnel de lavado, entrando y ya terminado
  { id: 'tunelEntra', kind: 'still', grade: '#3B3938', frames: ['01128'], keep: 0 },
  { id: 'tunelSeco',  kind: 'still', grade: '#3B3938', frames: ['01139'], keep: 0 },

  // Galería
  // A sangre, pero no `grande`: los marcos a sangre se limitan por altura
  // (78vh), así que en escritorio nunca pasan de ~950 px reales. 1080 sobra y
  // 1920 sería medio mega que nadie llega a pedir.
  { id: 'cesped',     kind: 'still', grade: '#2A251A', cierre: true, frames: ['01311'], keep: 0 },
  { id: 'cerca',      kind: 'still', grade: '#282015', memoria: true, cierre: true, frames: ['01188'], keep: 0 },
  { id: 'casa',       kind: 'still', grade: '#271C1E', frames: ['01191'], keep: 0 },
  // Tríptico: posan, se ríen, se acercan. Tres fotos seguidas que cuentan algo.
  { id: 'jardinA',    kind: 'still', menuda: true, grade: '#151C21', frames: ['01242'], keep: 0 },
  { id: 'jardinB',    kind: 'still', menuda: true, grade: '#151C21', frames: ['01246'], keep: 0 },
  { id: 'jardinC',    kind: 'still', menuda: true, grade: '#151C21', cierre: true, frames: ['01248'], keep: 0 },
  { id: 'espejoRosa', kind: 'still', grade: '#2A171A', frames: ['01186'], keep: 0 },
  { id: 'cama',       kind: 'still', grade: '#1C1410', cierre: true, frames: ['01196'], keep: 0 },
  { id: 'cueva',      kind: 'still', grade: '#18171A', frames: ['01249'], keep: 0 },
  { id: 'camino',     kind: 'still', grade: '#494D3D', frames: ['01313'], keep: 0 },

  // Post-créditos. Buenas, pero sin capítulo donde encajaran.
  { id: 'pCesped',   kind: 'still', menuda: true, grade: '#2A251A', frames: ['01240'], keep: 0 },
  { id: 'pBrazos',   kind: 'still', menuda: true, grade: '#2D2B25', frames: ['01238'], keep: 0 },
  { id: 'pDePie',    kind: 'still', menuda: true, grade: '#2D2B25', frames: ['01239'], keep: 0 },
  { id: 'pLlevada',  kind: 'still', menuda: true, grade: '#2D2B25', frames: ['01202'], keep: 0 },
  { id: 'pJardin',   kind: 'still', menuda: true, grade: '#151C21', frames: ['01243'], keep: 0 },
  { id: 'pSendero',  kind: 'still', menuda: true, grade: '#3A3C2D', frames: ['01318'], keep: 0 },
  { id: 'pSendero2', kind: 'still', menuda: true, grade: '#3A3C2D', frames: ['01251'], keep: 0 },
  { id: 'pArco',     kind: 'still', menuda: true, grade: '#353F2C', frames: ['01356'], keep: 0 },
  { id: 'pEspejoA',  kind: 'still', menuda: true, grade: '#27221B', frames: ['01058'], keep: 0 },
  { id: 'pEspejoB',  kind: 'still', menuda: true, grade: '#27221B', frames: ['01066'], keep: 0 },
  { id: 'pEspejoC',  kind: 'still', menuda: true, grade: '#27221B', frames: ['01071'], keep: 0 },
  { id: 'pGym',      kind: 'still', menuda: true, grade: '#2B2824', frames: ['01126'], keep: 0 },
];

// Vídeos. Todos se sirven silenciados y en bucle salvo `sound: true`,
// que permite que ella lo active.
//
// `crf` sube o baja la compresión de ese clip (por defecto 27; más alto = más
// ligero). Sólo se toca cuando un clip se sale de madre: el del acto son 18 s
// de plano general con mucho movimiento de cámara y a 27 pesaba 3,8 MB, un
// tercio de todo lo que descarga la web. A 30 baja a 2,6 y en pantalla, donde
// no llega a 400 px de ancho, no se distingue.
//
// `recorte` = crop de ffmpeg [w, h, x, y] sobre el original.
// 01279 está grabado con la mesa ocupando el 60 % inferior del cuadro: ella y
// Taysson quedan en una franja arriba. No es cosa de object-position — el marco
// tiene la misma proporción que el vídeo, así que object-fit: cover no recorta
// nada: hay que recortar el propio vídeo.
export const VIDEOS = [
  { id: 'taysson-alza',    src: '01279', sound: true,  poster: 7.5,  grade: '#2A2622', recorte: [720, 700, 0, 30] },
  { id: 'taysson-sofa',    src: '01284', sound: false, poster: 12.0, grade: '#2A2622', trim: [8, 26] },
  { id: 'taysson-brazos',  src: '01410', sound: false, poster: 4.0,  grade: '#2A2622' },
  { id: 'senda-viva',      src: '01338', sound: false, poster: 0.5,  grade: '#3B402D' }, // Live Photo 1,5 s
  { id: 'conducir',        src: '01150', sound: false, poster: 1.0,  grade: '#171412' },
  { id: 'carretera',       src: '01122', sound: false, poster: 8.0,  grade: '#120E0C', trim: [4, 18] },
  { id: 'graduacion-acto', src: '01108', sound: false, poster: 14.0, grade: '#23231F', trim: [10, 28], crf: 30 },
];

// Ráfagas ofrecidas en el juego "La ráfaga correcta".
export const JUEGO_RAFAGAS = ['ramo', 'gimnasio', 'graduacion'];

// Cifras reales del archivo, contadas con `npm run media:analyze`.
// Los textos de la web las repiten a mano en src/data/content.js: si esto
// cambia, hay que mirar `JUEGOS.cuantas` y su `cierre`.
//
// 12·09·2026 — los vídeos pasaron de 31 a 30: 00998 (el reel de Instagram
// ajeno, que ya estaba excluido y no se usaba en ninguna parte) dejó de estar
// en Fotos_y_Videos/. Nada de la web lo referenciaba.
export const ARCHIVO = {
  fotos: 399,
  videos: 30,
  verticales: 381,
  horizontales: 18,
};
