import { defineConfig } from 'vite';
import { BASE, SITIO } from './scripts/sitio.mjs';

// GitHub Pages publica el repo bajo /13-09-para-diana/, así que la build tiene
// que llevar ese prefijo en todo. En `npm run dev` no hay subcarpeta: servir el
// dev server bajo el mismo prefijo sólo complica la URL y no prueba nada que la
// build no pruebe mejor. De ahí que `base` dependa del comando y no de un
// fichero que haya que editar a mano antes de publicar.
//
// `VITE_SITE_URL` lo rellena solo el workflow de Pages con la URL real. Aquí se
// pone en process.env antes de que Vite lea el entorno, para que el `%VITE_SITE_URL%`
// de index.html tenga siempre un valor y una build local no publique un
// marcador a medio sustituir.
process.env.VITE_SITE_URL = SITIO;

export default defineConfig(({ command }) => ({
  base: command === 'build' ? BASE : '/',
  build: {
    target: 'es2020',
    assetsInlineLimit: 2048,
    cssCodeSplit: false,
    reportCompressedSize: false,
  },
  server: { host: true },
}));
