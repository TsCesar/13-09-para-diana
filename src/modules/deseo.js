/* Pedir un deseo.
 *
 * Una vela, no una tarta de clipart: una línea de cera, una llama que se
 * mueve sola y se apaga cuando ella la toca, un momento de negro y el
 * confeti. Sin micrófono — pedirle permiso al micro en mitad de un regalo
 * es lo menos romántico que existe.
 *
 * El confeti son cuarenta líneas de canvas en vez de una dependencia:
 * sólo se usa aquí, una vez, y con los colores de la casa.
 */

import { DESEO } from '../data/content.js';

const menos = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function confeti(lienzo, alAcabar) {
  const ctx = lienzo.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const W = lienzo.width = innerWidth * dpr;
  const H = lienzo.height = innerHeight * dpr;
  const COLORES = ['#FFC400', '#EFE7DA', '#9C8F7F', '#F2EDE3'];

  const trozos = Array.from({ length: 90 }, () => ({
    x: W * (.2 + Math.random() * .6),
    y: H * .45 + Math.random() * 40,
    vx: (Math.random() - .5) * 9 * dpr,
    vy: (-9 - Math.random() * 9) * dpr,
    w: (4 + Math.random() * 5) * dpr,
    h: (7 + Math.random() * 9) * dpr,
    giro: Math.random() * Math.PI,
    dg: (Math.random() - .5) * .22,
    c: COLORES[(Math.random() * COLORES.length) | 0],
  }));

  let vivos = trozos.length, t0 = null;
  const paso = (t) => {
    if (t0 === null) t0 = t;
    ctx.clearRect(0, 0, W, H);
    vivos = 0;
    for (const p of trozos) {
      p.vy += .34 * dpr;       // gravedad
      p.vx *= .995;
      p.x += p.vx; p.y += p.vy; p.giro += p.dg;
      if (p.y < H + 40 * dpr) vivos++;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.giro);
      ctx.fillStyle = p.c;
      ctx.globalAlpha = Math.max(0, 1 - (t - t0) / 4200);
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (vivos && t - t0 < 4200) requestAnimationFrame(paso);
    else { ctx.clearRect(0, 0, W, H); alAcabar?.(); }
  };
  requestAnimationFrame(paso);
}

export function montarDeseo(boton) {
  if (!boton) return;

  let capa = null;

  const construir = () => {
    capa = document.createElement('div');
    capa.className = 'deseo';
    capa.setAttribute('role', 'dialog');
    capa.setAttribute('aria-modal', 'true');
    capa.setAttribute('aria-label', DESEO.boton);
    capa.hidden = true;
    capa.innerHTML = `
      <canvas class="deseo__confeti" aria-hidden="true"></canvas>
      <p class="deseo__paso" role="status" aria-live="polite"></p>
      <button class="deseo__vela" type="button" aria-label="${DESEO.ayuda}">
        <span class="deseo__llama" aria-hidden="true"></span>
        <span class="deseo__cera" aria-hidden="true"></span>
      </button>
      <span class="deseo__ayuda" aria-hidden="true">${DESEO.ayuda}</span>
      <p class="deseo__final">${DESEO.cumplido}</p>
      <button class="boton boton--tenue deseo__cerrar" type="button">${DESEO.cerrar}</button>`;
    document.body.append(capa);

    capa.querySelector('.deseo__vela').addEventListener('click', soplar);
    capa.querySelector('.deseo__cerrar').addEventListener('click', cerrar);
  };

  const teclas = (e) => {
    if (e.key === 'Escape') { cerrar(); return; }
    if (e.key !== 'Tab') return;
    const focos = [...capa.querySelectorAll('button:not([hidden])')].filter((b) => b.offsetParent !== null);
    if (focos.length < 2) return;
    const [a, z] = [focos[0], focos[focos.length - 1]];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  };

  let pasos = null;

  function abrir() {
    if (!capa) construir();
    capa.hidden = false;
    capa.classList.remove('esta-soplada', 'esta-hecho');
    document.documentElement.classList.add('esta-bloqueado');
    addEventListener('keydown', teclas);

    const p = capa.querySelector('.deseo__paso');
    const vela = capa.querySelector('.deseo__vela');
    vela.disabled = true;

    // Los tres textos, con silencio entre ellos. Con reduced-motion salen
    // los tres seguidos y se puede soplar desde el principio.
    clearTimeout(pasos);
    if (menos()) {
      p.textContent = DESEO.pasos[DESEO.pasos.length - 1];
      vela.disabled = false;
      vela.focus();
    } else {
      let k = 0;
      const siguiente = () => {
        p.textContent = DESEO.pasos[k];
        p.classList.remove('es-visible');
        requestAnimationFrame(() => p.classList.add('es-visible'));
        if (++k < DESEO.pasos.length) pasos = setTimeout(siguiente, 1900);
        else { vela.disabled = false; capa.classList.add('esta-lista'); vela.focus(); }
      };
      siguiente();
    }
  }

  function soplar() {
    if (capa.classList.contains('esta-soplada')) return;
    capa.classList.add('esta-soplada');
    capa.querySelector('.deseo__vela').disabled = true;

    const rematar = () => {
      capa.classList.add('esta-hecho');
      capa.querySelector('.deseo__cerrar').focus();
    };
    // Un momento de negro entre el soplido y el confeti: sin esa pausa,
    // el confeti pisa el gesto y no se lee como consecuencia suya.
    if (menos()) { rematar(); return; }
    setTimeout(() => { confeti(capa.querySelector('.deseo__confeti')); rematar(); }, 900);
  }

  function cerrar() {
    if (!capa || capa.hidden) return;
    clearTimeout(pasos);
    capa.hidden = true;
    document.documentElement.classList.remove('esta-bloqueado');
    removeEventListener('keydown', teclas);
    boton.focus();
  }

  boton.addEventListener('click', abrir);
}
