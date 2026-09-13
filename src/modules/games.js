/* Los dos juegos. Ninguno es un juego genérico metido para rellenar:
 * los dos sólo funcionan porque el archivo es como es.
 *
 * 1. La ráfaga correcta — ella decide qué fotograma se queda, y la web
 *    se lo queda de verdad. Termina de hacer el regalo.
 * 2. ¿Cuántas hiciste? — adivinar cuántas fotos hay de cada sitio.
 *    Las cifras son reales, contadas del archivo.                        */

import { JUEGOS } from '../data/content.js';
import { Burst } from './burst.js';

const LLAVE = 'diana-1309-elegidas';

export const leerElegidas = () => {
  try { return JSON.parse(localStorage.getItem(LLAVE)) || {}; }
  catch { return {}; }
};
const guardar = (o) => { try { localStorage.setItem(LLAVE, JSON.stringify(o)); } catch {} };

/* ── 1. La ráfaga correcta ───────────────────────────────── */

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

/* ── 2. ¿Cuántas crees que hice? ─────────────────────────── */

export function juegoCuantas(host) {
  const j = JUEGOS.cuantas;
  let idx = 0;
  let respondida = false;

  host.innerHTML = `
    <h3 class="juego__titulo">${j.titulo}</h3>
    <p class="juego__intro">${j.intro}</p>
    <div class="cuantas">
      <p class="cuantas__preg"></p>
      <output class="cuantas__cifra"></output>
      <input class="cuantas__mando" type="range" min="1" value="10" step="1" aria-label="">
      <div class="cuantas__acc">
        <button class="boton" type="button" data-accion></button>
      </div>
      <p class="cuantas__fallo" role="status" aria-live="polite"></p>
      <div class="cuantas__marcas" aria-hidden="true"></div>
    </div>
    <p class="cuantas__cierre" hidden>${j.cierre.replace(/\n/g, '<br>')}</p>`;

  const preg   = host.querySelector('.cuantas__preg');
  const cifra  = host.querySelector('.cuantas__cifra');
  const mando  = host.querySelector('.cuantas__mando');
  const accion = host.querySelector('[data-accion]');
  const fallo  = host.querySelector('.cuantas__fallo');
  const marcas = host.querySelector('.cuantas__marcas');
  const cierre = host.querySelector('.cuantas__cierre');

  const pintarMarcas = () => {
    marcas.innerHTML = j.preguntas
      .map((_, k) => `<i class="${k < idx ? 'es-hecha' : k === idx ? 'es-activa' : ''}"></i>`).join('');
  };

  const cargar = () => {
    const q = j.preguntas[idx];
    respondida = false;
    preg.textContent = q.pregunta;
    mando.max = q.max;
    mando.value = Math.round(q.max / 4);
    mando.setAttribute('aria-label', q.pregunta);
    mando.disabled = false;
    cifra.textContent = mando.value;
    cifra.classList.remove('es-real');
    fallo.textContent = '';
    accion.textContent = j.comprobar;
    pintarMarcas();
  };

  mando.addEventListener('input', () => {
    if (respondida) return;
    cifra.textContent = mando.value;
  });

  accion.addEventListener('click', () => {
    const q = j.preguntas[idx];
    if (!respondida) {
      respondida = true;
      mando.disabled = true;
      const dicho = +mando.value;
      const d = Math.abs(dicho - q.real);
      const margen = Math.max(2, Math.round(q.real * 0.12));
      const plantilla = d === 0 ? j.exacto : d <= margen ? j.cerca : dicho < q.real ? j.corto : j.lejos;
      fallo.textContent = plantilla.replace('{n}', `${q.real} ${q.unidad}`);
      cifra.textContent = q.real;
      cifra.classList.add('es-real');
      accion.textContent = idx < j.preguntas.length - 1 ? j.siguiente : '';
      accion.hidden = idx >= j.preguntas.length - 1;
      if (idx >= j.preguntas.length - 1) { cierre.hidden = false; pintarMarcasFinal(); }
    } else {
      idx++;
      cargar();
    }
  });

  const pintarMarcasFinal = () => {
    marcas.innerHTML = j.preguntas.map(() => `<i class="es-hecha"></i>`).join('');
  };

  cargar();
}
