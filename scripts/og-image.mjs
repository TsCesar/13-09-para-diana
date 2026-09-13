// Genera la miniatura que se ve al pegar el enlace en WhatsApp.
//
// A propósito NO lleva ninguna foto: la previsualización no puede destripar
// la sorpresa. Lleva la identidad del sitio y nada más — la fecha, el nombre
// y el raíl de la ráfaga, que es el detalle firma (ver DESIGN.md).
//
// Se dibuja en Chromium en vez de con sharp porque Gambarino y Supreme viven
// en public/fonts y no están instaladas en el sistema: así sale con la letra
// de verdad y no con una sustituta.
//
// Uso:  node scripts/og-image.mjs
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import fss from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const PUB = path.resolve('public');
const OUT = path.join(PUB, 'og');
await fs.mkdir(OUT, { recursive: true });

// 25 marcas: las fotos que hay del ramo en el pasillo. La encendida es la 19,
// el fotograma elegido en scripts/curation.mjs. Las dos cifras son reales.
const TICKS = 25;
const ELEGIDO = 19;

const PAGINA = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<link rel="stylesheet" href="/fonts.css">
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; }
  /* Centrado a propósito: WhatsApp recorta al cuadrado en algunas vistas y
     un bloque pegado a la izquierda se queda fuera. Así aguanta el recorte. */
  body {
    width: 1200px; height: 630px;
    background: #120E0C;
    color: #EFE7DA;
    font-family: 'Supreme', system-ui, sans-serif;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 0 92px;
    overflow: hidden;
  }
  /* Mismo gesto que la portada: la fecha manda y el punto es el acento. */
  .fecha {
    font-family: 'Gambarino', Georgia, serif;
    font-size: 232px; line-height: .78; letter-spacing: -.045em;
    display: flex; align-items: baseline;
  }
  .punto { color: #FFC400; font-size: .42em; translate: 0 -.42em; padding-inline: .06em; }
  .pie {
    margin-top: 34px;
    font-size: 27px; font-weight: 500; letter-spacing: .34em;
    color: #9C8F7F;
  }
  /* El raíl de la ráfaga, tumbado. Cuenta cuántas había. */
  .rail { margin-top: 46px; display: flex; align-items: flex-end; gap: 9px; }
  .tick { display: block; width: 2px; height: 14px; background: #EFE7DA; opacity: .45; }
  .tick.es-elegido { height: 30px; width: 3px; background: #FFC400; opacity: 1; }
</style></head><body>
  <div class="fecha"><span>13</span><span class="punto">·</span><span>09</span></div>
  <p class="pie">PARA DIANA</p>
  <div class="rail">${
    Array.from({ length: TICKS }, (_, i) =>
      `<i class="tick${i === ELEGIDO ? ' es-elegido' : ''}"></i>`).join('')
  }</div>
</body></html>`;

// Servidor mínimo sobre public/: hace falta para que el @font-face resuelva.
const TIPOS = { '.css': 'text/css', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
const servidor = http.createServer((req, res) => {
  const ruta = decodeURIComponent(req.url.split('?')[0]);
  if (ruta === '/__og.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(PAGINA);
    return;
  }
  const p = path.join(PUB, ruta);
  if (!p.startsWith(PUB) || !fss.existsSync(p) || fss.statSync(p).isDirectory()) {
    res.writeHead(404).end('no'); return;
  }
  res.writeHead(200, { 'Content-Type': TIPOS[path.extname(p)] || 'application/octet-stream' });
  fss.createReadStream(p).pipe(res);
});
await new Promise((r) => servidor.listen(0, '127.0.0.1', r));
const URL = `http://127.0.0.1:${servidor.address().port}/__og.html`;

const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await pagina.goto(URL, { waitUntil: 'load' });
await pagina.evaluate(() => document.fonts.ready);
await pagina.waitForTimeout(250);

const destino = path.join(OUT, 'og-birthday.png');
await pagina.screenshot({ path: destino, animations: 'disabled' });

await navegador.close().catch(() => {});
servidor.closeAllConnections?.();
servidor.close();

const kb = Math.round((await fs.stat(destino)).size / 1024);
console.log(`✓ ${path.relative(process.cwd(), destino)}  1200×630  ${kb} kB`);
process.exit(0);
