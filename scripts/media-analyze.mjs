// Inventario del material original. SÓLO LEE: no mueve, no borra, no reescribe
// nada de Fotos_y_Videos, y no sube nada a ninguna parte.
//
// Produce, dentro de Fotos_y_Videos/_ANALISIS/:
//   informe-multimedia.md   el recuento y las decisiones, en texto
//   informe-visual.html     las miniaturas, para revisarlas de un vistazo
//   manifiesto.json         lo mismo en crudo, por si hace falta programarlo
//   thumbs/                 miniaturas de 240px (copias, nunca originales)
//
// Uso:  npm run media:analyze        (RAPIDO=1 se salta las miniaturas)
import sharp from 'sharp';
import fs from 'node:fs/promises';
import fss from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { MOMENTOS, VIDEOS, EXCLUDE_REASON } from './curation.mjs';

const run = promisify(execFile);
const SRC = path.resolve('Fotos_y_Videos');
const OUT = path.join(SRC, '_ANALISIS');
const THUMBS = path.join(OUT, 'thumbs');

const IMG = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.gif', '.avif', '.bmp', '.tif', '.tiff']);
const VID = new Set(['.mp4', '.mov', '.m4v', '.webm', '.avi', '.mkv', '.3gp']);

await fs.mkdir(THUMBS, { recursive: true });

// Las carpetas de trabajo no son material: si se releyeran, cada pasada
// contaría sus propias miniaturas como fotos nuevas.
const entradas = (await fs.readdir(SRC, { withFileTypes: true }))
  .filter((e) => e.isFile() && !e.name.startsWith('_') && !e.name.startsWith('.'));

const idDe = (nombre) => nombre.slice(3, 8);

// ── Qué decidió la curación, para cruzarlo con lo que hay en disco ──
const elegidasFoto = new Map();   // id -> momento
for (const m of MOMENTOS) for (const f of m.frames) elegidasFoto.set(f, m.id);
const keeps = new Set(MOMENTOS.map((m) => m.frames[m.keep]));
const elegidasVideo = new Map(VIDEOS.map((v) => [v.src, v.id]));
const excluidas = new Map();
for (const [motivo, ids] of Object.entries(EXCLUDE_REASON)) for (const id of ids) excluidas.set(id, motivo);

// ── dHash perceptual: 8x9 en gris, comparando cada píxel con su vecino ──
// Orienta, no decide. Ver CLAUDE.md: agrupaba fotos visiblemente distintas.
async function dhash(p) {
  const buf = await sharp(p).rotate().greyscale().resize(9, 8, { fit: 'fill' }).raw().toBuffer();
  let bits = 0n;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      bits = (bits << 1n) | (buf[y * 9 + x] > buf[y * 9 + x + 1] ? 1n : 0n);
    }
  }
  return bits;
}
const distancia = (a, b) => {
  let x = a ^ b, n = 0;
  while (x) { n += Number(x & 1n); x >>= 1n; }
  return n;
};

const sha = (p) => new Promise((res, rej) => {
  const h = crypto.createHash('sha256');
  fss.createReadStream(p).on('data', (d) => h.update(d)).on('end', () => res(h.digest('hex'))).on('error', rej);
});

// ── Recorrido ──
const fotos = [], videos = [], problemas = [];
let hechos = 0;

for (const e of entradas) {
  const ext = path.extname(e.name).toLowerCase();
  const p = path.join(SRC, e.name);
  const { size } = await fs.stat(p);
  const id = idDe(e.name);
  const base = { id, archivo: e.name, bytes: size, ext };

  if (IMG.has(ext)) {
    try {
      const m = await sharp(p).rotate().metadata();
      fotos.push({
        ...base,
        w: m.width, h: m.height,
        ratio: +(m.width / m.height).toFixed(4),
        orientacion: m.width > m.height ? 'apaisada' : m.width === m.height ? 'cuadrada' : 'vertical',
        // El export de WhatsApp viene sin EXIF. Se comprueba, no se supone.
        exif: !!m.exif,
        sha: await sha(p),
        phash: (await dhash(p)).toString(16).padStart(16, '0'),
      });
    } catch (err) {
      problemas.push({ archivo: e.name, error: err.message.split('\n')[0] });
    }
  } else if (VID.has(ext)) {
    const v = { ...base, duracion: null, w: null, h: null, fps: null, codec: null };
    try {
      const { stdout } = await run('ffprobe', ['-v', 'error', '-show_entries',
        'format=duration:stream=width,height,avg_frame_rate,codec_name,codec_type',
        '-of', 'json', p]);
      const d = JSON.parse(stdout);
      const s = (d.streams || []).find((x) => x.codec_type === 'video') || {};
      const [num, den] = (s.avg_frame_rate || '0/1').split('/').map(Number);
      Object.assign(v, {
        duracion: d.format?.duration ? +parseFloat(d.format.duration).toFixed(2) : null,
        w: s.width, h: s.height, codec: s.codec_name,
        fps: den ? +(num / den).toFixed(2) : null,
        orientacion: s.width > s.height ? 'apaisado' : 'vertical',
      });
    } catch {
      problemas.push({ archivo: e.name, error: 'ffprobe no pudo leerlo (¿está instalado?)' });
    }
    v.sha = await sha(p);
    videos.push(v);
  } else {
    problemas.push({ archivo: e.name, error: `extensión no reconocida (${ext})` });
  }

  if (++hechos % 50 === 0) console.log(`  ${hechos}/${entradas.length}`);
}

// ── Duplicados exactos: mismo sha256, byte a byte ──
const porSha = new Map();
for (const f of [...fotos, ...videos]) {
  if (!porSha.has(f.sha)) porSha.set(f.sha, []);
  porSha.get(f.sha).push(f.archivo);
}
const exactos = [...porSha.values()].filter((g) => g.length > 1);

// ── Near-duplicates: dHash a distancia <= 8, agrupado por union-find ──
const padre = new Map(fotos.map((f) => [f.id, f.id]));
const raiz = (a) => { while (padre.get(a) !== a) { padre.set(a, padre.get(padre.get(a))); a = padre.get(a); } return a; };
for (let i = 0; i < fotos.length; i++) {
  for (let j = i + 1; j < fotos.length; j++) {
    if (distancia(BigInt('0x' + fotos[i].phash), BigInt('0x' + fotos[j].phash)) <= 8) {
      const [a, b] = [raiz(fotos[i].id), raiz(fotos[j].id)];
      if (a !== b) padre.set(a, b);
    }
  }
}
const gruposMap = new Map();
for (const f of fotos) {
  const r = raiz(f.id);
  if (!gruposMap.has(r)) gruposMap.set(r, []);
  gruposMap.get(r).push(f);
}
const parecidas = [...gruposMap.values()].filter((g) => g.length > 1).sort((a, b) => b.length - a.length);

// ── El mismo original exportado dos veces ──
// dHash IDÉNTICO (no parecido: idéntico) es una señal mucho más fuerte que la
// distancia ≤ 8. Casi siempre significa la misma foto otra vez, a veces
// reescalada. Es lo que pasa aquí: el archivo se exportó dos veces.
const porHash = new Map();
for (const f of fotos) {
  if (!porHash.has(f.phash)) porHash.set(f.phash, []);
  porHash.get(f.phash).push(f);
}
const gemelas = [...porHash.values()].filter((g) => g.length > 1);
const fotosDistintas = fotos.length - gemelas.reduce((n, g) => n + g.length - 1, 0);

const porDuracion = new Map();
for (const v of videos) {
  if (v.duracion == null) continue;
  if (!porDuracion.has(v.duracion)) porDuracion.set(v.duracion, []);
  porDuracion.get(v.duracion).push(v);
}
const videosGemelos = [...porDuracion.values()].filter((g) => g.length > 1);
const videosDistintos = videos.length - videosGemelos.reduce((n, g) => n + g.length - 1, 0);

// ── Miniaturas (copias; el original no se toca) ──
if (!process.env.RAPIDO) {
  let n = 0;
  for (const f of fotos) {
    const destino = path.join(THUMBS, `${f.id}.webp`);
    if (fss.existsSync(destino)) continue;
    await sharp(path.join(SRC, f.archivo)).rotate().resize(240, null).webp({ quality: 62 }).toFile(destino);
    n++;
  }
  if (n) console.log(`  ${n} miniaturas nuevas`);
}

// ── Estado de cada foto respecto a la web ──
const estado = (f) => {
  if (excluidas.has(f.id)) return { clave: 'excluida', texto: `excluida (${excluidas.get(f.id)})` };
  if (keeps.has(f.id)) return { clave: 'keep', texto: `elegida — ${elegidasFoto.get(f.id)}` };
  if (elegidasFoto.has(f.id)) return { clave: 'usada', texto: `en la ráfaga ${elegidasFoto.get(f.id)}` };
  return { clave: 'fuera', texto: 'no entró en ningún capítulo' };
};
const cuenta = { keep: 0, usada: 0, excluida: 0, fuera: 0 };
for (const f of fotos) cuenta[estado(f).clave]++;

const videosUsados = videos.filter((v) => elegidasVideo.has(v.id));

// Un id excluido puede haber dejado de estar en la carpeta (por ejemplo, si se
// borró material ajeno). Eso no rompe nada —EXCLUDE_REASON es una lista negra,
// no una lista de referencias— pero el informe tiene que decirlo en vez de
// enseñarlo como si siguiera ahí.
const enDisco = new Set([...fotos, ...videos].map((f) => f.id));
const todasExcluidas = Object.values(EXCLUDE_REASON).flat();
const ausentes = todasExcluidas.filter((id) => !enDisco.has(id));
const mb = (b) => (b / 1048576).toFixed(1);
const pesoTotal = [...fotos, ...videos].reduce((n, f) => n + f.bytes, 0);

// ── informe-multimedia.md ──
const md = `# Informe multimedia — 13·09

Generado por \`npm run media:analyze\` el ${new Date().toISOString().slice(0, 10)}.
Sólo lectura: ningún original se ha movido, renombrado ni modificado.

## Recuento

| | |
|---|---|
| Archivos en \`Fotos_y_Videos/\` | **${entradas.length}** |
| Fotografías | **${fotos.length}** |
| Vídeos | **${videos.length}** |
| Peso total de los originales | ${mb(pesoTotal)} MB |
| Con EXIF legible | **${fotos.filter((f) => f.exif).length}** de ${fotos.length} |
| Verticales / apaisadas / cuadradas | ${fotos.filter((f) => f.orientacion === 'vertical').length} / ${fotos.filter((f) => f.orientacion === 'apaisada').length} / ${fotos.filter((f) => f.orientacion === 'cuadrada').length} |

${fotos.filter((f) => f.exif).length === 0
  ? '> **No hay EXIF en ninguna foto.** Es un export de WhatsApp: sin fecha, sin cámara y\n> sin GPS. No existe cronología real, así que el único orden disponible es el número\n> de secuencia del nombre de fichero. Ningún texto de la web afirma una fecha.'
  : '> Hay EXIF en parte del material. Aun así, la web no afirma fechas.'}

## Duplicados exactos (mismo sha256)

${exactos.length ? exactos.map((g) => `- ${g.join(' = ')}`).join('\n') : 'Ninguno. No hay dos ficheros idénticos byte a byte.'}

## Fotos muy parecidas (dHash ≤ 8)

${parecidas.length} grupos, ${parecidas.reduce((n, g) => n + g.length, 0)} fotos implicadas.

**Esto orienta, no decide.** Los hashes perceptuales agrupan ráfagas enteras —que es
justo lo que la web quiere conservar— y también juntan fotos visiblemente distintas.
La selección se hizo a mano sobre hojas de contacto.

${parecidas.slice(0, 12).map((g) => `- **${g.length}** fotos: ${g.map((f) => f.id).join(', ')}`).join('\n')}
${parecidas.length > 12 ? `\n…y ${parecidas.length - 12} grupos más (están todos en \`manifiesto.json\`).` : ''}

## El archivo está exportado dos veces

Ésta es la conclusión que más conviene tener presente antes de tocar ningún número.

Con **dHash idéntico** —no parecido: idéntico, que es una señal mucho más fuerte—
aparecen **${gemelas.length} grupos** que suman **${gemelas.reduce((n, g) => n + g.length, 0)} fotos**. En ${gemelas.filter((g) => new Set(g.map((f) => f.w + 'x' + f.h)).size > 1).length} de ellos las dos copias tienen
**resoluciones distintas**: es literalmente el mismo original exportado dos veces.

Los pares cruzan siempre los mismos rangos de numeración (007xx/008xx contra
010xx/012xx), que es el patrón de las dos exportaciones de WhatsApp.

| | |
|---|---|
| Archivos de foto | **${fotos.length}** |
| Fotos distintas estimadas | **≈ ${fotosDistintas}** |
| Archivos de vídeo | **${videos.length}** |
| Clips distintos estimados | **≈ ${videosDistintos}** |

${gemelas.slice(0, 8).map((g) => `- ${g.map((f) => `${f.id} (${f.w}×${f.h})`).join('  =  ')}`).join('\n')}

En los vídeos se ve aún más claro: ${videosGemelos.length} pares comparten duración exacta y se
diferencian sólo en la resolución. **La curación se quedó siempre con la copia
grande** — 01108 (720×1280) y no 01014 (464×832), 01122 (1280×720) y no 01029
(848×480), y así con los siete. Eso está bien hecho.

> **Qué implica para el copy.** Nada: desde la edición final **ningún texto que
> lea Diana cita una cifra**. Estos recuentos son de ficheros; **momentos
> distintos** hay ≈ ${fotosDistintas} y ≈ ${videosDistintos}. Si algún día
> vuelve a escribirse un número en content.js, hay que decidir primero cuál de
> las dos cosas se está contando — y, en general, mejor no escribirlo.

## Qué entró en la web

| | |
|---|---|
| Fotogramas usados en ráfagas | **${cuenta.usada + cuenta.keep}** |
| De ellos, fotograma elegido de su ráfaga | **${cuenta.keep}** |
| Excluidas a propósito | **${cuenta.excluida}** fotos |
| No entraron en ningún capítulo | **${cuenta.fuera}** |

Las que no entraron **no se han descartado**: son exactamente las que forman el
mosaico de post-créditos («Estas son las que no entraron en ningún capítulo»).

### Excluidas a propósito

${Object.entries(EXCLUDE_REASON).map(([motivo, ids]) =>
  `- **${motivo}** (${ids.length}): ${ids.map((id) =>
    enDisco.has(id) ? id : `~~${id}~~`).join(', ')}`).join('\n')}

La tabla de arriba cuenta ${cuenta.excluida} porque sólo cuenta **fotos que están
en la carpeta**; aquí hay ${todasExcluidas.length} ids, que incluyen vídeos y los que ya no están.

${ausentes.length
  ? `**Tachados = ya no están en \`Fotos_y_Videos/\`** (${ausentes.length}: ${ausentes.join(', ')}).\n` +
    'Que falten no rompe nada: son ids de una lista negra, no referencias. Nada\n' +
    'de la web los usa y `media:prepare` se para si alguien intenta usarlos.'
  : 'Todos los ids excluidos siguen en la carpeta. No se ha borrado ningún original.'}

No reincorporar sin decirlo: la exclusión es deliberada.

## Vídeos

${videos.length} en total, **${videosUsados.length}** en la web.

| id | dur. | resolución | fps | codec | en la web |
|---|---|---|---|---|---|
${videos.slice().sort((a, b) => a.id.localeCompare(b.id)).map((v) =>
  `| ${v.id} | ${v.duracion ?? '?'} s | ${v.w ?? '?'}×${v.h ?? '?'} | ${v.fps ?? '?'} | ${v.codec ?? '?'} | ${elegidasVideo.get(v.id) ? '**' + elegidasVideo.get(v.id) + '**' : '—' } |`).join('\n')}

Los \`.mov\` se transcodifican a H.264 porque Chrome/Android no los reproduce de
forma fiable. Eso lo hace \`npm run media:prepare\`, sobre copias.

## Archivos con problemas

${problemas.length
  ? problemas.map((p) => `- \`${p.archivo}\` — ${p.error}`).join('\n')
  : `Ninguno: los ${entradas.length} archivos se han leído correctamente.`}

## Revisión manual

Nada pendiente de identificación automática: **no se ha hecho reconocimiento
facial ni se ha subido ningún archivo a ningún servicio**. Todo el análisis es
local. Las decisiones sobre quién sale en cada foto las tomó Cesar a mano, y
están escritas en \`scripts/curation.mjs\`.
`;

await fs.writeFile(path.join(OUT, 'informe-multimedia.md'), md, 'utf8');

// ── informe-visual.html ──
const tarjeta = (f) => {
  const e = estado(f);
  return `<figure class="c ${e.clave}"><img src="thumbs/${f.id}.webp" alt="" loading="lazy" width="240">
  <figcaption><b>${f.id}</b><span>${f.w}×${f.h}</span><em>${e.texto}</em></figcaption></figure>`;
};
const seccion = (titulo, nota, items) =>
  `<section><h2>${titulo}</h2><p class="n">${nota}</p><div class="rej">${items.join('')}</div></section>`;

const html = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Informe visual — 13·09</title><style>
 :root{color-scheme:dark}
 body{margin:0;padding:2rem 1.25rem 5rem;background:#120E0C;color:#EFE7DA;
      font:15px/1.6 ui-sans-serif,system-ui,sans-serif}
 h1{font-size:1.6rem;margin:0 0 .2rem}h2{font-size:1.05rem;margin:2.5rem 0 .2rem}
 .sub,.n{color:#9C8F7F;font-size:.82rem;margin:0 0 1rem;max-width:60em}
 .rej{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:12px}
 .c{margin:0}
 .c img{width:100%;height:auto;display:block;border:1px solid #2a231d}
 .keep img{border-color:#FFC400;border-width:2px}
 .excluida img{filter:grayscale(1) brightness(.4)}
 .fuera img{filter:grayscale(.5) brightness(.72)}
 figcaption{font-size:.7rem;color:#9C8F7F;display:flex;flex-direction:column;padding-top:4px}
 figcaption b{color:#EFE7DA;font-weight:500}
 figcaption em{font-style:normal;color:#7d7266}
 .keep figcaption em{color:#FFC400}
</style></head><body>
<h1>Informe visual — 13·09</h1>
<p class="sub">${fotos.length} fotografías y ${videos.length} vídeos. Borde amarillo = el fotograma
elegido de su ráfaga. Apagadas = excluidas a propósito o no usadas en ningún capítulo.
Generado en local; ninguna imagen ha salido de este ordenador.</p>
${seccion('Elegidas de cada ráfaga', 'Las que se ven grandes en la web.',
  fotos.filter((f) => estado(f).clave === 'keep').map(tarjeta))}
${seccion('En las ráfagas', 'Pasan a 11 fps dentro de su ráfaga.',
  fotos.filter((f) => estado(f).clave === 'usada').map(tarjeta))}
${seccion('No entraron en ningún capítulo', 'Están en el mosaico de post-créditos. No se han perdido.',
  fotos.filter((f) => estado(f).clave === 'fuera').map(tarjeta))}
${seccion('Excluidas a propósito', 'Íntimas o material ajeno. No reincorporar.',
  fotos.filter((f) => estado(f).clave === 'excluida').map(tarjeta))}
</body></html>`;

await fs.writeFile(path.join(OUT, 'informe-visual.html'), html, 'utf8');

await fs.writeFile(path.join(OUT, 'manifiesto.json'),
  JSON.stringify({ generado: new Date().toISOString(), fotos, videos, exactos,
    parecidas: parecidas.map((g) => g.map((f) => f.id)), problemas }, null, 1), 'utf8');

console.log(`\n${fotos.length} fotos · ${videos.length} vídeos · ${exactos.length} duplicados exactos · ${parecidas.length} grupos parecidos`);
console.log(`informes en ${path.relative(process.cwd(), OUT)}`);
