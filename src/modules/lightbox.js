/* Ver una foto más grande.
 *
 * Va montado sobre el mosaico de post-créditos —«las que no entraron»—, que
 * es el único sitio de la web donde hay fotos pequeñas y ningún gesto propio
 * que estorbe. Deliberadamente NO se monta sobre las ráfagas: ahí el dedo ya
 * sirve para recorrer los fotogramas, y robarle el toque rompería el gesto
 * que sostiene toda la web.
 *
 * Los fotogramas del mosaico son de 420px: se enseñan a su tamaño real, sin
 * estirarlos. Enseñar una foto de 420 a pantalla completa es enseñarla peor.
 */

import { UI } from '../data/content.js';

export function montarLightbox(zona) {
  let capa = null, img = null, cuenta = null, i = 0, fotos = [], volverA = null;

  const construir = () => {
    capa = document.createElement('div');
    capa.className = 'lupa';
    capa.setAttribute('role', 'dialog');
    capa.setAttribute('aria-modal', 'true');
    capa.hidden = true;
    capa.innerHTML = `
      <button class="lupa__cerrar" type="button" aria-label="${UI.cerrar}">&times;</button>
      <button class="lupa__paso lupa__paso--antes" type="button" aria-label="${UI.anterior}">&#8249;</button>
      <figure class="lupa__hueco"><img class="lupa__img" alt=""></figure>
      <button class="lupa__paso lupa__paso--luego" type="button" aria-label="${UI.siguiente}">&#8250;</button>
      <p class="lupa__cuenta" role="status" aria-live="polite"></p>`;
    document.body.append(capa);
    img = capa.querySelector('.lupa__img');
    cuenta = capa.querySelector('.lupa__cuenta');

    capa.querySelector('.lupa__cerrar').addEventListener('click', cerrar);
    capa.querySelector('.lupa__paso--antes').addEventListener('click', () => mover(-1));
    capa.querySelector('.lupa__paso--luego').addEventListener('click', () => mover(1));
    // El fondo cierra; la foto no.
    capa.addEventListener('click', (e) => { if (e.target === capa) cerrar(); });

    // Swipe. Umbral generoso: en un móvil en la mano, un deslizamiento
    // "recto" se desvía 20 o 30 px sin que nadie se dé cuenta.
    let x0 = null, y0 = null;
    capa.addEventListener('pointerdown', (e) => { x0 = e.clientX; y0 = e.clientY; });
    capa.addEventListener('pointerup', (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0, dy = e.clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) mover(dx < 0 ? 1 : -1);
    });
  };

  // Se precargan la anterior y la siguiente: al pasar, ya están decodificadas.
  const precargar = (k) => {
    for (const j of [k - 1, k + 1]) {
      if (j < 0 || j >= fotos.length) continue;
      const im = new Image();
      im.decoding = 'async';
      im.src = fotos[j].src;
    }
  };

  const pintar = () => {
    const f = fotos[i];
    img.src = f.src;
    img.width = f.w || 420;
    cuenta.textContent = UI.deN(i + 1, fotos.length);
    capa.querySelector('.lupa__paso--antes').disabled = i === 0;
    capa.querySelector('.lupa__paso--luego').disabled = i === fotos.length - 1;
    precargar(i);
  };

  const mover = (d) => {
    const k = i + d;
    if (k < 0 || k >= fotos.length) return;
    i = k;
    pintar();
  };

  const teclas = (e) => {
    if (e.key === 'Escape') { cerrar(); return; }
    if (e.key === 'ArrowRight') { mover(1); return; }
    if (e.key === 'ArrowLeft') { mover(-1); return; }
    if (e.key !== 'Tab') return;
    // Trampa de foco: dentro del diálogo y sin salirse a la página de detrás.
    const focos = [...capa.querySelectorAll('button:not([disabled])')];
    if (!focos.length) return;
    const [primero, ultimo] = [focos[0], focos[focos.length - 1]];
    if (e.shiftKey && document.activeElement === primero) { e.preventDefault(); ultimo.focus(); }
    else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primero.focus(); }
  };

  function abrir(lista, k, origen) {
    if (!capa) construir();
    fotos = lista; i = k; volverA = origen;
    capa.hidden = false;
    document.documentElement.classList.add('esta-bloqueado');
    pintar();
    addEventListener('keydown', teclas);
    capa.querySelector('.lupa__cerrar').focus();
  }

  function cerrar() {
    if (!capa || capa.hidden) return;
    capa.hidden = true;
    document.documentElement.classList.remove('esta-bloqueado');
    removeEventListener('keydown', teclas);
    volverA?.focus?.();   // el foco vuelve a la miniatura desde la que salió
  }

  // Delegado: el mosaico se construye tarde (IntersectionObserver) y puede
  // crecer. Un solo listener en la zona vale para las 250 teselas.
  zona.addEventListener('click', (e) => {
    const teja = e.target.closest('.post__teja');
    if (!teja) return;
    const tejas = [...zona.querySelectorAll('.post__teja')];
    abrir(tejas.map((t) => ({ src: t.currentSrc || t.src, w: t.naturalWidth })),
          tejas.indexOf(teja), teja);
  });

  return { abrir, cerrar };
}
