// Extracts representative frames per video and lays them out 4 videos x 4 frames per sheet.
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const run = promisify(execFile);

const SRC = process.argv[2];
const OUT = process.argv[3];
const TMP = path.join(OUT, '_frames');
await fs.mkdir(TMP, { recursive: true });

const files = (await fs.readdir(SRC)).filter((f) => /\.(mov|mp4)$/i.test(f)).sort();
const idOf = (f) => f.slice(3, 8);

const CW = 380, CH = 300, LABEL = 26, PAD = 6;
const FRAMES = 4;
const info = [];

for (const f of files) {
  const p = path.join(SRC, f);
  const { stdout } = await run('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration',
    '-show_entries', 'stream=width,height,codec_name,r_frame_rate,codec_type',
    '-of', 'json', p,
  ]);
  const j = JSON.parse(stdout);
  const v = (j.streams || []).find((s) => s.codec_type === 'video') || {};
  const a = (j.streams || []).find((s) => s.codec_type === 'audio');
  const dur = parseFloat(j.format?.duration || '0');
  info.push({ file: f, id: idOf(f), dur: +dur.toFixed(1), w: v.width, h: v.height, codec: v.codec_name, audio: a?.codec_name || null });

  for (let i = 0; i < FRAMES; i++) {
    const t = dur * (0.12 + (0.76 * i) / (FRAMES - 1));
    const out = path.join(TMP, `${idOf(f)}_${i}.jpg`);
    try {
      await run('ffmpeg', ['-y', '-ss', String(t.toFixed(2)), '-i', p, '-frames:v', '1', '-q:v', '4', '-vf', `scale=${CW}:${CH}:force_original_aspect_ratio=decrease`, out]);
    } catch (e) { console.error('frame fail', f, i); }
  }
}

await fs.writeFile(path.join(OUT, 'videos.json'), JSON.stringify(info, null, 2));

const PERSHEET = 4;
let sheetIdx = 0;
for (let i = 0; i < info.length; i += PERSHEET) {
  const batch = info.slice(i, i + PERSHEET);
  sheetIdx++;
  const sheetW = FRAMES * (CW + PAD) + PAD;
  const sheetH = batch.length * (CH + LABEL + PAD) + PAD;
  const composites = [], labels = [];
  for (let r = 0; r < batch.length; r++) {
    const y = PAD + r * (CH + LABEL + PAD);
    for (let c = 0; c < FRAMES; c++) {
      const x = PAD + c * (CW + PAD);
      const fp = path.join(TMP, `${batch[r].id}_${c}.jpg`);
      try {
        const buf = await sharp(fp).resize(CW, CH, { fit: 'contain', background: { r: 12, g: 12, b: 14 } }).toBuffer();
        composites.push({ input: buf, left: x, top: y });
      } catch {}
    }
    const b = batch[r];
    labels.push(`<text x="${PAD + 8}" y="${y + CH + 19}" font-family="monospace" font-size="19" fill="#e8c98a">${b.id}  ${b.dur}s  ${b.w}x${b.h}  ${b.codec}${b.audio ? '  aud:' + b.audio : '  NO-AUDIO'}</text>`);
  }
  composites.push({ input: Buffer.from(`<svg width="${sheetW}" height="${sheetH}" xmlns="http://www.w3.org/2000/svg">${labels.join('')}</svg>`), left: 0, top: 0 });
  await sharp({ create: { width: sheetW, height: sheetH, channels: 3, background: { r: 18, g: 17, b: 20 } } })
    .composite(composites).jpeg({ quality: 82 })
    .toFile(path.join(OUT, `vsheet-${String(sheetIdx).padStart(2, '0')}.jpg`));
  console.log('vsheet', sheetIdx);
}
console.log('VIDEOS', info.length);
