/* La puerta. Apagada por defecto (ACCESO.activo en content.js).
 *
 * No es seguridad y no lo finge: quien abra el código ve las respuestas.
 * Es una broma de dos preguntas para que la primera pantalla no sea ya
 * la felicitación.
 *
 * Nunca bloquea. Falle lo que falle, al tercer intento se abre igual: nadie
 * se va a quedar fuera de su propio regalo.
 */

import { ACCESO } from '../data/content.js';

const LLAVE = 'diana-1309-dentro';
const INTENTOS_MAX = 3;

// Sin tildes, sin signos, sin dobles espacios, en minúscula. Así «20 De
// Diciembre», «20/12» y «20-12» son la misma respuesta.
const normalizar = (s) => s
  .toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

export const yaEntro = () => {
  try { return sessionStorage.getItem(LLAVE) === '1'; } catch { return true; }
};
const marcar = () => { try { sessionStorage.setItem(LLAVE, '1'); } catch {} };

export function montarAcceso(alEntrar) {
  if (!ACCESO.activo || yaEntro()) { alEntrar(); return; }

  document.documentElement.classList.add('esta-bloqueado');

  const capa = document.createElement('section');
  capa.className = 'puerta';
  capa.setAttribute('aria-label', 'Entrada');
  capa.innerHTML = `
    <div class="puerta__cuerpo">
      ${ACCESO.intro.map((t, k) => `<p class="puerta__linea" style="--k:${k}">${t}</p>`).join('')}
      <button class="boton puerta__boton" type="button">${ACCESO.boton}</button>
    </div>
    <form class="puerta__reto" hidden>
      <p class="puerta__preg"></p>
      <input class="puerta__campo" type="text" autocomplete="off" autocapitalize="off"
             spellcheck="false" enterkeyhint="go">
      <p class="puerta__pista">${ACCESO.pista}</p>
      <p class="puerta__fallo" role="status" aria-live="polite"></p>
    </form>
    <div class="puerta__bien" hidden>
      <p class="puerta__ok"></p>
      <p class="puerta__hola"></p>
    </div>`;
  document.body.append(capa);

  const cuerpo = capa.querySelector('.puerta__cuerpo');
  const reto   = capa.querySelector('.puerta__reto');
  const preg   = capa.querySelector('.puerta__preg');
  const campo  = capa.querySelector('.puerta__campo');
  const fallo  = capa.querySelector('.puerta__fallo');
  const bien   = capa.querySelector('.puerta__bien');

  let q = 0, fallos = 0;

  const preguntar = () => {
    const actual = ACCESO.preguntas[q];
    preg.textContent = actual.pregunta;
    campo.value = '';
    campo.setAttribute('aria-label', actual.pregunta);
    fallo.textContent = '';
    campo.focus();
  };

  capa.querySelector('.puerta__boton').addEventListener('click', () => {
    cuerpo.hidden = true;
    reto.hidden = false;
    preguntar();
  });

  reto.addEventListener('submit', (e) => {
    e.preventDefault();
    const dicho = normalizar(campo.value);
    if (!dicho) return;
    const actual = ACCESO.preguntas[q];
    const vale = actual.respuestas.some((r) => normalizar(r) === dicho);

    // Al tercer intento se da por buena. Es una broma, no un examen.
    if (!vale && fallos < INTENTOS_MAX - 1) {
      fallo.textContent = ACCESO.fallos[Math.min(fallos, ACCESO.fallos.length - 1)];
      fallos++;
      campo.select();
      return;
    }

    fallos = 0;
    if (++q < ACCESO.preguntas.length) { preguntar(); return; }
    entrar();
  });

  function entrar() {
    marcar();
    reto.hidden = true;
    bien.hidden = false;
    const ok = capa.querySelector('.puerta__ok');
    const hola = capa.querySelector('.puerta__hola');
    ok.textContent = ACCESO.bien;
    ok.classList.add('es-visible');

    const rapido = matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(() => {
      hola.textContent = ACCESO.saludo;
      hola.classList.add('es-visible');
      setTimeout(() => {
        capa.classList.add('se-abre');
        document.documentElement.classList.remove('esta-bloqueado');
        alEntrar();
        setTimeout(() => capa.remove(), rapido ? 0 : 1200);
      }, rapido ? 0 : 1500);
    }, rapido ? 0 : 1200);
  }
}

/* Botón discreto para volver a empezar. Sólo se dibuja si la puerta está
   encendida: sin puerta no hay nada que reiniciar. */
export function montarReinicio(host) {
  if (!ACCESO.activo) return;
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'boton boton--tenue reinicio';
  b.textContent = ACCESO.reiniciar;
  b.addEventListener('click', () => {
    try { sessionStorage.clear(); } catch {}
    location.href = location.pathname;
  });
  host.append(b);
}
