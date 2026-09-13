/* El juego que no es un juego genérico metido para rellenar: sólo funciona
 * porque las fotos son las que son. Ella decide qué foto se queda de cada
 * momento, y lo que ve a partir de ahí se lo queda de verdad.
 * Es lo que termina de hacer el regalo.                                   */

import { JUEGOS } from '../data/content.js';
import { Burst } from './burst.js';

const LLAVE = 'diana-1309-elegidas';

export const leerElegidas = () => {
  try { return JSON.parse(localStorage.getItem(LLAVE)) || {}; }
  catch { return {}; }
};
const guardar = (o) => { try { localStorage.setItem(LLAVE, JSON.stringify(o)); } catch {} };

/* ── Tú eliges ───────────────────────────────────────────── */

export function juegoEleccion(host, medios, rafagasVivas) {
  const { eleccion } = JUEGOS;
  const mapa = new Map(medios.momentos.map((m) => [m.id, m]));
  const elegidas = leerElegidas();

  host.innerHTML = `
    <h3 class="juego__titulo">${eleccion.titulo}</h3>
    <p class="juego__intro">${eleccion.intro.replace(/\n/g, '<br>')}</p>
    <div class="eleccion"></div>
    <p class="juego__estado" role="status" aria-live="polite"></p>
    <button class="boton boton--tenue" type="button" data-reset hidden>${eleccion.reset}</button>`;

  const zona = host.querySelector('.eleccion');
  const estado = host.querySelector('.juego__estado');
  const reset = host.querySelector('[data-reset]');

  const refrescarReset = () => { reset.hidden = !Object.keys(leerElegidas()).length; };

  JUEGOS_RAFAGAS_SEGURAS(medios).forEach((id) => {
    const m = mapa.get(id);
    const fila = document.createElement('div');
    fila.className = 'eleccion__fila';
    fila.innerHTML = `
      <div class="eleccion__vista" data-vista></div>
      <div class="eleccion__tiras" role="radiogroup" aria-label="${eleccion.pista}"></div>`;
    zona.append(fila);

    const vista = fila.querySelector('[data-vista]');
    const tiras = fila.querySelector('.eleccion__tiras');
    const b = new Burst(vista, m, { alt: '', sizes: '(min-width: 1024px) 40vw, 88vw' });

    m.frames.forEach((f, k) => {
      const t = document.createElement('button');
      t.type = 'button';
      t.className = 'tira';
      t.setAttribute('role', 'radio');
      t.setAttribute('aria-checked', String(k === (elegidas[m.id] ?? m.keepIndex)));
      // Sin loading="lazy" a propósito: son las mismas URLs que la ráfaga de al
      // lado ya precarga, así que no cuestan un byte más, y evita que la tira
      // aparezca con huecos vacíos justo donde ella tiene que elegir.
      t.innerHTML = `<img src="${f.url}" alt="" decoding="async">`;
      t.addEventListener('click', () => {
        const guardadas = leerElegidas();
        guardadas[m.id] = k;
        guardar(guardadas);
        b.elegir(k);
        rafagasVivas.get(m.id)?.elegir(k);
        [...tiras.children].forEach((c, j) => c.setAttribute('aria-checked', String(j === k)));
        estado.textContent = eleccion.hecho;
        refrescarReset();
      });
      tiras.append(t);
    });

    // Deja la tira elegida a la vista sin arrastrar la página.
    requestAnimationFrame(() => {
      const act = tiras.children[elegidas[m.id] ?? m.keepIndex];
      if (act) tiras.scrollLeft = act.offsetLeft - tiras.clientWidth / 2 + act.clientWidth / 2;
    });
  });

  reset.addEventListener('click', () => {
    guardar({});
    estado.textContent = '';
    zona.querySelectorAll('.eleccion__fila').forEach((fila, idx) => {
      const id = JUEGOS_RAFAGAS_SEGURAS(medios)[idx];
      const m = mapa.get(id);
      const tiras = fila.querySelector('.eleccion__tiras');
      [...tiras.children].forEach((c, j) => c.setAttribute('aria-checked', String(j === m.keepIndex)));
      rafagasVivas.get(id)?.elegir(m.keepIndex);
    });
    location.reload();
  });

  refrescarReset();
}

// Sólo ofrece ráfagas que existan de verdad y tengan de dónde elegir.
function JUEGOS_RAFAGAS_SEGURAS(medios) {
  const validos = new Set(medios.momentos.filter((m) => m.frames.length >= 4).map((m) => m.id));
  return JUEGOS.eleccion.rafagas?.filter((id) => validos.has(id))
      ?? ['ramo', 'gimnasio', 'graduacion'].filter((id) => validos.has(id));
}
