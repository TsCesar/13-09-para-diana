// Genera los derivados optimizados en public/m/ y el índice src/data/media.json.
// NUNCA toca ./Fotos_y_Videos — sólo lee.
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { MOMENTOS, VIDEOS, EXCLUDE_REASON } from './curation.mjs';

const run = promisify(execFile);
const SRC = path.resolve('Fotos_y_Videos');
const OUT = path.resolve('public/m');
const DATA = path.resolve('src/data');

// El fotograma elegido se ve grande y fijo: merece resolución.
// Los demás sólo pasan volando a ~11 fps: 420px sobra y mantiene la ráfaga ligera.
//
// 1500px sólo para lo que va de verdad a sangre (portada, final y los planos
// grandes de capítulo). En el resto, el marco nunca pasa de ~700px de alto en
// escritorio ni de un ancho de móvil: pedir 1500 era mandarle 190 kB a Diana
// para pintar 390 px.
const KEEP_W = [560, 840, 1080];
const KEEP_W_GRANDE = [720, 1080, 1500, 1920];
// Piezas pequeñas (tríptico de la galería, tira de post-créditos): nunca pasan
// de ~380 px de ancho en pantalla, así que 840 es el techo real.
const KEEP_W_MENUDA = [360, 560, 840];
const FRAME_W = 420;

const anchosDe = (m) => (m.grande ? KEEP_W_GRANDE : m.menuda ? KEEP_W_MENUDA : KEEP_W);

await fs.mkdir(OUT, { recursive: true });
await fs.mkdir(DATA, { recursive: true });

const files = await fs.readdir(SRC);
const byId = new Map();
for (const f of files) byId.set(f.slice(3, 8), f);

// La exclusión se comprueba aquí, no sólo en los informes: si un id excluido
// se cuela en la curación, esto para la generación en vez de publicarlo.
const excluidas = new Map();
for (const [motivo, ids] of Object.entries(EXCLUDE_REASON)) for (const id of ids) excluidas.set(id, motivo);

const resolve = (id) => {
  if (excluidas.has(id)) {
    throw new Error(`${id} está excluido a propósito (${excluidas.get(id)}): no se genera nada suyo`);
  }
  const f = byId.get(id);
  if (!f) throw new Error(`No existe el original ${id}`);
  return path.join(SRC, f);
};

const bytes = async (p) => (await fs.stat(p)).size;
let totalOut = 0;

async function emit(input, base, width, { quality = 50, effort = 6 } = {}) {
  const out = path.join(OUT, `${base}-${width}.avif`);
  const pipe = sharp(input).rotate().resize(width, null, { withoutEnlargement: true });
  await pipe.avif({ quality, effort }).toFile(out);
  totalOut += await bytes(out);
  return `m/${base}-${width}.avif`;
}

// JPEG de respaldo sólo para el fotograma elegido (AVIF cubre >95% de navegadores;
// el respaldo evita una portada en blanco en un navegador viejo).
async function emitFallback(input, base, width) {
  const out = path.join(OUT, `${base}-${width}.jpg`);
  await sharp(input).rotate().resize(width, null, { withoutEnlargement: true })
    .jpeg({ quality: 76, mozjpeg: true, progressive: true }).toFile(out);
  totalOut += await bytes(out);
  return `m/${base}-${width}.jpg`;
}

async function meta(input) {
  const m = await sharp(input).rotate().metadata();
  return { w: m.width, h: m.height };
}

// Placeholder diminuto en base64 para evitar el salto de layout sin pedir otra petición.
async function lqip(input) {
  const buf = await sharp(input).rotate().resize(20, null).blur(1).webp({ quality: 28 }).toBuffer();
  return `data:image/webp;base64,${buf.toString('base64')}`;
}

// SOLO=video reaprovecha los momentos ya generados y rehace sólo los clips.
const soloVideo = process.env.SOLO === 'video';
let momentos = [];
if (soloVideo) {
  momentos = JSON.parse(await fs.readFile(path.join(DATA, 'media.json'), 'utf8')).momentos;
  console.log(`(SOLO=video) conservo ${momentos.length} momentos ya generados`);
}

for (const m of (soloVideo ? [] : MOMENTOS)) {
  const keepId = m.frames[m.keep];
  const keepPath = resolve(keepId);
  const dim = await meta(keepPath);

  const keep = { srcset: [], fallback: null, lqip: await lqip(keepPath), ...dim };
  for (const w of anchosDe(m)) {
    if (w > dim.w * 1.1) continue;
    keep.srcset.push({ w, url: await emit(keepPath, `${m.id}-keep`, w, { quality: 52 }) });
  }
  if (!keep.srcset.length) keep.srcset.push({ w: dim.w, url: await emit(keepPath, `${m.id}-keep`, dim.w, { quality: 52 }) });
  // El respaldo JPEG sólo lo pide un navegador sin AVIF (<5 %): con `srcset`
  // puesto, `src` no se usa nunca en los demás. No merece 1080 —el JPEG de una
  // foto de bosque a 1080 pesa 600 kB— y con 900 se ve perfectamente.
  keep.fallback = await emitFallback(keepPath, `${m.id}-keep`, Math.min(m.menuda ? 560 : 900, dim.w));

  const frames = [];
  for (let i = 0; i < m.frames.length; i++) {
    const p = resolve(m.frames[i]);
    frames.push({
      id: m.frames[i],
      url: await emit(p, `${m.id}-f${String(i).padStart(2, '0')}`, FRAME_W, { quality: 44 }),
    });
  }

  momentos.push({
    id: m.id, kind: m.kind, grade: m.grade,
    keepIndex: m.keep, keep, frames,
    ratio: +(dim.w / dim.h).toFixed(4),
    // Interruptores de la curación que la web necesita saber en runtime.
    ...(m.memoria ? { memoria: true } : {}),
    ...(m.cierre ? { cierre: true } : {}),
  });
  console.log(`✓ ${m.id}  ${frames.length} fotogramas`);
}

// ---- Vídeo ----
const videos = [];
for (const v of VIDEOS) {
  const input = resolve(v.src);
  const base = path.join(OUT, v.id);
  const trim = v.trim ? ['-ss', String(v.trim[0]), '-t', String(v.trim[1] - v.trim[0])] : [];
  const crop = v.recorte ? `crop=${v.recorte.join(':')},` : '';

  // H.264 en MP4: es lo que reproduce todo, incluidos los .mov de origen que
  // Chrome/Android no abre de forma fiable.
  const mp4 = `${base}.mp4`;
  await run('ffmpeg', [
    '-y', ...trim, '-i', input,
    '-vf', `${crop}scale='min(720,iw)':-2:flags=lanczos`,
    '-c:v', 'libx264', '-profile:v', 'main', '-crf', String(v.crf ?? 27), '-preset', 'slow',
    '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    ...(v.sound ? ['-c:a', 'aac', '-b:a', '96k'] : ['-an']),
    mp4,
  ]);
  totalOut += await bytes(mp4);

  // El póster sale del mp4 ya recortado, para que encuadre igual que el vídeo.
  const posterPng = `${base}-poster.png`;
  const posterT = v.trim ? Math.max(0, v.poster - v.trim[0]) : v.poster;
  await run('ffmpeg', ['-y', '-ss', String(posterT), '-i', mp4, '-frames:v', '1', posterPng]);
  const pdim = await meta(posterPng);
  const poster = await emit(posterPng, `${v.id}-poster`, Math.min(900, pdim.w), { quality: 50 });
  const posterLqip = await lqip(posterPng);
  await fs.unlink(posterPng);

  const probe = await run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'json', mp4]);
  videos.push({
    id: v.id, src: `m/${v.id}.mp4`, poster, lqip: posterLqip,
    sound: !!v.sound, grade: v.grade,
    ratio: +(pdim.w / pdim.h).toFixed(4),
    duration: +parseFloat(JSON.parse(probe.stdout).format.duration).toFixed(2),
  });
  console.log(`✓ vídeo ${v.id}  ${(await bytes(mp4) / 1048576).toFixed(1)} MB`);
}

await fs.writeFile(
  path.join(DATA, 'media.json'),
  JSON.stringify({ momentos, videos }, null, 0),
  'utf8'
);

// Poda. Cambiar la escala de tamaños (KEEP_W pasó de [720,1080,1500] a
// [560,840,1080]) dejaba los derivados viejos en public/m: nadie los pide, pero
// `dist` los llevaba igual porque Vite copia public/ entera. Cuatro megas de
// nada. Se borra todo lo que media.json no referencia.
// Con SOLO=video es igual de seguro: los momentos se releen del media.json
// anterior, así que sus ficheros siguen estando referenciados.
{
  const usados = new Set();
  const rec = (v) => {
    if (typeof v === 'string') { if (v.startsWith('m/')) usados.add(v.slice(2)); return; }
    if (v && typeof v === 'object') Object.values(v).forEach(rec);
  };
  rec({ momentos, videos });

  let podados = 0, bytesPodados = 0;
  for (const f of await fs.readdir(OUT)) {
    if (usados.has(f)) continue;
    bytesPodados += await bytes(path.join(OUT, f));
    await fs.unlink(path.join(OUT, f));
    podados++;
  }
  if (podados) console.log(`podados ${podados} derivados huérfanos (${(bytesPodados / 1048576).toFixed(1)} MB)`);
}

console.log(`\nTotal servido: ${(totalOut / 1048576).toFixed(1)} MB`);
console.log(`momentos: ${momentos.length}  vídeos: ${videos.length}`);
