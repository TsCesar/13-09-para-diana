/* EL GRADO — la web está etalonada como una película (DESIGN.md § Motion language).
 * Cada capítulo lleva la temperatura de sus propias fotos y el suelo interpola
 * entre ellas con el scroll. Lento, continuo, sin llamar la atención.        */

const menosMovimiento = matchMedia('(prefers-reduced-motion: reduce)');

const aRGB = (hex) => {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
const aHex = (rgb) => '#' + rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
const mezcla = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

export function montarGrado(secciones) {
  const tramos = secciones
    .map((el) => ({ el, c: aRGB(el.dataset.grado || '#171412') }))
    .filter((t) => t.el);

  if (!tramos.length) return;

  if (menosMovimiento.matches) {
    // Sin interpolación: el grado cambia de golpe al entrar cada capítulo.
    const io = new IntersectionObserver((es) => {
      for (const e of es) {
        if (e.isIntersecting && e.intersectionRatio > .4) {
          document.body.style.setProperty('--grado', e.target.dataset.grado);
        }
      }
    }, { threshold: [.4] });
    tramos.forEach((t) => io.observe(t.el));
    return;
  }

  let pendiente = false;

  const aplicar = () => {
    pendiente = false;
    const mitad = innerHeight * 0.5;

    // Tramo cuyo centro está justo encima y justo debajo del centro de pantalla.
    let antes = tramos[0], despues = tramos[0], mejorA = -Infinity, mejorD = Infinity;
    for (const t of tramos) {
      const r = t.el.getBoundingClientRect();
      const d = (r.top + r.height / 2) - mitad;
      if (d <= 0 && d > mejorA) { mejorA = d; antes = t; }
      if (d > 0 && d < mejorD) { mejorD = d; despues = t; }
    }
    if (antes === despues) {
      document.body.style.setProperty('--grado', aHex(antes.c));
      return;
    }
    const total = Math.abs(mejorA) + Math.abs(mejorD);
    const t = total ? Math.abs(mejorA) / total : 0;
    document.body.style.setProperty('--grado', aHex(mezcla(antes.c, despues.c, t)));
  };

  const pedir = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(aplicar); } };

  addEventListener('scroll', pedir, { passive: true });
  addEventListener('resize', pedir, { passive: true });
  aplicar();
}
