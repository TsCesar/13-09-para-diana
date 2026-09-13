// Builds contact sheets for visual curation. Output goes to the scratch dir, not the project.
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const SRC = process.argv[2];
const OUT = process.argv[3];
const COLS = 4, ROWS = 4;
const CW = 400, CH = 500, LABEL = 26, PAD = 6;

const files = (await fs.readdir(SRC))
  .filter((f) => f.toLowerCase().endsWith('.jpg'))
  .sort();

await fs.mkdir(OUT, { recursive: true });

const sheetW = COLS * (CW + PAD) + PAD;
const sheetH = ROWS * (CH + LABEL + PAD) + PAD;

const idOf = (f) => f.slice(3, 8); // 00001006-PHOTO-... -> 01006

let sheetIdx = 0;
const manifest = [];

for (let i = 0; i < files.length; i += COLS * ROWS) {
  const batch = files.slice(i, i + COLS * ROWS);
  sheetIdx++;
  const composites = [];
  const labels = [];

  for (let k = 0; k < batch.length; k++) {
    const col = k % COLS, row = Math.floor(k / COLS);
    const x = PAD + col * (CW + PAD);
    const y = PAD + row * (CH + LABEL + PAD);
    const id = idOf(batch[k]);
    manifest.push({ sheet: sheetIdx, id, file: batch[k] });
    try {
      const buf = await sharp(path.join(SRC, batch[k]))
        .rotate()
        .resize(CW, CH, { fit: 'contain', background: { r: 12, g: 12, b: 14 } })
        .toBuffer();
      composites.push({ input: buf, left: x, top: y });
    } catch (e) {
      console.error('skip', batch[k], e.message);
    }
    labels.push(
      `<text x="${x + CW / 2}" y="${y + CH + 19}" font-family="monospace" font-size="20" fill="#d8d2c6" text-anchor="middle">${id}</text>`
    );
  }

  const svg = Buffer.from(
    `<svg width="${sheetW}" height="${sheetH}" xmlns="http://www.w3.org/2000/svg">${labels.join('')}</svg>`
  );
  composites.push({ input: svg, left: 0, top: 0 });

  await sharp({
    create: { width: sheetW, height: sheetH, channels: 3, background: { r: 18, g: 17, b: 20 } },
  })
    .composite(composites)
    .jpeg({ quality: 82 })
    .toFile(path.join(OUT, `sheet-${String(sheetIdx).padStart(2, '0')}.jpg`));

  console.log('sheet', sheetIdx, batch.length, 'photos', idOf(batch[0]), '->', idOf(batch[batch.length - 1]));
}

await fs.writeFile(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 0));
console.log('TOTAL SHEETS', sheetIdx, 'PHOTOS', files.length);
