/* Dos secciones que hoy no existen.
 *
 * Mientras sus arrays estén vacíos en content.js, esto no dibuja nada: ni
 * título, ni caja, ni margen. Nada de secciones vacías bonitas esperando
 * contenido. En cuanto se escriba algo dentro, aparecen solas.
 */

import { RAZONES, QUIZ } from '../data/content.js';

export function montarRazones(host) {
  if (!host || !RAZONES.lista?.length) { host?.remove(); return; }

  // Sin viñetas y sin tarjetas iguales: cada frase es un bloque con su
  // número, como las marcas de las ráfagas.
  host.innerHTML = `
    <h2 class="cap__titulo">${RAZONES.titulo}</h2>
    <ol class="razones">
      ${RAZONES.lista.map((t, k) => `<li class="razon">
        <span class="razon__n" aria-hidden="true">${String(k + 1).padStart(2, '0')}</span>
        <p class="razon__t">${t}</p></li>`).join('')}
    </ol>`;
}

export function montarQuiz(host) {
  if (!host || !QUIZ.preguntas?.length) { host?.remove(); return; }

  let idx = 0, aciertos = 0;
  host.innerHTML = `
    <h3 class="juego__titulo">${QUIZ.titulo}</h3>
    <p class="juego__intro">${QUIZ.intro}</p>
    <div class="quiz">
      <p class="quiz__preg"></p>
      <div class="quiz__ops"></div>
      <p class="juego__estado" role="status" aria-live="polite"></p>
    </div>`;

  const preg = host.querySelector('.quiz__preg');
  const ops = host.querySelector('.quiz__ops');
  const estado = host.querySelector('.juego__estado');

  const pintar = () => {
    const q = QUIZ.preguntas[idx];
    preg.textContent = q.pregunta;
    estado.textContent = '';
    ops.innerHTML = '';
    q.opciones.forEach((o, k) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'boton boton--tenue quiz__op';
      b.textContent = o;
      b.addEventListener('click', () => {
        [...ops.children].forEach((c) => { c.disabled = true; });
        const bien = k === q.correcta;
        b.classList.add(bien ? 'es-bien' : 'es-mal');
        if (bien) aciertos++;
        else ops.children[q.correcta]?.classList.add('es-bien');
        estado.textContent = bien ? QUIZ.bien : QUIZ.mal.replace('{n}', q.opciones[q.correcta]);
        setTimeout(() => {
          if (++idx < QUIZ.preguntas.length) pintar();
          else estado.textContent = `${aciertos}/${QUIZ.preguntas.length}`;
        }, 1400);
      });
      ops.append(b);
    });
  };

  pintar();
}
