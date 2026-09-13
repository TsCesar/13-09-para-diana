/* «Unas cuantas razones».
 *
 * Mientras RAZONES.lista esté vacía en content.js, esto no dibuja nada: ni
 * título, ni caja, ni margen. Nada de secciones vacías bonitas esperando
 * contenido. En cuanto se escriba algo dentro, aparece sola.
 */

import { RAZONES } from '../data/content.js';

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
