/* LA RÁFAGA — el detalle firma de la web (DESIGN.md § Signature detail).
 *
 * Una imagen no es una imagen: es los fotogramas reales que se dispararon
 * de ese mismo segundo. Late una vez al entrar en pantalla, se puede recorrer
 * con el dedo, y se queda en el elegido.
 *
 * Decisiones que importan:
 * - Los fotogramas se pintan en un <canvas>; cambiar 25 <img> a 10 fps provoca
 *   parpadeo en Safari iOS. Un canvas no.
 * - Nada se descarga hasta que el capítulo se acerca. La portada no arrastra
 *   el peso de toda la web.
 * - Con prefers-reduced-motion la ráfaga no se mueve: enseña el elegido y
 *   deja pasar los fotogramas sólo si ella arrastra.
 */

import { UI } from '../data/content.js';

const FPS = 11;
const menosMovimiento = matchMedia('(prefers-reduced-motion: reduce)');

/* Ejecuta cuando la página ya ha terminado de cargar y el hilo está libre.
   La portada está en pantalla desde el primer instante: si su ráfaga pidiera
   sus 25 fotogramas de golpe, Diana esperaría medio mega antes de ver la foto.
   Primero la foto elegida (va en el <img>, con prioridad alta); el latido llega
   un momento después — que además dramáticamente funciona mejor. */
function trasLaCarga(fn) {
  const luego = () => {
    const pedir = globalThis.requestIdleCallback || ((f) => setTimeout(f, 200));
    pedir(fn, { timeout: 3000 });
  };
  if (document.readyState === 'complete') luego();
  else addEventListener('load', luego, { once: true });
}

export class Burst {
  /** @param {HTMLElement} host  @param {object} momento  @param {object} opts */
  constructor(host, momento, opts = {}) {
    this.host = host;
    this.m = momento;
    this.opts = opts;
    this.frames = momento.frames;
    this.elegido = opts.elegido ?? momento.keepIndex;
    this.i = this.elegido;
    this.imgs = new Array(this.frames.length).fill(null);
    this.cargando = null;   // promesa de carga, memoizada
    this.listo = false;     // true cuando TODOS los fotogramas están decodificados
    this.corriendo = false;
    this.yaLatio = false;
    this.arrastrando = false;

    this.#montar();
    this.#observar();
  }

  #montar() {
    const { ratio, keep } = this.m;
    this.host.classList.add('rafaga');
    this.host.style.setProperty('--ratio', ratio);
    this.host.innerHTML = `
      <div class="rafaga__marco">
        <img class="rafaga__base" alt="" aria-hidden="true" src="${keep.lqip}">
        <canvas class="rafaga__lienzo" aria-hidden="true"></canvas>
        <img class="rafaga__quieta" alt="${this.opts.alt || ''}"
             src="${keep.fallback}"
             srcset="${keep.srcset.map(s => `${s.url} ${s.w}w`).join(', ')}"
             sizes="${this.opts.sizes || '(min-width: 1024px) 58vw, 100vw'}"
             width="${keep.w}" height="${keep.h}"
             decoding="async" fetchpriority="${this.opts.prioridad || 'auto'}"
             loading="${this.opts.prioridad === 'high' ? 'eager' : 'lazy'}">
        <div class="rafaga__raton" role="group" aria-label="${UI.rafagaEtiqueta(this.frames.length)}">
          ${this.frames.map((_, k) =>
            `<i class="rafaga__tick${k === this.elegido ? ' es-elegido' : ''}" data-k="${k}"></i>`).join('')}
        </div>
      </div>`;

    this.marco   = this.host.querySelector('.rafaga__marco');
    this.lienzo  = this.host.querySelector('.rafaga__lienzo');
    this.quieta  = this.host.querySelector('.rafaga__quieta');
    this.ticks   = [...this.host.querySelectorAll('.rafaga__tick')];
    this.ctx     = this.lienzo.getContext('2d', { alpha: false });

    if (this.frames.length < 2) this.host.classList.add('rafaga--unica');

    this.#gestos();
  }

  #observar() {
    // Precarga cuando el capítulo se acerca; late cuando de verdad se ve.
    //
    // Los fotogramas se piden en un hueco libre, nunca en la ruta crítica: la
    // portada está en pantalla desde el primer instante, y si su ráfaga tirase
    // de sus 25 fotogramas a la vez, Diana vería medio mega antes que la foto.
    // Primero la foto elegida (va en el <img>, con prioridad alta); el latido
    // llega un segundo después, que además dramáticamente funciona mejor.
    // Una foto suelta no tiene fotogramas que precargar: su <img> ya trae el
    // srcset bueno y el lienzo nunca llega a mandar. Pedir además el fotograma
    // de 420 px sería media descarga de más por cada foto de la galería.
    if (this.frames.length > 1) {
      new IntersectionObserver((es, o) => {
        if (!es[0].isIntersecting) return;
        o.disconnect();
        trasLaCarga(() => this.#cargar());
      }, { rootMargin: '250% 0px' }).observe(this.host);
    }

    new IntersectionObserver((es) => {
      const v = es[0];
      if (v.isIntersecting && v.intersectionRatio >= .55) {
        // Si los fotogramas aún no han llegado, latir() se reintenta solo
        // cuando terminen de cargar.
        if (!this.yaLatio && !menosMovimiento.matches) { this.yaLatio = true; this.latir(); }
      } else if (!this.arrastrando) {
        this.parar();
      }
    }, { threshold: [0, .55, 1] }).observe(this.host);
  }

  /** Memoiza la promesa: si se vuelve a pedir mientras carga, se espera a la
   *  misma, en vez de devolver una ya resuelta y hacer creer que está lista. */
  #cargar() {
    if (!this.cargando) this.cargando = this.#cargarAhora();
    return this.cargando;
  }

  async #cargarAhora() {
    const cargas = this.frames.map((f, k) => new Promise((res) => {
      const im = new Image();
      im.decoding = 'async';
      im.onload = () => { this.imgs[k] = im; res(); };
      im.onerror = () => res();
      im.src = f.url;
    }));
    // El elegido primero para que el lienzo pueda tomar el relevo cuanto antes.
    await cargas[this.elegido];
    this.#dimensionar();
    await Promise.all(cargas);
    this.listo = true;
    this.host.classList.add('esta-lista');

    // Si ella ya había elegido otro fotograma en una visita anterior, la <img>
    // nítida trae el mío: hay que dejar el lienzo delante para que mande el suyo.
    if (this.elegido !== this.m.keepIndex) {
      this.#pintar(this.elegido);
      this.host.classList.add('manda-ella');
    }
  }

  #dimensionar() {
    const im = this.imgs[this.elegido];
    if (!im) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const ancho = this.marco.clientWidth || 400;
    this.lienzo.width = Math.round(ancho * dpr);
    this.lienzo.height = Math.round((ancho / this.m.ratio) * dpr);
    this.lienzo.style.aspectRatio = String(this.m.ratio);
    this.#pintar(this.i);
  }

  #pintar(k) {
    const im = this.imgs[k];
    if (!im || !this.lienzo.width) return;
    this.ctx.drawImage(im, 0, 0, this.lienzo.width, this.lienzo.height);
    this.ticks.forEach((t, j) => t.classList.toggle('es-activo', j === k));
    this.i = k;
  }

  /** Un ciclo completo y se asienta en el elegido. */
  latir() {
    if (this.corriendo || this.frames.length < 2) return;
    if (!this.listo) { this.#cargar().then(() => { if (this.yaLatio) this.latir(); }); return; }
    this.corriendo = true;
    this.host.classList.add('esta-corriendo');

    const n = this.frames.length;
    let paso = 0;
    let ultimo = 0;
    const intervalo = 1000 / FPS;

    const tic = (t) => {
      if (!this.corriendo) return;
      if (t - ultimo >= intervalo) {
        ultimo = t;
        this.#pintar(paso % n);
        paso++;
        if (paso > n) { this.#asentar(); return; }
      }
      this.raf = requestAnimationFrame(tic);
    };
    this.raf = requestAnimationFrame(tic);
  }

  #asentar() {
    this.corriendo = false;
    cancelAnimationFrame(this.raf);
    this.#pintar(this.elegido);
    this.host.classList.remove('esta-corriendo');
  }

  parar() {
    if (!this.corriendo) return;
    this.corriendo = false;
    cancelAnimationFrame(this.raf);
    this.#pintar(this.elegido);
    this.host.classList.remove('esta-corriendo');
  }

  /** Cambia el fotograma que se queda (juego "La ráfaga correcta"). */
  elegir(k) {
    this.elegido = Math.max(0, Math.min(this.frames.length - 1, k));
    this.ticks.forEach((t, j) => t.classList.toggle('es-elegido', j === this.elegido));
    this.#cargar().then(() => {
      this.#pintar(this.elegido);
      // El lienzo pasa a mandar para siempre: la <img> nítida sigue sirviendo
      // el fotograma que elegí yo, y el que manda ahora es el suyo.
      this.host.classList.add('manda-ella');
    });
  }

  #gestos() {
    let x0 = null, movido = false;

    const desde = (clientX) => {
      const r = this.marco.getBoundingClientRect();
      const p = (clientX - r.left) / r.width;
      return Math.round(Math.max(0, Math.min(1, p)) * (this.frames.length - 1));
    };

    this.marco.addEventListener('pointerdown', (e) => {
      if (this.frames.length < 2) return;
      this.arrastrando = true; movido = false; x0 = e.clientX;
      this.parar();
      this.marco.setPointerCapture(e.pointerId);
      this.host.classList.add('esta-recorriendo');
    });

    this.marco.addEventListener('pointermove', (e) => {
      if (!this.arrastrando) return;
      if (Math.abs(e.clientX - x0) > 6) movido = true;
      if (movido) { e.preventDefault(); this.#pintar(desde(e.clientX)); }
    });

    const soltar = () => {
      if (!this.arrastrando) return;
      this.arrastrando = false;
      this.host.classList.remove('esta-recorriendo');
      // Un toque sin arrastre = "vuelve a latir".
      if (!movido && !menosMovimiento.matches) this.latir();
      else this.#pintar(this.elegido);
    };
    this.marco.addEventListener('pointerup', soltar);
    this.marco.addEventListener('pointercancel', soltar);

    addEventListener('resize', () => this.#dimensionar(), { passive: true });
  }
}

export function montarRafagas(raiz, medios, elegidas = {}) {
  const mapa = new Map(medios.momentos.map((m) => [m.id, m]));
  const vivas = new Map();
  raiz.querySelectorAll('[data-rafaga]').forEach((el) => {
    const m = mapa.get(el.dataset.rafaga);
    // Si la curación ya no lo incluye (o lo excluyó), el hueco tampoco se
    // dibuja: nada de marcos vacíos, ni de pies huérfanos, ni de huecos en la
    // rejilla. Se lleva por delante el <figure> entero si se queda sin foto.
    if (!m) {
      const fig = el.closest('figure');
      el.remove();
      if (fig && !fig.querySelector('[data-rafaga], [data-video], img, video')) fig.remove();
      return;
    }
    vivas.set(m.id, new Burst(el, m, {
      alt: el.dataset.alt || '',
      sizes: el.dataset.sizes,
      prioridad: el.dataset.prioridad,
      elegido: elegidas[m.id],
    }));
  });
  return vivas;
}
