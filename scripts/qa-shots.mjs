// QA visual mínimo: captura cada capítulo en cada tamaño, mide desbordes
// horizontales y recoge errores de consola. Nada de arquitectura de tests.
//
// Uso:  node scripts/qa-shots.mjs [carpeta]
//       QA_SIZE=390x844 node scripts/qa-shots.mjs .qa   (un solo tamaño)
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import fss from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const OUT = process.argv[2] || path.resolve('.qa');
await fs.mkdir(OUT, { recursive: true });

// Servidor propio sobre dist/: evita depender de un preview externo.
const RAIZ = path.resolve('dist');
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.avif': 'image/avif', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp',
  '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.json': 'application/json',
};
const servidor = http.createServer((req, res) => {
  let f = decodeURIComponent(req.url.split('?')[0]);
  if (f.endsWith('/')) f += 'index.html';
  const p = path.join(RAIZ, f);
  if (!p.startsWith(RAIZ) || !fss.existsSync(p) || fss.statSync(p).isDirectory()) {
    res.writeHead(404).end('no'); return;
  }
  res.writeHead(200, { 'Content-Type': TIPOS[path.extname(p)] || 'application/octet-stream' });
  fss.createReadStream(p).pipe(res);
});
await new Promise((r) => servidor.listen(0, '127.0.0.1', r));
const URL = `http://127.0.0.1:${servidor.address().port}/`;
console.log('sirviendo dist/ en', URL);

const TODOS = [
  { n: '390x844',   w: 390,  h: 844  },
  { n: '430x932',   w: 430,  h: 932  },
  { n: '768x1024',  w: 768,  h: 1024 },
  { n: '1440x900',  w: 1440, h: 900  },
  { n: '1920x1080', w: 1920, h: 1080 },
];
// Un tamaño por proceso: si uno se atasca, no se lleva por delante la pasada.
const TAM = process.env.QA_SIZE ? TODOS.filter((t) => t.n === process.env.QA_SIZE) : TODOS;
if (!TAM.length) { console.error('tamaño desconocido:', process.env.QA_SIZE); process.exit(2); }

const SEC = ['portada', 'rafaga', 'cotidiano', 'coche', 'taysson',
             'aniversario', 'oro', 'galeria', 'juegos', 'senda', 'carta', 'final', 'post'];

// Traza a fichero: en segundo plano la consola se queda en el búfer y no hay
// forma de ver dónde se atasca.
const TRAZA = path.join(OUT, `traza${process.env.QA_SIZE ? '-' + process.env.QA_SIZE : ''}.log`);
await fs.writeFile(TRAZA, '');
const traza = (m) => { fss.appendFileSync(TRAZA, `${m}\n`); console.log(m); };

const navegador = await chromium.launch();
const informe = [];

// Un solo contexto y una sola página: recrear contextos por tamaño hacía que
// el segundo goto no terminara nunca de disparar 'load'.
const ctx = await navegador.newContext({
  viewport: { width: TAM[0].w, height: TAM[0].h },
  deviceScaleFactor: 2,
  hasTouch: true,
  locale: 'es-ES',
});
// La puerta (ACCESO.activo) tapa la pantalla entera: sin esto, las cinco
// pasadas capturarían doce veces la misma capa de entrada. Se marca como ya
// entrada, que es exactamente lo que hace la propia puerta al abrirse.
await ctx.addInitScript(() => {
  try { sessionStorage.setItem('diana-1309-dentro', '1'); } catch {}
});

const p = await ctx.newPage();
let errores = [];
p.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
p.on('pageerror', (e) => errores.push('PAGEERROR ' + e.message));
p.on('requestfailed', (r) => errores.push('FALLO ' + r.url().split('/').pop()));

for (const t of TAM) {
  errores = [];
  await p.setViewportSize({ width: t.w, height: t.h });
  // 'load' no sirve: la página sigue trayendo fotogramas de las ráfagas.
  await p.goto(URL + '?v=' + t.n, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await p.waitForSelector('#final', { state: 'attached', timeout: 20000 });
  await p.waitForTimeout(1600);
  traza(`${t.n} cargado`);

  const dir = path.join(OUT, t.n);
  await fs.mkdir(dir, { recursive: true });

  const desborde = await p.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth);

  // Elementos que se salen del viewport. Se ignoran los que están dentro de un
  // contenedor con scroll horizontal propio y el enlace de salto escondido.
  const culpables = await p.evaluate(() => {
    const w = document.documentElement.clientWidth;
    const dentroDeScroller = (el) => {
      for (let n = el.parentElement; n; n = n.parentElement) {
        if (getComputedStyle(n).overflowX === 'auto') return true;
      }
      return false;
    };
    const malos = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.right < -2000) continue;
      if (dentroDeScroller(el)) continue;
      if (r.right > w + 1.5 || r.left < -1.5) {
        malos.push({
          sel: el.tagName.toLowerCase() + (typeof el.className === 'string' && el.className
               ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''),
          left: Math.round(r.left), right: Math.round(r.right),
        });
      }
    }
    return malos.slice(0, 12);
  });

  for (const s of SEC) {
    const el = await p.$('#' + s);
    if (!el) { informe.push({ tam: t.n, sec: s, nota: 'FALTA' }); continue; }
    traza(`  ${t.n} -> ${s}`);
    await el.scrollIntoViewIfNeeded();
    await p.waitForTimeout(800);
    try {
      // 'disabled' congela animaciones: el cursor parpadeante del final impedía
      // que Playwright diera la pantalla por estable.
      await p.screenshot({ path: path.join(dir, `${s}.png`), animations: 'disabled', caret: 'hide', timeout: 40000 });
    } catch (e) {
      informe.push({ tam: t.n, sec: s, nota: 'CAPTURA FALLÓ: ' + e.message.split('\n')[0] });
    }
  }

  informe.push({ tam: t.n, desborde, culpables, errores: [...new Set(errores)].slice(0, 10) });
  traza(`${t.n} listo — desborde ${desborde}px, ${errores.length} errores`);
}

// Se escribe el informe ANTES de desmontar nada: cerrar el servidor espera a
// que Chromium suelte sus conexiones keep-alive y puede no volver nunca.
const sufijo = process.env.QA_SIZE ? `-${process.env.QA_SIZE}` : '';
await fs.writeFile(path.join(OUT, `informe${sufijo}.json`), JSON.stringify(informe, null, 2));

await navegador.close().catch(() => {});
servidor.closeAllConnections?.();
servidor.close();

for (const r of informe) {
  if (r.nota) { console.log(`! ${r.tam} ${r.sec || ''} ${r.nota}`); continue; }
  const mal = r.desborde > 1 || r.errores.length;
  console.log(`${mal ? 'X ' : 'OK'} ${r.tam}  desborde:${r.desborde}px  errores:${r.errores.length}`);
  r.culpables?.forEach((c) => console.log(`     -> ${c.sel}  [${c.left} -> ${c.right}]`));
  r.errores.forEach((e) => console.log(`     ! ${e.slice(0, 150)}`));
}

process.exit(0);
