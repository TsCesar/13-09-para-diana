// El único sitio donde vive dónde se publica la web.
//
// GitHub Pages sirve un repositorio de proyecto bajo una subcarpeta con el
// nombre del repo: https://USUARIO.github.io/13-09-para-diana/
// Eso obliga a que Vite construya con `base` = esa subcarpeta, y a que el QA
// de producción sirva `dist` exactamente igual, o no se prueba lo que se sube.
//
// Nada de esto hace falta tocarlo si el repo se llama como está previsto.
// Si se llamara de otra forma, basta con la variable de entorno: en GitHub
// Actions se rellena sola con el nombre real del repositorio.

export const REPO = process.env.VITE_REPO || '13-09-para-diana';

// Siempre con barra delante y detrás: es lo que espera `base` de Vite y lo que
// devuelve `import.meta.env.BASE_URL`.
const normalizar = (b) => ('/' + String(b).replace(/^\/+|\/+$/g, '') + '/').replace('//', '/');

export const BASE = process.env.VITE_BASE ? normalizar(process.env.VITE_BASE) : `/${REPO}/`;

// Dirección pública completa, sin barra final (así la componen los metadatos de
// Open Graph: SITIO + '/og/og-birthday.png').
export const SITIO = (process.env.VITE_SITE_URL || `https://usuario.github.io${BASE}`)
  .replace(/\/+$/, '');
