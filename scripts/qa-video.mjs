// QA de vídeo: no se fía del poster. Entra por la puerta como ella, baja hasta
// cada clip y exige que `currentTime` avance — solo o tocando ▶.
//
// Uso:  node scripts/qa-video.mjs
//       QA_NAV=chromium node scripts/qa-video.mjs          (por defecto webkit)
//       QA_URL=https://usuario.github.io/13-09-para-diana/ node scripts/qa-video.mjs
//
// Tres escenarios por tamaño:
//   normal     — autoplay permitido: tiene que arrancar solo.
//   reducido   — prefers-reduced-motion: no arranca solo, ▶ tiene que funcionar.
//   bloqueado  — play() rechazado fuera de un gesto (lo que hace Safari en bajo
//                consumo): ▶ y «Activar sonido» tienen que arrancarlo en el toque.
//
// El servidor local contesta a Range con 206: WebKit no reproduce un mp4 que
// se sirve sin rangos, y GitHub Pages sí los da.
import { chromium, webkit } from 'playwright';
import fss from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { BASE } from './sitio.mjs';

const IDS = ['conducir', 'carretera', 'taysson-alza', 'taysson-sofa', 'graduacion-acto', 'senda-viva'];
const NAV = process.env.QA_NAV || 'webkit';
const TAMANOS = (process.env.QA_SIZE ? [process.env.QA_SIZE] : ['390x844', '393x852', '430x932'])
  .map((s) => s.split('x').map(Number));

const RAIZ = path.resolve('dist');
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.avif': 'image/avif', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.txt': 'text/plain',
  '.mp3': 'audio/mpeg', '.webp': 'image/webp', '.json': 'application/json',
};

let servidor = null;
let URL = process.env.QA_URL;
if (!URL) {
  servidor = http.createServer((req, res) => {
    let f = decodeURIComponent(req.url.split('?')[0]);
    if (f.startsWith(BASE)) f = '/' + f.slice(BASE.length);
    if (f.endsWith('/')) f += 'index.html';
    const p = path.join(RAIZ, f);
    if (!p.startsWith(RAIZ) || !fss.existsSync(p) || fss.statSync(p).isDirectory()) {
      res.writeHead(404).end('no'); return;
    }
    const tam = fss.statSync(p).size;
    const tipo = TIPOS[path.extname(p)] || 'application/octet-stream';
    const r = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
    if (r) {
      const ini = r[1] ? +r[1] : tam - +r[2];
      const fin = r[1] && r[2] ? Math.min(+r[2], tam - 1) : tam - 1;
      res.writeHead(206, {
        'Content-Type': tipo, 'Accept-Ranges': 'bytes',
        'Content-Range': `bytes ${ini}-${fin}/${tam}`, 'Content-Length': fin - ini + 1,
      });
      fss.createReadStream(p, { start: ini, end: fin }).pipe(res).on('error', () => {});
    } else {
      res.writeHead(200, { 'Content-Type': tipo, 'Accept-Ranges': 'bytes', 'Content-Length': tam });
      fss.createReadStream(p).pipe(res).on('error', () => {});
    }
  });
  await new Promise((r) => servidor.listen(0, '127.0.0.1', r));
  URL = `http://127.0.0.1:${servidor.address().port}${BASE}`;
}

const motor = NAV === 'chromium' ? chromium : webkit;
const nav = await motor.launch();
const fallos = [];
const ok = [];
const informe = {};
const comprobar = (cond, texto) => (cond ? ok : fallos).push(texto);
const esperar = (p, ms) => p.waitForTimeout(ms);

async function escenario([w, h], modo) {
  const ctx = await nav.newContext({
    viewport: { width: w, height: h }, deviceScaleFactor: 3, hasTouch: true,
    isMobile: NAV === 'webkit' ? true : undefined, locale: 'es-ES',
    reducedMotion: modo === 'reducido' ? 'reduce' : 'no-preference',
  });

  await ctx.addInitScript((modo) => {
    // Eventos de carga por clip (los de media no burbujean: se oyen en captura).
    window.__qa = { ev: {}, sonido: [], audios: [] };
    for (const t of ['loadedmetadata', 'loadeddata', 'playing', 'error']) {
      document.addEventListener(t, (e) => {
        const m = /m\/([^/]+)\.mp4/.exec(e.target.currentSrc || e.target.src || '');
        if (!m) return;
        (window.__qa.ev[m[1]] ||= {})[t] = true;
      }, true);
    }
    document.addEventListener('clip-sonido', (e) => window.__qa.sonido.push(e.detail));
    // La canción se crea con new Audio(): se guarda para leer su volumen.
    const A = window.Audio;
    window.Audio = function (...a) { const x = new A(...a); window.__qa.audios.push(x); return x; };
    window.Audio.prototype = A.prototype;

    if (modo === 'bloqueado') {
      // Safari en bajo consumo: play() sólo vale dentro de un gesto. Como en
      // WebKit, un elemento que ya arrancó con un gesto queda desbloqueado.
      let gesto = false;
      for (const t of ['click', 'touchend', 'pointerup']) {
        addEventListener(t, () => { gesto = true; setTimeout(() => { gesto = false; }, 0); }, true);
      }
      const play = HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play = function () {
        if (gesto) this.__desbloqueado = true;
        if (this instanceof HTMLVideoElement && !gesto && !this.__desbloqueado) {
          return Promise.reject(new DOMException('bloqueado en QA', 'NotAllowedError'));
        }
        return play.call(this);
      };
    }
  }, modo);

  const p = await ctx.newPage();
  const errores = [];
  const red = [];
  p.on('pageerror', (e) => errores.push('PAGEERROR ' + e.message));
  p.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()); });
  p.on('response', (r) => { if (r.status() >= 400) red.push(`${r.status()} ${r.url()}`); });
  p.on('requestfailed', (r) => {
    // WebKit cancela y rehace peticiones de media por rangos: eso no es un fallo.
    if (/\.(mp4|mp3)$/.test(r.url()) && /cancel/i.test(r.failure()?.errorText || '')) return;
    red.push(`FALLO ${r.failure()?.errorText} ${r.url()}`);
  });

  const tag = `${NAV} ${w}x${h} ${modo}`;
  await p.goto(URL, { waitUntil: 'domcontentloaded' });

  // ── La puerta, como ella ──
  await p.locator('.puerta__boton').click({ timeout: 15000 });
  await p.locator('.puerta__campo').fill('Taysson');
  await p.locator('.puerta__campo').press('Enter');
  await esperar(p, 200);
  await p.locator('.puerta__campo').fill('20 de diciembre');
  await p.locator('.puerta__campo').press('Enter');
  await p.waitForSelector('.puerta', { state: 'detached', timeout: 15000 });
  const siMusica = p.locator('.musica__preg [data-si]');
  if (await siMusica.count()) await siMusica.click();
  await esperar(p, 400);

  await p.evaluate(() => document.querySelectorAll('figure.clip').forEach((f) => {
    const m = /m\/(.+)-poster/.exec(f.querySelector('.clip__poster').getAttribute('src'));
    if (m) f.dataset.qa = m[1];
  }));

  const leer = (id) => p.evaluate((id) => {
    const v = document.querySelector(`figure[data-qa="${id}"] video`);
    return {
      src: v.currentSrc || v.src, paused: v.paused, t: v.currentTime, muted: v.muted,
      readyState: v.readyState, error: v.error && v.error.code,
      play: !document.querySelector(`figure[data-qa="${id}"] .clip__play`).hidden,
      ev: window.__qa.ev[id] || {},
    };
  }, id);

  for (const id of IDS) {
    const fig = p.locator(`figure[data-qa="${id}"]`);
    comprobar(await fig.count() === 1, `${tag} · ${id}: montado`);
    await fig.evaluate((f) => f.scrollIntoView({ block: 'center' }));

    let autoplay = false;
    // Lo perezoso de encima (ráfagas, mosaico) crece al acercarse y empuja el
    // clip fuera de pantalla: se recentra mientras se espera, como haría un dedo.
    const centrar = () => fig.evaluate((f) => {
      const r = f.getBoundingClientRect();
      if (r.top < 0 || r.bottom > innerHeight) f.scrollIntoView({ block: 'center' });
    });
    for (let i = 0; i < 20 && !autoplay; i++) {
      await esperar(p, 200);
      await centrar();
      const e = await leer(id);
      autoplay = !e.paused && e.t > 0.15;
    }

    let manual = null;
    if (!autoplay) {
      // A la vista y quieto: el ▶ tiene que estar.
      await centrar();
      await p.waitForFunction((id) =>
        !document.querySelector(`figure[data-qa="${id}"] .clip__play`).hidden, id, { timeout: 4000 }).catch(() => {});
      const boton = fig.locator('.clip__play');
      comprobar(await boton.isVisible(), `${tag} · ${id}: ▶ visible sin autoplay`);
      if (await boton.isVisible()) {
        await (NAV === 'webkit' ? boton.tap().catch(() => boton.click()) : boton.click());
        await esperar(p, 1500);
        manual = true;
      }
    }

    const a = await leer(id);
    await esperar(p, 900);
    const b = await leer(id);
    // En bucle: si da la vuelta, el tiempo baja. Vale con que haya cambiado.
    const avanza = !b.paused && b.t !== a.t;
    const r = {
      http: /\/m\/.+\.mp4$/.test(b.src) ? (red.some((x) => x.includes(`${id}.mp4`)) ? 'ERROR' : 'OK') : 'SIN SRC',
      base: b.src.includes(`${BASE}m/${id}.mp4`),
      readyState: b.readyState, error: b.error, loadedmetadata: !!b.ev.loadedmetadata,
      loadeddata: !!b.ev.loadeddata, autoplay, manual, avanza, playOculto: !b.play,
    };
    (informe[id] ||= {})[tag] = r;
    comprobar(r.base, `${tag} · ${id}: URL bajo ${BASE}`);
    comprobar(r.http === 'OK', `${tag} · ${id}: HTTP correcto`);
    comprobar(r.error === null, `${tag} · ${id}: video.error nulo`);
    comprobar(r.readyState >= 2, `${tag} · ${id}: readyState ${r.readyState} ≥ 2`);
    comprobar(r.loadedmetadata && r.loadeddata, `${tag} · ${id}: loadedmetadata y loadeddata`);
    comprobar(avanza, `${tag} · ${id}: currentTime avanza (${a.t.toFixed(2)} → ${b.t.toFixed(2)})`);
    comprobar(r.playOculto, `${tag} · ${id}: ▶ se oculta al reproducir`);
    if (modo === 'normal') comprobar(autoplay, `${tag} · ${id}: autoplay`);
    else comprobar(!autoplay && manual, `${tag} · ${id}: no arranca solo y ▶ lo arranca`);

    // ── Taysson: sonido y ducking ──
    if (id === 'taysson-alza') {
      const son = fig.locator('.clip__son');
      if (modo === 'bloqueado') {
        // Clip parado: «Activar sonido» tiene que arrancarlo en el mismo toque.
        await fig.evaluate((f) => f.querySelector('video').pause());
        await esperar(p, 300);
      }
      await son.click();
      await esperar(p, 900);
      const s = await p.evaluate(() => {
        const v = document.querySelector('figure[data-qa="taysson-alza"] video');
        return { muted: v.muted, paused: v.paused, t: v.currentTime,
                 pressed: document.querySelector('figure[data-qa="taysson-alza"] .clip__son').getAttribute('aria-pressed'),
                 sonido: window.__qa.sonido.slice(), vol: window.__qa.audios[0]?.volume };
      });
      await esperar(p, 600);
      const t2 = await fig.evaluate((f) => f.querySelector('video').currentTime);
      comprobar(!s.muted && s.pressed === 'true', `${tag} · sonido: se activa`);
      comprobar(!s.paused && t2 !== s.t, `${tag} · sonido: el clip suena y avanza`);
      comprobar(s.sonido.some((d) => d.id === 'taysson-alza' && d.activo), `${tag} · sonido: evento clip-sonido activo`);
      comprobar(s.vol !== undefined && s.vol < 0.2, `${tag} · ducking: la música baja (${s.vol?.toFixed(2)})`);

      await son.click();
      await esperar(p, 1200);
      const s2 = await p.evaluate(() => ({
        muted: document.querySelector('figure[data-qa="taysson-alza"] video').muted,
        ultimo: window.__qa.sonido.at(-1), vol: window.__qa.audios[0]?.volume,
      }));
      comprobar(s2.muted && s2.ultimo && !s2.ultimo.activo, `${tag} · sonido: se silencia y avisa`);
      comprobar(s2.vol !== undefined && s2.vol > 0.5, `${tag} · ducking: la música vuelve (${s2.vol?.toFixed(2)})`);
      informe[id][tag].sonido = !s.muted && !s.paused && t2 !== s.t;
      informe[id][tag].ducking = s.vol < 0.2 && s2.vol > 0.5;
    }
  }

  // Salir y volver: si al volver no arranca solo, el ▶ tiene que estar otra vez.
  if (modo !== 'normal') {
    const fig = p.locator('figure[data-qa="conducir"]');
    await p.evaluate(() => scrollTo(0, 0));
    await esperar(p, 700);
    await fig.evaluate((f) => f.scrollIntoView({ block: 'center' }));
    await esperar(p, 2800);
    const e = await leer('conducir');
    comprobar(!e.paused || e.play, `${tag} · al volver a entrar: se mueve o hay ▶`);
  }

  comprobar(red.length === 0, `${tag} · red sin errores${red.length ? ': ' + red.join(' | ') : ''}`);
  comprobar(errores.length === 0, `${tag} · consola sin errores${errores.length ? ': ' + errores.join(' | ') : ''}`);
  informe.__consola = (informe.__consola || 0) + errores.length;
  await ctx.close();
}

try {
  for (const t of TAMANOS) await escenario(t, 'normal');
  await escenario(TAMANOS[0], 'reducido');
  await escenario(TAMANOS[0], 'bloqueado');
} catch (e) {
  fallos.push('EXCEPCIÓN ' + e.message.split('\n')[0]);
}

await nav.close();
console.log(JSON.stringify(informe, null, 1));
console.log(`\n${ok.length} OK · ${fallos.length} fallos`);
fallos.forEach((f) => console.log('  ✗ ' + f));
servidor?.closeAllConnections?.();
servidor?.close();
process.exit(fallos.length ? 1 : 0);
