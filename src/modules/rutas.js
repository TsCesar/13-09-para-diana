/* Una sola forma de construir la URL de un recurso.
 *
 * La web se publica en GitHub Pages bajo una subcarpeta
 * (https://usuario.github.io/13-09-para-diana/), así que `m/ramo-keep-840.avif`
 * o `audio/te-quiero-tanto.mp3` tienen que salir con ese prefijo delante.
 * Vite lo deja en `import.meta.env.BASE_URL`: '/' en desarrollo y
 * '/13-09-para-diana/' en la build.
 *
 * Las rutas relativas *parecen* funcionar solas, porque el documento vive en esa
 * misma carpeta. Pero sólo mientras la URL termine en barra: basta que alguien
 * entre por .../13-09-para-diana/index.html o que el capítulo cambie la ruta para
 * que empiecen a pedirse desde la raíz del dominio. Con el prefijo puesto no
 * depende de eso.
 */

export const BASE = import.meta.env.BASE_URL;

/** Prefija una ruta de `public/`. Deja intactas las que ya son absolutas
 *  (http:, blob:) y los LQIP, que son data-URI incrustados. */
export const ruta = (r) => {
  if (typeof r !== 'string' || !r) return r;
  if (/^(?:[a-z]+:|\/\/)/i.test(r)) return r;
  return BASE + r.replace(/^\/+/, '');
};

/* Las claves de media.json que llevan una ruta. El resto del índice son
   números, ids y data-URI, y no se tocan. */
const CON_RUTA = new Set(['url', 'src', 'poster', 'fallback']);

/** Devuelve una copia del índice de medios con todas sus rutas ya prefijadas.
 *  Se llama una vez, al arrancar: así ni las ráfagas, ni los clips, ni el
 *  mosaico, ni los juegos tienen que acordarse de hacerlo cada uno. */
export function conBase(valor, clave = null) {
  if (Array.isArray(valor)) return valor.map((v) => conBase(v, clave));
  if (valor && typeof valor === 'object') {
    const salida = {};
    for (const [k, v] of Object.entries(valor)) salida[k] = conBase(v, k);
    return salida;
  }
  return CON_RUTA.has(clave) ? ruta(valor) : valor;
}
