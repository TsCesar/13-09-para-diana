/* Los secretos.
 *
 * Cuatro cosas escondidas que no hacen falta para nada. Si no encuentra
 * ninguna, no se entera de que existen y la web está completa igual.
 *
 * El contador no aparece hasta que encuentra el primero: un «0/4» desde el
 * principio convierte el paseo en una lista de tareas, que es exactamente
 * lo que no queremos.
 */

import { SECRETOS } from '../data/content.js';

const LLAVE = 'diana-1309-secretos';

const leer = () => {
  try { return new Set(JSON.parse(sessionStorage.getItem(LLAVE)) || []); }
  catch { return new Set(); }
};
const guardar = (s) => { try { sessionStorage.setItem(LLAVE, JSON.stringify([...s])); } catch {} };

export function montarSecretos(raiz) {
  const total = Object.keys(SECRETOS.hallazgos).length;
  const halladas = leer();

  const aviso = document.createElement('p');
  aviso.className = 'secreto__aviso';
  aviso.setAttribute('role', 'status');
  aviso.setAttribute('aria-live', 'polite');
  document.body.append(aviso);

  const marcador = document.createElement('span');
  marcador.className = 'secreto__cuenta';
  marcador.hidden = true;
  document.body.append(marcador);

  let reloj = null;
  const refrescar = () => {
    marcador.hidden = halladas.size === 0;
    marcador.textContent = SECRETOS.cuenta(halladas.size, total);
  };

  const encontrar = (clave) => {
    if (halladas.has(clave)) return;
    halladas.add(clave);
    guardar(halladas);
    refrescar();

    const texto = halladas.size === total
      ? `${SECRETOS.hallazgos[clave]}\n${SECRETOS.todos}`
      : SECRETOS.hallazgos[clave];
    aviso.textContent = '';
    texto.split('\n').forEach((linea, k) => {
      const s = document.createElement('span');
      s.textContent = linea;
      if (k) s.className = 'secreto__remate';
      aviso.append(s);
    });
    aviso.classList.add('es-visible');
    clearTimeout(reloj);
    reloj = setTimeout(() => aviso.classList.remove('es-visible'), 4200);
  };

  // Convierte un elemento que ya existe en un secreto, sin añadirle nada
  // visible. Sigue siendo accesible: es un botón de verdad con etiqueta.
  const esconder = (el, clave, etiqueta) => {
    if (!el) return;
    el.classList.add('es-secreto');
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', etiqueta);
    const disparar = (e) => { e.preventDefault(); el.classList.add('se-encontro'); encontrar(clave); };
    el.addEventListener('click', disparar);
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') disparar(e); });
  };

  // 1. La huella. Es lo único que se añade al DOM, y sólo es un rastro
  //    de 14px en una esquina del capítulo de Taysson.
  const cap = raiz.querySelector('#taysson');
  if (cap) {
    const huella = document.createElement('button');
    huella.type = 'button';
    huella.className = 'huella';
    huella.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" width="14" height="14">
      <ellipse cx="7" cy="8" rx="2.1" ry="2.8"/><ellipse cx="12" cy="6.2" rx="2.1" ry="3"/>
      <ellipse cx="17" cy="8" rx="2.1" ry="2.8"/><ellipse cx="12" cy="16" rx="5" ry="4.4"/></svg>`;
    huella.setAttribute('aria-label', 'Una huella');
    huella.addEventListener('click', () => { huella.classList.add('se-encontro'); encontrar('huella'); });
    cap.append(huella);
  }

  // 2. El 20·12 del capítulo del aniversario.
  esconder(raiz.querySelector('.aniv__marca'), 'aniv', 'Veinte de diciembre');
  // 3. El punto amarillo entre el 13 y el 09 de la portada.
  esconder(raiz.querySelector('.portada__p'), 'punto', 'El punto');
  // 4. El «Fin.» de los post-créditos, que resulta que no es el fin.
  esconder(raiz.querySelector('.post__fin'), 'fin', 'Fin');

  refrescar();
}
