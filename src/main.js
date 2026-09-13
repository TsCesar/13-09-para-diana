import './styles/base.css';
import './styles/rafaga.css';
import './styles/capitulos.css';
import './styles/juegos.css';
import './styles/capas.css';

import indiceCrudo from './data/media.json';
import { PORTADA, CAPITULOS, CARTA, FINAL, POSTCREDITOS, RAZONES, DESEO, UI } from './data/content.js';
import { conBase } from './modules/rutas.js';
import { montarRafagas } from './modules/burst.js';
import { montarGrado } from './modules/grade.js';
import { crearVideo } from './modules/video.js';
import { juegoMemoria } from './modules/memoria.js';
import { montarProgreso } from './modules/progreso.js';
import { montarLightbox } from './modules/lightbox.js';
import { montarSecretos } from './modules/secretos.js';
import { montarDeseo } from './modules/deseo.js';
import { montarAcceso, montarReinicio } from './modules/acceso.js';
import { montarMusica } from './modules/musica.js';
import { montarRazones } from './modules/opcionales.js';

/* Las rutas de media.json son relativas a public/ («m/ramo-keep-840.avif»).
   Se les pone el prefijo de publicación aquí, una sola vez: a partir de este
   punto, ráfagas, clips, juegos, mosaico y final reciben rutas ya buenas y
   ninguno tiene que acordarse de la subcarpeta de GitHub Pages. */
const medios = conBase(indiceCrudo);

const app = document.getElementById('app');
const vid = (id) => medios.videos.find((v) => v.id === id);

const nl = (s) => s.replace(/\n/g, '<br>');

/* Lo vacio no se dibuja. Un pie sin texto no deja un <figcaption> con su
   margen, y un capitulo sin titulo ni texto entra directamente en imagen:
   que es justo lo que se quiere en las dos graduaciones y en el camino. */
const pie = (t, clase = 'pie') => (t ? `<figcaption class="${clase}">${t}</figcaption>` : '');
const cabeza = (c, clase = 'cap__cuerpo cap__cabeza') => {
  const t = c?.titulo ? `<h2 class="cap__titulo">${c.titulo}</h2>` : '';
  const x = c?.texto ? `<p class="cap__texto">${nl(c.texto)}</p>` : '';
  return t || x ? `<div class="${clase}">${t}${x}</div>` : '';
};

/* ── Portada ──────────────────────────────────────────────── */
const portada = `
<section class="cap portada" id="portada" data-grado="#120E0C">
  <div class="portada__fecha" aria-hidden="true">
    <span class="portada__d">${PORTADA.fecha[0]}</span><span
          class="portada__p">·</span><span class="portada__d">${PORTADA.fecha[1]}</span>
  </div>
  <h1 class="oculto">13 de septiembre — para Diana</h1>
  <div class="portada__lienzo" data-rafaga="ramo" data-prioridad="high"
       data-sizes="100vw" data-alt=""></div>
  <div class="portada__bloque">
    <p class="portada__entrada">${PORTADA.entrada}</p>
    <p class="portada__pie">${PORTADA.pie}</p>
  </div>
  <span class="portada__abajo" aria-hidden="true">${PORTADA.ayuda}</span>
</section>`;

/* ── 1. La ráfaga ─────────────────────────────────────────── */
const capRafaga = `
<section class="cap cap--dos" id="rafaga" data-grado="#473722">
  <div class="cap__media">
    <div class="marco" data-rafaga="ramo" data-sizes="(min-width:1024px) 56vw, 100vw"
         data-alt="${CAPITULOS.rafaga.titulo}"></div>
  </div>
  ${cabeza(CAPITULOS.rafaga, 'cap__cuerpo')}
</section>`;

/* ── 2. Lo que no posaste ─────────────────────────────────── */
const capCotidiano = `
<section class="cap" id="cotidiano" data-grado="#211D1E">
  ${cabeza(CAPITULOS.cotidiano)}
  <div class="tira-momentos">
    <figure class="momento">
      <div class="marco" data-rafaga="lavadero" data-sizes="(min-width:700px) 46vw, 100vw" data-alt=""></div>
      ${pie(CAPITULOS.cotidiano.pies.lavadero)}
    </figure>
    <figure class="momento momento--baja">
      <div class="marco" data-rafaga="gimnasio" data-sizes="(min-width:700px) 46vw, 100vw" data-alt=""></div>
      ${pie(CAPITULOS.cotidiano.pies.gimnasio)}
    </figure>
    <div class="momento momento--video" data-video="conducir" data-pie="${CAPITULOS.cotidiano.pies.conducir || ''}"></div>
  </div>
  <!-- Tres sueltas, sin pie. El capítulo ya ha dicho lo que tenía que decir
       y estas tres funcionan mejor calladas (DESIGN.md § Photography). -->
  <div class="tira-momentos tira-momentos--muda">
    <figure class="momento">
      <div class="marco" data-rafaga="mesa" data-sizes="(min-width:700px) 46vw, 100vw" data-alt=""></div>
    </figure>
    <figure class="momento momento--baja">
      <div class="marco" data-rafaga="suelo" data-sizes="(min-width:700px) 46vw, 100vw" data-alt=""></div>
    </figure>
    <figure class="momento">
      <div class="marco" data-rafaga="volante" data-sizes="(min-width:700px) 40vw, 100vw" data-alt=""></div>
    </figure>
  </div>
</section>`;

/* ── 3. El amarillo ───────────────────────────────────────── */
const capCoche = `
<section class="cap cap--ancho" id="coche" data-grado="#171412">
  ${cabeza(CAPITULOS.coche)}
  <figure class="sangre">
    <div class="marco" data-rafaga="cocheNoche" data-sizes="100vw" data-alt=""></div>
    ${pie(CAPITULOS.coche.pies.cocheNoche, 'pie pie--sangre')}
  </figure>
  <div class="tira-momentos tira-momentos--par">
    <figure class="momento">
      <div class="marco" data-rafaga="monte" data-sizes="(min-width:700px) 46vw, 100vw" data-alt=""></div>
      ${pie(CAPITULOS.coche.pies.monte)}
    </figure>
    <div class="momento momento--video" data-video="carretera" data-pie="${CAPITULOS.coche.pies.carretera || ''}"></div>
  </div>
  <!-- El mismo coche otro día: entra y ya está seco. Dos fotos, sin texto. -->
  <div class="secuencia secuencia--dos">
    <div class="marco" data-rafaga="tunelEntra" data-sizes="(min-width:700px) 46vw, 100vw" data-alt=""></div>
    <div class="marco" data-rafaga="tunelSeco" data-sizes="(min-width:700px) 46vw, 100vw" data-alt=""></div>
  </div>
</section>`;

/* ── 4. Taysson ───────────────────────────────────────────────
   Dos clips, y los dos son él. Aquí hubo una foto (la nevera) y un clip en el
   que no sale Taysson sino un gato: los dos están retirados a propósito, así
   que el capítulo no intenta rellenar una rejilla. El clip con sonido abre a
   la izquierda y el otro baja a la derecha, desfasado.
   (El porqué, en CLAUDE.md. Este comentario vive fuera de la plantilla a
   propósito: dentro viajaría al navegador como comentario HTML.) */
const capTaysson = `
<section class="cap" id="taysson" data-grado="#2A2622">
  ${cabeza(CAPITULOS.taysson)}
  <div class="taysson taysson--dos">
    <div class="taysson__alza" data-video="taysson-alza" data-pie="${CAPITULOS.taysson.pies.alza || ''}"></div>
    <div class="taysson__sofa" data-video="taysson-sofa" data-pie="${CAPITULOS.taysson.pies.sofa || ''}"></div>
  </div>
</section>`;

/* ── 5. 20·12 ─────────────────────────────────────────────── */
const capAniversario = `
<section class="cap aniv" id="aniversario" data-grado="#21201C">
  <div class="aniv__cuerpo">
    <span class="aniv__marca" aria-hidden="true">${CAPITULOS.aniversario.marca[0]}·${CAPITULOS.aniversario.marca[1]}</span>
    <h2 class="aniv__titulo">${CAPITULOS.aniversario.titulo}</h2>
    <p class="cap__texto">${nl(CAPITULOS.aniversario.texto)}</p>
  </div>
  <div class="aniv__par">
    <figure class="momento">
      <div class="marco" data-rafaga="ascensor" data-sizes="(min-width:700px) 42vw, 100vw" data-alt=""></div>
      ${pie(CAPITULOS.aniversario.pies.ascensor)}
    </figure>
    <figure class="momento momento--baja">
      <div class="marco" data-rafaga="cocheNocturno" data-sizes="(min-width:700px) 42vw, 100vw" data-alt=""></div>
      ${pie(CAPITULOS.aniversario.pies.cocheNocturno)}
    </figure>
  </div>
</section>`;

/* ── 6. El acto de Diana ──────────────────────────────────────
   SU graduación, y un día distinto del que viene justo después. Por eso
   está aquí y no dentro de #oro: el clip del pabellón (01108) y las fotos
   del jardín con la banda naranja (#oro) son DOS actos diferentes y no se
   mezclan. Lo que los separa en pantalla es el grado —este clip trae el
   morado medido de su propio vídeo, no el verde-tierra del jardín— y que
   cada uno tiene su sitio y su ritmo: aquí un solo plano, con aire.
   Mudo a propósito: es un momento suyo, no hace falta etiquetarlo. */
const capActo = `
<section class="cap acto" id="acto" data-grado="#160B22">
  ${cabeza(CAPITULOS.acto)}
  <div class="acto__clip" data-video="graduacion-acto" data-pie="${CAPITULOS.acto.pie || ''}"></div>
</section>`;

/* ── 7. La graduación de Cesar ────────────────────────────────
   El jardín, la banda naranja y ella con el mono. Capítulo mudo: se entra
   directamente en imagen y nadie lo presenta — si algún día
   `CAPITULOS.oro` vuelve a tener título o texto, la cabeza aparece sola y
   lo que va debajo no se entera. */
const capOro = `
<section class="cap cap--ancho cap--mudo" id="oro" data-grado="#23231F">
  ${cabeza(CAPITULOS.oro)}
  <figure class="sangre">
    <div class="marco" data-rafaga="graduacion" data-sizes="100vw" data-alt=""></div>
  </figure>
  <div class="tira-momentos">
    <figure class="momento">
      <div class="marco" data-rafaga="enBrazos" data-sizes="(min-width:700px) 46vw, 100vw" data-alt=""></div>
      ${pie(CAPITULOS.oro.pies.enBrazos)}
    </figure>
    <figure class="momento momento--baja">
      <div class="marco" data-rafaga="familia" data-sizes="(min-width:700px) 46vw, 100vw" data-alt=""></div>
      ${pie(CAPITULOS.oro.pies.familia)}
    </figure>
  </div>
</section>`;

/* ── 8. Y luego está todo lo demás ─────────────────────────
   La galería. No es una cuadrícula: es un ritmo. Un plano a sangre, una
   pareja desfasada, un tríptico apretado que cuenta una secuencia, otra
   pareja, un respiro sin cara y un cierre estrecho. Ninguna pieza tiene el
   mismo ancho que la anterior, y casi ninguna lleva pie: la mayoría de estas
   fotos no necesitan que yo diga nada encima. */
const capGaleria = `
<section class="cap cap--ancho galeria" id="galeria" data-grado="#25211F">
  ${cabeza(CAPITULOS.galeria)}

  <div class="galeria__par galeria__par--primero">
    <div class="marco" data-rafaga="cerca" data-sizes="(min-width:700px) 44vw, 100vw" data-alt=""></div>
    <div class="marco" data-rafaga="casa" data-sizes="(min-width:700px) 38vw, 100vw" data-alt=""></div>
  </div>

  <!-- Tríptico: posan, se ríen, se acercan. Van pegadas a propósito —
       el hueco pequeño es lo que hace que se lean como una secuencia. -->
  <div class="secuencia secuencia--tres">
    <div class="marco" data-rafaga="jardinA" data-sizes="(min-width:700px) 31vw, 100vw" data-alt=""></div>
    <div class="marco" data-rafaga="jardinB" data-sizes="(min-width:700px) 31vw, 100vw" data-alt=""></div>
    <div class="marco" data-rafaga="jardinC" data-sizes="(min-width:700px) 31vw, 100vw" data-alt=""></div>
  </div>

  <div class="galeria__par galeria__par--vuelta">
    <div class="marco" data-rafaga="espejoRosa" data-sizes="(min-width:700px) 40vw, 100vw" data-alt=""></div>
    <div class="marco" data-rafaga="cama" data-sizes="(min-width:700px) 44vw, 100vw" data-alt=""></div>
  </div>

  <!-- El respiro. A sangre no funcionaba: en un móvil, una vertical a todo el
       ancho deja una pantalla entera ocupada por su espalda. Contenida y
       desplazada se lee como lo que es, un sitio. -->
  <div class="galeria__respiro">
    <div class="marco" data-rafaga="cueva" data-sizes="(min-width:1024px) 40vw, (min-width:700px) 78vw, 100vw" data-alt=""></div>
  </div>

  <div class="galeria__cierre">
    <div class="marco" data-rafaga="camino" data-sizes="(min-width:1024px) 34vw, (min-width:700px) 64vw, 100vw" data-alt=""></div>
  </div>
</section>`;

/* ── 9. El juego ──────────────────────────────────────────────
   Queda uno. Sin cabecera de capítulo encima: el juego trae su propio
   título y anunciarlo dos veces sobraba. */
const capJuegos = `
<section class="cap" id="juegos" data-grado="#1B1B1B">
  <div id="juego-memoria"></div>
</section>`;

/* ── Cosas que adoro de ti — sólo existe si RAZONES.lista tiene algo ── */
const capRazones = `<section class="cap" id="razones" data-grado="#211D1E"><div class="cap__cuerpo"></div></section>`;

/* ── 10. El camino ────────────────────────────────────────────
   Sin una sola palabra: se arrastra el dedo y ella anda. La única cosa que
   se escribe aquí es la pista del gesto, y va encima de la foto.
   Si `CAPITULOS.senda` vuelve a tener texto, el cuerpo aparece solo y la
   rejilla de escritorio recupera su fila (`.senda--muda` deja de aplicar). */
const sendaCuerpo = [
  cabeza(CAPITULOS.senda, 'senda__cuerpo'),
  CAPITULOS.senda.pie ? `<p class="pie">${CAPITULOS.senda.pie}</p>` : '',
].join('');

const capSenda = `
<section class="cap senda${sendaCuerpo ? '' : ' senda--muda'}" id="senda" data-grado="#3B402D">
  <div class="senda__media">
    <div class="marco" data-rafaga="senda" data-sizes="(min-width:1024px) 46vw, 100vw" data-alt=""></div>
  </div>
  ${sendaCuerpo}
  <!-- Va antes del arco a propósito: el arco es ella girándose, y la última
       foto de la secuencia es la que por fin mira atrás. -->
  <div class="senda__viva" data-video="senda-viva" data-pie="${CAPITULOS.senda.pieViva || ''}"></div>
  <figure class="senda__arco">
    <div class="marco" data-rafaga="arco" data-sizes="(min-width:1024px) 40vw, 86vw" data-alt=""></div>
  </figure>
</section>`;

/* ── 11. La carta ────────────────────────────────────────── */
const capCarta = `
<section class="cap carta" id="carta" data-grado="#EDE6DA">
  <div class="carta__hoja">
    ${CARTA.esBorrador ? `<p class="carta__aviso">${CARTA.aviso}</p>` : ''}
    <p class="carta__enc">${CARTA.encabezado}</p>
    ${CARTA.parrafos.map((p) => `<p class="carta__p">${p}</p>`).join('')}
    <p class="carta__firma">${CARTA.firma}</p>
    <p class="carta__pie">${CARTA.pie}</p>
  </div>
</section>`;

/* ── 12. Final ───────────────────────────────────────────── */
const capFinal = `
<section class="cap final" id="final" data-grado="#120E0C">
  <div class="final__fondo" aria-hidden="true"></div>
  <div class="final__velo" aria-hidden="true"></div>
  <div class="final__cuerpo">
    <p class="final__frase" data-escribir="${FINAL.frase}"></p>
    <p class="final__sub">${FINAL.sub}</p>
    <p class="final__cierre">${nl(FINAL.cierre)}</p>
    <button class="boton final__deseo" type="button">${DESEO.boton}</button>
  </div>
  <span class="final__seguir" aria-hidden="true">${FINAL.seguir}</span>
</section>`;

/* ── 13. Post-créditos ───────────────────────────────────── */
/* Arriba, doce fotos buenas que no tenían dónde ir; debajo, el mosaico, que
   entra sin que nadie lo presente. */
// Once. Eran doce y cuadraban exacto a 2, 3 y 4 columnas, pero Cesar retiró la
// primera (01240) y lo que NO se hace es meter otra para cuadrar la rejilla: la
// siguiente ocupa su sitio y ya está. El desfase de las pares disimula de sobra
// la fila corta del final.
// El orden agrupa lo que se parece —las dos de llevarla en brazos, las tres del
// paseo, los tres espejos— para que se lean como tomas del mismo rato y no como
// repeticiones sueltas repartidas por la tira.
const POST_EXTRA = ['pDePie', 'pBrazos', 'pLlevada', 'pJardin',
  'pSendero', 'pSendero2', 'pArco', 'pEspejoA', 'pEspejoB', 'pEspejoC', 'pGym'];

const capPost = `
<section class="cap post" id="post" data-grado="#171412">
  <div class="cap__cuerpo">
    <h2 class="post__titulo">${POSTCREDITOS.titulo}</h2>
    <p class="cap__texto">${nl(POSTCREDITOS.texto)}</p>
  </div>
  <div class="post__tira">
    ${POST_EXTRA.map((id) =>
      `<div class="marco" data-rafaga="${id}" data-sizes="(min-width:1024px) 23vw, (min-width:700px) 30vw, 46vw" data-alt=""></div>`).join('')}
  </div>
  ${POSTCREDITOS.mosaico ? `<p class="pie post__nota">${POSTCREDITOS.mosaico}</p>` : ''}
  <div class="post__mosaico" id="post-mosaico"></div>
  <button class="boton boton--tenue mosaico__abrir" type="button">${UI.ampliar}</button>
  <p class="post__huevo">${POSTCREDITOS.huevo}</p>
  <p class="post__fin">${POSTCREDITOS.pie}</p>
  <a class="post__volver" href="#portada">${FINAL.volver}</a>
</section>`;

app.innerHTML = [
  portada, capRafaga, capCotidiano, capCoche, capTaysson,
  capAniversario, capActo, capOro, capGaleria, capJuegos, capRazones, capSenda,
  capCarta, capFinal, capPost,
].join('');

/* ── Montaje ──────────────────────────────────────────────── */

// Vídeos declarados con data-video.
app.querySelectorAll('[data-video]').forEach((slot) => {
  const v = vid(slot.dataset.video);
  if (!v) { slot.remove(); return; }
  // El hueco lleva las clases de colocación del capítulo y el <figure> que lo
  // sustituye tiene que heredarlas, o se cae de su sitio en la rejilla.
  slot.replaceWith(crearVideo(v, { pie: slot.dataset.pie, clase: slot.className }));
});

/* Las secciones opcionales se resuelven ANTES que el grado: si el capítulo de
   razones está vacío se borra, y montarGrado no puede quedarse observando un
   elemento que ya no está en la página —su rect sería todo ceros y ensuciaría
   la interpolación del suelo. */
montarRazones(app.querySelector('#razones .cap__cuerpo'));
if (!RAZONES.lista?.length) app.querySelector('#razones')?.remove();

montarRafagas(app, medios);

/* Pistas sobre la foto. Sólo dos: la primera secuencia —donde se enseña el
   gesto por primera vez— y el camino, que ya no lleva ni una palabra y
   necesita que alguien le diga que ahí se arrastra el dedo. */
for (const [sel, texto] of [
  ['#rafaga .rafaga__marco', CAPITULOS.rafaga.pista],
  ['#senda .senda__media .rafaga__marco', CAPITULOS.senda.pista],
]) {
  const marco = app.querySelector(sel);
  if (!marco || !texto) continue;
  const p = document.createElement('span');
  p.className = 'rafaga__pista';
  p.textContent = texto;
  marco.append(p);
}

montarGrado([...app.querySelectorAll('[data-grado]')]);

/* El único juego. Las doce cartas son seis fotos que ya se han visto antes:
   no cuestan descarga nueva, pero aun así se montan al acercarse. */
{
  const zona = document.getElementById('juego-memoria');
  new IntersectionObserver((es, o) => {
    if (!es[0].isIntersecting) return;
    o.disconnect();
    juegoMemoria(zona, medios);
  }, { rootMargin: '200% 0px' }).observe(zona);
}

/* Mosaico de post-créditos: los fotogramas que no fueron elegidos en ningún
   capítulo. Literalmente "las que no entraron".
   Se construye sólo cuando el capítulo se acerca: son ~126 imágenes y crearlas
   al arrancar retrasa el load de toda la página. */
{
  const zona = document.getElementById('post-mosaico');

  // Intercalado por turnos entre momentos: puestas en fila, veinte fotogramas
  // del mismo ramo se leen como un error de carga en vez de como el archivo.
  // Sin aleatoriedad: el orden sigue siendo determinista.
  const pilas = medios.momentos
    .map((m) => m.frames.filter((_, k) => k !== m.keepIndex))
    .filter((p) => p.length);

  const sobras = [];
  for (let i = 0; sobras.length < pilas.reduce((n, p) => n + p.length, 0); i++) {
    for (const p of pilas) if (p[i]) sobras.push(p[i]);
  }

  new IntersectionObserver((es, o) => {
    if (!es[0].isIntersecting) return;
    o.disconnect();
    // Reparto estable, sin aleatoriedad: el orden del archivo ya es un orden.
    const frag = document.createDocumentFragment();
    for (const f of sobras) {
      const im = new Image();
      im.src = f.url; im.alt = ''; im.loading = 'lazy'; im.decoding = 'async';
      im.className = 'post__teja';
      frag.append(im);
    }
    zona.append(frag);
  }, { rootMargin: '150% 0px' }).observe(zona);
}

/* El clímax: al fondo vuelven, una a una, las caras que han mandado en cada
   capítulo. No es la foto de portada repetida — es todo lo anterior cerrando.
   Quién entra lo decide `cierre` en scripts/curation.mjs: son muchos momentos
   y rotarlos todos ni se ve (dos segundos cada uno son más de un minuto) ni
   sale gratis en descarga. */
{
  const fondo = app.querySelector('.final__fondo');
  const marcados = medios.momentos.filter((m) => m.cierre);
  const caras = (marcados.length ? marcados : medios.momentos).map((m) =>
    ({ url: m.frames[m.keepIndex]?.url || m.keep.srcset[0].url, id: m.id }));

  caras.forEach((c, k) => {
    const im = new Image();
    im.src = c.url; im.alt = ''; im.decoding = 'async'; im.loading = 'lazy';
    im.className = 'final__cara' + (k === 0 ? ' es-visible' : '');
    fondo.append(im);
  });

  const menos = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!menos && caras.length > 1) {
    let k = 0, reloj = null;
    const tejas = [...fondo.children];
    new IntersectionObserver((es) => {
      if (es[0].isIntersecting) {
        if (reloj) return;
        reloj = setInterval(() => {
          tejas[k].classList.remove('es-visible');
          k = (k + 1) % tejas.length;
          tejas[k].classList.add('es-visible');
        }, 2300);
      } else {
        clearInterval(reloj); reloj = null;
      }
    }, { threshold: .35 }).observe(app.querySelector('.final'));
  }
}

/* El final se escribe una vez, letra a letra. Es el segundo y último
   momento de movimiento no solicitado de toda la web. */
{
  const el = app.querySelector('[data-escribir]');
  const texto = el.dataset.escribir;
  el.textContent = '';
  el.setAttribute('aria-label', texto);
  const menos = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const io = new IntersectionObserver((es, o) => {
    if (!es[0].isIntersecting) return;
    o.disconnect();
    if (menos) { el.textContent = texto; app.querySelector('.final').classList.add('esta-escrito'); return; }
    let i = 0;
    const tic = () => {
      el.textContent = texto.slice(0, ++i);
      if (i < texto.length) setTimeout(tic, 52 + (texto[i] === ' ' ? 40 : 0));
      else app.querySelector('.final').classList.add('esta-escrito');
    };
    setTimeout(tic, 420);
  }, { threshold: .6 });
  io.observe(el);
}

/* ── Capas ────────────────────────────────────────────────── */

// El recorrido: una marca por capítulo, en el borde derecho.
montarProgreso(app, ['portada', 'rafaga', 'cotidiano', 'coche', 'taysson',
  'aniversario', 'acto', 'oro', 'galeria', 'juegos', 'senda', 'carta', 'final', 'post']);

// Ver más grande, sólo en el mosaico: en las ráfagas el dedo ya tiene trabajo.
{
  const zona = document.getElementById('post-mosaico');
  const lupa = montarLightbox(zona);
  // Las teselas no son focables a propósito —250 paradas de tabulador son
  // un castigo, no accesibilidad—, así que hay un botón que abre la lupa
  // y desde dentro se pasa con las flechas.
  const abrir = app.querySelector('.mosaico__abrir');
  abrir?.addEventListener('click', () => {
    const tejas = [...zona.querySelectorAll('.post__teja')];
    if (!tejas.length) return;
    lupa.abrir(tejas.map((t) => ({ src: t.currentSrc || t.src, w: t.naturalWidth })), 0, abrir);
  });
}

montarSecretos(app);
montarDeseo(app.querySelector('.final__deseo'));
const musica = montarMusica();
montarReinicio(app.querySelector('#post'));

/* La puerta va la última a propósito: se monta encima de una página que ya
   está entera y medida. Si ACCESO.activo es false no dibuja nada y `alEntrar`
   se llama al momento.

   Al entrar se hace la única pregunta de toda la web: «¿Con música?». Va aquí
   y no dentro de musica.js porque depende de la puerta: sin un gesto previo
   ningún navegador deja sonar nada, así que el propio sí/no es lo que permite
   que la canción arranque. */
montarAcceso(() => musica?.preguntar(document.body));

/* La portada se asienta una sola vez. */
requestAnimationFrame(() => document.querySelector('.portada')?.classList.add('esta-puesta'));
