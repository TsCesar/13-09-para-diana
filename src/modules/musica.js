/* Música. Preparada, sin poner.
 *
 * Mientras MUSICA.archivo sea null no se monta absolutamente nada: ni
 * control, ni pregunta, ni hueco. En cuanto haya un archivo en public/audio
 * y se escriba su nombre en content.js, aparece solo.
 *
 * Nunca suena sin que ella lo pida: no hay autoplay, ni siquiera silenciado.
 * Y si el archivo no carga, el control se retira en vez de quedarse muerto.
 */

import { MUSICA } from '../data/content.js';
import { ruta } from './rutas.js';

const LLAVE = 'diana-1309-musica';

// Volumen de fondo. Bajo a propósito: acompaña, no tapa.
const VOL = 0.55;
// Mientras un clip suena, la música se aparta. No se silencia del todo: que
// desaparezca se nota más que que baje.
const VOL_AGACHADA = 0.10;

const menosMovimiento = matchMedia('(prefers-reduced-motion: reduce)');

export function montarMusica() {
  if (!MUSICA.archivo) return null;

  // En content.js la ruta se escribe tal cual está en public/ («audio/x.mp3»);
  // el prefijo de publicación lo pone `ruta()`, no César.
  const audio = new Audio(ruta(MUSICA.archivo));
  audio.loop = true;
  audio.preload = 'none';
  audio.volume = VOL;

  /* Rampa de volumen. Entrar de golpe a 0,55 en un regalo que ella acaba de
     abrir suena a interruptor; la salida de un clip con sonido, igual.
     Con prefers-reduced-motion se salta la rampa y se pone el valor. */
  let rampa = null;
  const llevarA = (destino, ms = 600) => {
    clearInterval(rampa);
    if (menosMovimiento.matches || ms <= 0) { audio.volume = destino; return; }
    const desde = audio.volume;
    const t0 = performance.now();
    rampa = setInterval(() => {
      const t = Math.min(1, (performance.now() - t0) / ms);
      audio.volume = Math.max(0, Math.min(1, desde + (destino - desde) * t));
      if (t === 1) clearInterval(rampa);
    }, 40);
  };

  let agachada = false;
  const agachar = (si) => {
    if (si === agachada) return;
    agachada = si;
    llevarA(si ? VOL_AGACHADA : VOL, si ? 300 : 800);
  };

  /* Ducking. Los clips avisan por un evento cuando su sonido se enciende o se
     apaga (ver modules/video.js): sin acoplar los dos módulos, y funciona
     igual si algún día hay más de un clip con audio. */
  const sonando = new Set();
  document.addEventListener('clip-sonido', (e) => {
    const { id, activo } = e.detail;
    if (activo) sonando.add(id); else sonando.delete(id);
    agachar(sonando.size > 0);
  });

  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'musica';
  boton.setAttribute('aria-pressed', 'false');
  boton.innerHTML = `<span class="musica__onda" aria-hidden="true"><i></i><i></i><i></i></span>
    <span class="musica__txt">${MUSICA.poner}</span>`;
  document.body.append(boton);

  audio.addEventListener('error', () => boton.remove(), { once: true });

  const pintar = (sonando) => {
    boton.classList.toggle('esta-sonando', sonando);
    boton.setAttribute('aria-pressed', String(sonando));
    boton.querySelector('.musica__txt').textContent = sonando ? MUSICA.quitar : MUSICA.poner;
    try { sessionStorage.setItem(LLAVE, sonando ? '1' : '0'); } catch {}
  };

  // Arranca desde silencio y sube. Al pausar no hace falta rampa: pausar es
  // una decisión suya y el silencio inmediato es la respuesta correcta.
  const arrancar = () => {
    audio.volume = 0;
    return audio.play().then(() => {
      llevarA(agachada ? VOL_AGACHADA : VOL, 900);
      pintar(true);
    });
  };

  boton.addEventListener('click', () => {
    if (audio.paused) arrancar().catch(() => boton.remove());
    else { clearInterval(rampa); audio.pause(); pintar(false); }
  });

  return { audio, boton, preguntar };

  /* Se puede llamar después del acceso: «¿Con música?» con dos botones.
     Sin gesto previo ningún navegador deja sonar nada, así que la pregunta
     es también lo que hace que funcione. */
  function preguntar(host) {
    if (!host || document.querySelector('.musica__preg')) return;
    // «Antes de empezar» sólo tiene sentido al empezar. Si recarga a mitad de
    // la web (la sesión ya está abierta y el navegador le devuelve su sitio),
    // no se le pregunta nada: para eso está el botón de la esquina.
    if (scrollY > innerHeight * 0.9) return;

    const caja = document.createElement('div');
    caja.className = 'musica__preg';
    caja.innerHTML = `<p>${MUSICA.pregunta}</p>
      <button class="boton" type="button" data-si>${MUSICA.si}</button>
      <button class="boton boton--tenue" type="button" data-no>${MUSICA.no}</button>`;
    host.append(caja);

    // Mientras está la pregunta, el botón flotante sobra: son el mismo control
    // dicho dos veces y se pisan en la esquina.
    boton.hidden = true;

    const cerrar = () => {
      removeEventListener('scroll', alBajar);
      caja.remove();
      boton.hidden = false;
    };

    /* Si se pone a bajar sin contestar, ya ha contestado. La caja va fija: sin
       esto la arrastraría por toda la web —encima de las fotos y de la carta—
       hasta que tocase uno de los dos botones. Al quitarse vuelve el control
       de la esquina, así que puede poner la música cuando quiera. */
    function alBajar() { if (scrollY > innerHeight * 0.9) cerrar(); }
    addEventListener('scroll', alBajar, { passive: true });

    caja.querySelector('[data-si]').addEventListener('click', () => {
      arrancar().catch(() => {});
      cerrar();
    });
    caja.querySelector('[data-no]').addEventListener('click', cerrar);
  }
}
