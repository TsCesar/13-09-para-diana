/* El recorrido. Una marca por capítulo, pegada al borde derecho.
 *
 * No es una barra de progreso ni dice ningún porcentaje: es el mismo raíl
 * de marcas que llevan las ráfagas (DESIGN.md § Signature detail), sólo que
 * contando capítulos en vez de fotogramas. La marca del capítulo en el que
 * está se alarga y se pone amarilla, igual que el fotograma elegido.
 *
 * Se actualiza con IntersectionObserver, no con la altura del documento:
 * los capítulos crecen cuando llegan sus fotos, y una barra calculada sobre
 * scrollHeight daría saltos hacia atrás cada vez que carga una ráfaga.
 */

export function montarProgreso(raiz, secciones) {
  const caps = secciones.map((id) => raiz.querySelector('#' + id)).filter(Boolean);
  if (caps.length < 2) return;

  const raton = document.createElement('nav');
  raton.className = 'recorrido';
  raton.setAttribute('aria-hidden', 'true');   // es orientación visual, no navegación
  raton.innerHTML = caps.map(() => '<i class="recorrido__tick"></i>').join('');
  document.body.append(raton);
  const ticks = [...raton.children];

  // Un capítulo va sobre papel claro (la carta). Ahí las marcas color tinta
  // desaparecen, así que lo que está pegado a los bordes se entera y se
  // oscurece. Se mira el propio data-grado, que ya lleva el tono del capítulo.
  const esClaro = (el) => {
    const h = (el.dataset.grado || '#171412').replace('#', '');
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) > 140;
  };

  // El capítulo activo es el que más pantalla ocupa, no el primero que toca
  // el borde: con capítulos de tres pantallas, lo segundo se adelanta siempre.
  const visible = new Map();
  const pintar = () => {
    let mejor = 0, mejorK = 0;
    visible.forEach((v, k) => { if (v > mejor) { mejor = v; mejorK = k; } });
    ticks.forEach((t, k) => t.classList.toggle('es-aqui', k === mejorK));
    document.body.classList.toggle('sobre-claro', esClaro(caps[mejorK]));
  };

  const io = new IntersectionObserver((es) => {
    for (const e of es) {
      const k = caps.indexOf(e.target);
      if (k >= 0) visible.set(k, e.intersectionRatio);
    }
    pintar();
  }, { threshold: [0, .1, .25, .5, .75, 1] });

  caps.forEach((c) => io.observe(c));

  // Aparece cuando ella ya ha empezado a bajar: en la portada estorba.
  const centinela = new IntersectionObserver((es) => {
    raton.classList.toggle('es-visible', !es[0].isIntersecting);
  }, { threshold: .55 });
  if (caps[0]) centinela.observe(caps[0]);
}
