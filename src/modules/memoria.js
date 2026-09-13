/* Tercer juego: seis caras, dos veces cada una.
 *
 * Las cartas no son iconos: son los seis fotogramas elegidos de seis ráfagas
 * distintas, los mismos que manda la web. Así el juego sigue siendo del
 * archivo y no un memory genérico con corazones.
 *
 * Se cuentan intentos, no segundos. Y se puede saltar.
 */

import { JUEGOS } from '../data/content.js';

const PAREJAS = 6;

export function juegoMemoria(host, medios) {
  const j = JUEGOS.memoria;

  // Seis momentos distintos y reconocibles. Los marca `memoria` en
  // scripts/curation.mjs: elegidos a mano para que las seis teselas se
  // distingan entre sí de un vistazo (pasillo, gimnasio, césped, arco, primer
  // plano, la mesa). Si algún día no hubiera marcados, se reparten solos.
  const marcados = medios.momentos.filter((m) => m.memoria && m.keep?.srcset?.length);
  const candidatos = marcados.length >= PAREJAS
    ? marcados
    : medios.momentos.filter((m) => m.keep?.srcset?.length);
  if (candidatos.length < PAREJAS) { host.remove(); return; }
  const salto = Math.max(1, Math.floor(candidatos.length / PAREJAS));
  const caras = Array.from({ length: PAREJAS }, (_, k) => candidatos[(k * salto) % candidatos.length])
    .filter((m, k, a) => a.indexOf(m) === k);
  while (caras.length < PAREJAS) {
    const falta = candidatos.find((m) => !caras.includes(m));
    if (!falta) break;
    caras.push(falta);
  }

  const imagenDe = (m) => {
    return m.frames[m.keepIndex]?.url || m.keep.srcset[0].url;
  };

  host.innerHTML = `
    <h2 class="juego__titulo">${j.titulo}</h2>
    <p class="juego__intro">${j.intro}</p>
    <div class="memoria" role="group" aria-label="${j.titulo}"></div>
    <p class="juego__estado" role="status" aria-live="polite"></p>
    <div class="memoria__acc">
      <button class="boton boton--tenue" type="button" data-saltar>${j.saltar}</button>
      <button class="boton boton--tenue" type="button" data-otra hidden>${j.otra}</button>
    </div>`;

  const tablero = host.querySelector('.memoria');
  const estado = host.querySelector('.juego__estado');
  const otra = host.querySelector('[data-otra]');
  const saltar = host.querySelector('[data-saltar]');

  let primera = null, bloqueado = false, intentos = 0, resueltas = 0;

  const repartir = () => {
    // Orden fijo, no aleatorio: el mismo barajado para las dos visitas, que
    // es coherente con el resto de la web (nada aquí depende del azar).
    const mazo = [...caras, ...caras].map((m, k) => ({ m, k }));
    const orden = [5, 0, 9, 3, 11, 6, 1, 8, 4, 10, 2, 7];
    tablero.innerHTML = '';
    // Las doce de una vez: doce `append` seguidos son doce recálculos de
    // rejilla, y además dejan el tablero medio puesto a la vista.
    const frag = document.createDocumentFragment();
    orden.forEach((pos) => {
      const { m } = mazo[pos];
      const carta = document.createElement('button');
      carta.type = 'button';
      // `naipe`, no `carta`: .carta ya es el capítulo de la carta de Cesar,
      // y estos estilos se le comían el papel y el margen.
      carta.className = 'naipe';
      carta.dataset.id = m.id;
      carta.setAttribute('aria-label', 'Carta boca abajo');
      carta.innerHTML = `<span class="naipe__dorso" aria-hidden="true"></span>
        <img class="naipe__cara" src="${imagenDe(m)}" alt="" loading="lazy" decoding="async">`;
      carta.addEventListener('click', () => voltear(carta));
      frag.append(carta);
    });
    tablero.append(frag);
    primera = null; bloqueado = false; intentos = 0; resueltas = 0;
    estado.textContent = '';
    otra.hidden = true;
    saltar.hidden = false;
  };

  const voltear = (carta) => {
    if (bloqueado || carta.classList.contains('es-vuelta') || carta.classList.contains('es-suya')) return;
    carta.classList.add('es-vuelta');
    carta.setAttribute('aria-label', 'Carta descubierta');

    if (!primera) { primera = carta; return; }

    intentos++;
    estado.textContent = j.intentos(intentos);

    if (primera.dataset.id === carta.dataset.id) {
      primera.classList.add('es-suya');
      carta.classList.add('es-suya');
      primera = null;
      if (++resueltas === PAREJAS) {
        estado.textContent = j.hecho;
        otra.hidden = false;
        saltar.hidden = true;
      }
      return;
    }

    // Se quedan vistas un momento: darles la vuelta al instante hace
    // imposible memorizarlas, que es justo el juego.
    bloqueado = true;
    const a = primera; primera = null;
    setTimeout(() => {
      for (const c of [a, carta]) {
        c.classList.remove('es-vuelta');
        c.setAttribute('aria-label', 'Carta boca abajo');
      }
      bloqueado = false;
    }, 850);
  };

  otra.addEventListener('click', repartir);
  saltar.addEventListener('click', () => {
    tablero.querySelectorAll('.naipe').forEach((c) => c.classList.add('es-vuelta', 'es-suya'));
    estado.textContent = j.hecho;
    saltar.hidden = true;
    otra.hidden = false;
  });

  repartir();
}
