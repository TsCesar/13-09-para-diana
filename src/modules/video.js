/* Vídeo. Se comporta como una foto que respira: silencioso, en bucle,
 * y sólo se reproduce mientras se ve. Un clip lleva sonido y lo activa ella.
 *
 * El autoplay es un favor del navegador, no un derecho: Safari lo niega en
 * modo de bajo consumo, con «Reducir movimiento» se deja de pedir, y un play()
 * puede fallar por red. Por eso cada clip lleva un ▶ real encima del poster que
 * aparece en cuanto el clip está a la vista y no se mueve, y que llama a
 * play() dentro del propio toque —en iOS, si hay un await por medio, el gesto
 * ya no cuenta. */

import { CAPITULOS } from '../data/content.js';

const menosMovimiento = matchMedia('(prefers-reduced-motion: reduce)');

// Lo que se le da al autoplay antes de ofrecer el ▶. Corto: si en dos segundos
// a la vista no se ha movido, es que no se va a mover solo.
const PACIENCIA = 2000;

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
      <video class="clip__v" playsinline webkit-playsinline muted loop preload="none"
             width="900" height="${Math.round(900 / v.ratio)}"></video>
      <button class="clip__play" type="button" aria-label="Reproducir vídeo" hidden>
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5.5v13l10.5-6.5z"/></svg>
      </button>
      ${v.sound ? `<button class="clip__son" type="button" aria-pressed="false">
                     <span class="clip__son-txt">${CAPITULOS.taysson.sonido}</span>
                   </button>` : ''}
    </div>
    ${pie ? `<figcaption class="pie">${pie}</figcaption>` : ''}`;

  const el = fig.querySelector('.clip__v');
  const play = fig.querySelector('.clip__play');

  /* El atributo muted del HTML no siempre llega a la propiedad (depende de
     cómo se creó el elemento), e iOS sólo deja arrancar solo lo que está
     silenciado DE VERDAD. Se fija también por propiedad. */
  el.muted = true;
  el.defaultMuted = true;
  el.playsInline = true;

  let fuenteLista = false;
  let dentro = false;
  // Si ella lo arrancó a mano, «Reducir movimiento» ya no lo vuelve a parar al
  // regresar: lo pidió.
  let aMano = false;
  let espera = 0;

  const mostrarPlay = (si) => { play.hidden = !si; };

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

  /* Arranque a mano. Todo síncrono dentro del gesto: fuente, load() si el
     elemento se quedó en error, y play() inmediatamente. El ▶ no se esconde
     aquí sino en `playing`: si play() falla, sigue ahí para volver a tocarlo. */
  const reproducirAMano = () => {
    aMano = true;
    clearTimeout(espera);
    ponerFuente();
    if (el.error) el.load();
    let intento;
    try {
      intento = el.play();
    } catch (err) {
      console.error(`[clip ${v.id}] play() a mano falló:`, err);
      mostrarPlay(true);
      return;
    }
    if (intento && intento.catch) {
      intento.catch((err) => {
        console.error(`[clip ${v.id}] play() a mano falló:`, err.name, err.message);
        mostrarPlay(true);
      });
    }
  };

  const intentarSolo = () => {
    ponerFuente();
    clearTimeout(espera);
    // «Reducir movimiento» apaga el autoplay, nunca el ▶.
    if (menosMovimiento.matches && el.muted && !aMano) { mostrarPlay(true); return; }
    if (!el.paused) return;
    const intento = el.play();
    if (intento && intento.catch) {
      intento.catch((err) => {
        // Pausado por salir de pantalla antes de arrancar: no es un fallo.
        if (!dentro && err.name === 'AbortError') {
          console.debug(`[clip ${v.id}] autoplay interrumpido al salir de pantalla`);
          return;
        }
        console.warn(`[clip ${v.id}] autoplay bloqueado:`, err.name, err.message);
        if (dentro) mostrarPlay(true);
      });
    }
    espera = setTimeout(() => { if (dentro && el.paused) mostrarPlay(true); }, PACIENCIA);
  };

  new IntersectionObserver((es) => {
    const ahora = es[0].isIntersecting && es[0].intersectionRatio > .35;
    if (ahora === dentro) return;
    dentro = ahora;
    if (dentro) {
      intentarSolo();
    } else {
      clearTimeout(espera);
      el.pause();
      // Se va de pantalla con el sonido puesto: la música vuelve a su sitio.
      if (v.sound) avisar(false);
    }
  }, { threshold: [0, .35, 1] }).observe(fig);

  play.addEventListener('click', reproducirAMano);

  el.addEventListener('playing', () => {
    clearTimeout(espera);
    mostrarPlay(false);
    fig.classList.add('esta-lista');
  });
  /* Pausa que no ha pedido nadie con el clip a la vista. WebKit la emite al
     dar la vuelta del bucle y se queda parado; iOS, al entrar en bajo consumo
     o con una llamada. Se reintenta una vez y, si no le dejan, vuelve el ▶.
     El tope de tiempo evita un tira y afloja si algo lo para en cada vuelta. */
  let reintento = -Infinity;
  el.addEventListener('pause', () => {
    if (!dentro) return;
    const puedeSolo = !menosMovimiento.matches || !el.muted || aMano;
    if (!puedeSolo || performance.now() - reintento < 500) { mostrarPlay(true); return; }
    reintento = performance.now();
    const intento = el.play();
    if (intento && intento.catch) {
      intento.catch((err) => {
        console.warn(`[clip ${v.id}] no se pudo reanudar:`, err.name, err.message);
        mostrarPlay(true);
      });
    }
  });
  el.addEventListener('error', () => {
    console.error(`[clip ${v.id}] error de vídeo:`, el.error && el.error.code, el.error && el.error.message);
    mostrarPlay(true);
  });

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
      // Con el clip parado, el mismo toque que da el sonido lo arranca.
      if (activo) reproducirAMano();
      avisar(activo && !el.paused);
    });
  }

  return fig;
}
