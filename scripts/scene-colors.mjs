// Samples the dominant/average colour of each curated scene so chapter grading is derived
// from the real photographs instead of invented.
import sharp from 'sharp';
import path from 'node:path';

const SRC = process.argv[2];

const SCENES = {
  flores:      ['01360', '01365', '01372', '01380'],
  cocheNoche:  ['01160', '01166', '01169', '01081'],
  cocheMonte:  ['01176', '01177', '01252', '01258'],
  lavadero:    ['01112', '01116', '01019', '01023'],
  gimnasio:    ['01143', '01147', '01052', '01056'],
  taysson:     ['01320', '01324', '01330', '01336'],
  tayssonArco: ['01348', '01352', '01399', '01405'],
  graduacion:  ['01219', '01230', '01246', '01306'],
  ascensor:    ['01179', '01182', '01183'],
  cocheNocturno:['01090', '01094', '01099'],
};

const file = (id) => {
  const n = id.replace(/^0/, '');
  return null; // resolved below via directory scan
};

import fs from 'node:fs/promises';
const all = await fs.readdir(SRC);
const byId = new Map();
for (const f of all) if (f.endsWith('.jpg')) byId.set(f.slice(3, 8), f);

const hex = (r, g, b) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

for (const [scene, ids] of Object.entries(SCENES)) {
  let R = 0, G = 0, B = 0, n = 0;
  let dR = 0, dG = 0, dB = 0, dn = 0; // darkest quartile = the "ground" colour
  for (const id of ids) {
    const f = byId.get(id);
    if (!f) { console.error('missing', id); continue; }
    const { data, info } = await sharp(path.join(SRC, f))
      .rotate().resize(48, 48, { fit: 'cover' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const px = [];
    for (let i = 0; i < data.length; i += 3) px.push([data[i], data[i + 1], data[i + 2]]);
    for (const [r, g, b] of px) { R += r; G += g; B += b; n++; }
    px.sort((a, b) => (a[0] + a[1] + a[2]) - (b[0] + b[1] + b[2]));
    for (const [r, g, b] of px.slice(0, Math.floor(px.length * 0.25))) { dR += r; dG += g; dB += b; dn++; }
  }
  console.log(
    scene.padEnd(14),
    'avg', hex(R / n, G / n, B / n),
    ' sombra', hex(dR / dn, dG / dn, dB / dn)
  );
}
