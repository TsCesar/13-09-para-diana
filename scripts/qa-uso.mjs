// QA de uso: no mira capturas, toca las cosas. Comprueba que lo interactivo
// hace lo que dice — lupa, secretos, memory, vela, teclado y desbordes en
// los tamaños extremos.
//
// Uso:  node scripts/qa-uso.mjs
import { chromium } from 'playwright';
import fss from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { BASE } from './sitio.mjs';

const RAIZ = path.resolve('dist');
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.avif': 'image/avif', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.txt': 'text/plain',
  '.mp3': 'audio/mpeg', '.webp': 'image/webp', '.json': 'application/json',
};
// dist/ se sirve BAJO SU PREFIJO, no en la raíz: la build lleva base
// `/13-09-para-diana/` en cada ruta y servirla en / devuelve 404 en el bundle,
// la hoja de estilo y todas las fotos — la página se queda en blanco sin un
// solo error de JS que lo explique. Aquí se sirve igual que GitHub Pages.
const servidor = http.createServer((req, res) => {
  let f = decodeURIComponent(req.url.split('?')[0]);
  if (f.startsWith(BASE)) f = '/' + f.slice(BASE.length);
  if (f.endsWith('/')) f += 'index.html';
  const p = path.join(RAIZ, f);
  if (!p.startsWith(RAIZ) || !fss.existsSync(p) || fss.statSync(p).isDirectory()) {
    res.writeHead(404).end('no'); return;
  }
  res.writeHead(200, { 'Content-Type': TIPOS[path.extname(p)] || 'application/octet-stream' });
  fss.createReadStream(p).pipe(res);
});
await new Promise((r) => servidor.listen(0, '127.0.0.1', r));
const URL = `http://127.0.0.1:${servidor.address().port}${BASE}`;

const nav = await chromium.launch();
const fallos = [];
const ok = [];
const comprobar = (cond, texto) => (cond ? ok : fallos).push(texto);

const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, locale: 'es-ES' });

// La puerta (ACCESO.activo) tapa la pantalla entera y se come todos los clics.
// Aquí se comprueba lo de dentro, así que se entra igual que entra ella: con
// la marca que la propia puerta deja al abrirse.
await ctx.addInitScript(() => {
  try { sessionStorage.setItem('diana-1309-dentro', '1'); } catch {}
});

const p = await ctx.newPage();
const erroresConsola = [];
p.on('pageerror', (e) => erroresConsola.push('PAGEERROR ' + e.message));
p.on('console', (m) => { if (m.type() === 'error') erroresConsola.push(m.text()); });

await p.goto(URL, { waitUntil: 'domcontentloaded' });
await p.waitForSelector('#post', { state: 'attached' });

// ── El recorrido ──
comprobar(await p.locator('.recorrido').count() === 1, 'recorrido montado');
await p.locator('#cotidiano').scrollIntoViewIfNeeded();
await p.waitForTimeout(900);
comprobar(await p.locator('.recorrido.es-visible').count() === 1, 'recorrido aparece al bajar');
comprobar(await p.locator('.recorrido__tick.es-aqui').count() === 1, 'recorrido marca un solo capítulo');

// ── Secretos ──
await p.locator('#taysson').scrollIntoViewIfNeeded();
await p.waitForTimeout(600);
await p.locator('.huella').click();
await p.waitForTimeout(400);
comprobar((await p.locator('.secreto__aviso').textContent() || '').includes('Taysson'), 'secreto: huella avisa');
comprobar(!(await p.locator('.secreto__cuenta').isHidden()), 'secreto: aparece el contador');
await p.locator('#aniversario').scrollIntoViewIfNeeded();
await p.waitForTimeout(400);
await p.locator('.aniv__marca').click();
await p.waitForTimeout(300);
comprobar((await p.locator('.secreto__cuenta').textContent() || '').startsWith('2/'), 'secreto: el contador sube');

// ── Memory ──
await p.locator('#juego-memoria').scrollIntoViewIfNeeded();
// El juego se monta con IntersectionObserver: hay que esperar a que exista,
// no a un timeout a ojo.
await p.waitForSelector('.naipe', { timeout: 15000 });
const cartas = p.locator('.naipe');
comprobar(await cartas.count() === 12, `memory: doce cartas (hay ${await cartas.count()})`);
await cartas.nth(0).click();
await p.waitForTimeout(120);
comprobar(await p.locator('.naipe.es-vuelta').count() === 1, 'memory: la carta se gira');
const id0 = await cartas.nth(0).getAttribute('data-id');
let pareja = -1;
for (let i = 1; i < 12; i++) if (await cartas.nth(i).getAttribute('data-id') === id0) { pareja = i; break; }
comprobar(pareja > 0, 'memory: cada foto está dos veces');
if (pareja > 0) {
  await cartas.nth(pareja).click();
  await p.waitForTimeout(300);
  comprobar(await p.locator('.naipe.es-suya').count() === 2, 'memory: la pareja se queda');
}
await p.locator('[data-saltar]').click();
await p.waitForTimeout(200);
comprobar(await p.locator('.naipe.es-suya').count() === 12, 'memory: se puede saltar');

// ── Lupa ──
await p.locator('#post').scrollIntoViewIfNeeded();
await p.waitForTimeout(2000);
const tejas = await p.locator('.post__teja').count();
comprobar(tejas > 100, `lupa: el mosaico tiene ${tejas} teselas`);
await p.locator('.post__teja').first().click();
await p.waitForTimeout(500);
comprobar(await p.locator('.lupa:not([hidden])').count() === 1, 'lupa: abre al tocar una tesela');
comprobar((await p.locator('.lupa__cuenta').textContent() || '').includes('1 de'), 'lupa: dice en cuál va');
comprobar(await p.locator('.lupa__paso--antes').isDisabled(), 'lupa: en la primera no deja retroceder');
await p.keyboard.press('ArrowRight');
await p.waitForTimeout(300);
comprobar((await p.locator('.lupa__cuenta').textContent() || '').includes('2 de'), 'lupa: las flechas pasan');
comprobar(await p.evaluate(() => document.documentElement.classList.contains('esta-bloqueado')),
  'lupa: la página de detrás no hace scroll');
await p.keyboard.press('Escape');
await p.waitForTimeout(300);
comprobar(await p.locator('.lupa:not([hidden])').count() === 0, 'lupa: ESC cierra');
comprobar(!(await p.evaluate(() => document.documentElement.classList.contains('esta-bloqueado'))),
  'lupa: al cerrar se devuelve el scroll');

// ── La vela ──
await p.locator('#final').scrollIntoViewIfNeeded();
await p.waitForTimeout(700);
await p.locator('.final__deseo').click();
await p.waitForTimeout(300);
comprobar(await p.locator('.deseo:not([hidden])').count() === 1, 'vela: abre');
comprobar(await p.locator('.deseo__vela').isDisabled(), 'vela: no se puede soplar antes de tiempo');
await p.waitForTimeout(6200);
comprobar(!(await p.locator('.deseo__vela').isDisabled()), 'vela: se puede soplar tras los tres textos');
await p.locator('.deseo__vela').click();
await p.waitForTimeout(1600);
comprobar(await p.locator('.deseo.esta-soplada').count() === 1, 'vela: se apaga');
comprobar(await p.locator('.deseo.esta-hecho').count() === 1, 'vela: remata con el mensaje');
await p.locator('.deseo__cerrar').click();
await p.waitForTimeout(300);
comprobar(await p.locator('.deseo:not([hidden])').count() === 0, 'vela: cierra');

// ── Desborde en los tamaños extremos ──
for (const [w, h] of [[320, 568], [360, 800], [414, 896], [844, 390], [2560, 1440]]) {
  await p.setViewportSize({ width: w, height: h });
  await p.waitForTimeout(700);
  const d = await p.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);
  comprobar(d <= 1, `${w}×${h}: sin desborde horizontal (${d}px)`);
}

comprobar(erroresConsola.length === 0, `consola limpia (${erroresConsola.length} errores)`);

await nav.close().catch(() => {});
servidor.closeAllConnections?.();
servidor.close();

console.log(ok.map((t) => '  ok  ' + t).join('\n'));
if (fallos.length) {
  console.log('\n' + fallos.map((t) => '  MAL ' + t).join('\n'));
  if (erroresConsola.length) console.log('\n' + erroresConsola.slice(0, 6).map((e) => '   ! ' + e.slice(0, 160)).join('\n'));
}
console.log(`\n${ok.length} bien · ${fallos.length} mal`);
process.exit(fallos.length ? 1 : 0);
