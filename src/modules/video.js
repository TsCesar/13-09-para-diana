/* Vídeo. Se comporta como una foto que respira: silencioso, en bucle,
 * y sólo se reproduce mientras se ve. Un clip lleva sonido y lo activa ella. */

import { CAPITULOS } from '../data/content.js';

const menosMovimiento = matchMedia('(prefers-reduced-motion: reduce)');

export function crearVideo(v, { pie, clase = '', sizes } = {}) {
  const fig = document.createElement('figure');
  fig.className = `clip ${clase}`.trim();
  fig.style.setProperty('--ratio', v.ratio);

  fig.innerHTML = `
    <div class="clip__marco">
      <img class="clip__base" src="${v.lqip}" alt="" aria-hidden="true">
      <!-- Fotograma nítido siempre presente: sin él, mientras el vídeo no
           carga sólo se ve un rectángulo borroso enorme. -->
      <img class="clip__poster" src="${v.poster}" alt="" aria-hidden="true"
           loading="lazy" decoding="async">
      <!-- Sin atributo poster: el navegador lo descargaría al montar el elemento.
           De eso ya se encarga la <img> de arriba, que sí es lazy. -->
      <video class="clip__v" playsinline muted loop preload="none"
             width="900" height="${Math.round(900 / v.ratio)}"></video>
      ${v.sound ? `<button class="clip__son" type="button" aria-pressed="false">
                     <span class="clip__son-txt">${CAPITULOS.taysson.sonido}</span>
                   </button>` : ''}
    </div>
    ${pie ? `<figcaption class="pie">${pie}</figcaption>` : ''}`;

  const el = fig.querySelector('.clip__v');
  let fuenteLista = false;

  const ponerFuente = () => {
    if (fuenteLista) return;
    fuenteLista = true;
    el.src = v.src;
  };

  new IntersectionObserver((es, o) => {
    if (es[0].isIntersecting) { o.disconnect(); ponerFuente(); }
  }, { rootMargin: '200% 0px' }).observe(fig);

  /* Avisa a la música de si este clip está sonando de verdad, para que se
     aparte mientras dure (ver modules/musica.js). Sin importar musica.js
     desde aquí: un clip no tiene por qué saber que existe una canción. */
  const avisar = (activo) =>
    document.dispatchEvent(new CustomEvent('clip-sonido', { detail: { id: v.id, activo } }));

  new IntersectionObserver((es) => {
    const dentro = es[0].isIntersecting && es[0].intersectionRatio > .35;
    if (dentro) {
      ponerFuente();
      if (!menosMovimiento.matches || !el.muted) el.play().catch(() => {});
    } else {
      el.pause();
      // Se va de pantalla con el sonido puesto: la música vuelve a su sitio.
      if (v.sound) avisar(false);
    }
  }, { threshold: [0, .35, 1] }).observe(fig);

  if (v.sound) {
    el.addEventListener('play', () => { if (!el.muted) avisar(true); });
    el.addEventListener('pause', () => avisar(false));
  }

  el.addEventListener('loadeddata', () => fig.classList.add('esta-lista'), { once: true });

  const boton = fig.querySelector('.clip__son');
  if (boton) {
    boton.addEventListener('click', () => {
      el.muted = !el.muted;
      const activo = !el.muted;
      boton.setAttribute('aria-pressed', String(activo));
      boton.querySelector('.clip__son-txt').textContent =
        activo ? CAPITULOS.taysson.sonidoOff : CAPITULOS.taysson.sonido;
      if (activo) el.play().catch(() => {});
      avisar(activo && !el.paused);
    });
  }

  return fig;
}
