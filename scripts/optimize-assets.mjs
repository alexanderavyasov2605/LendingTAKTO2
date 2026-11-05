import sharp from 'sharp';
import { readdir, mkdir, copyFile, stat, writeFile } from 'node:fs/promises';
import { resolve, join, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const source = join(root, 'TAKTO-assets');
const destination = join(root, 'public', 'assets');
await mkdir(destination, { recursive: true });
const images = (await readdir(source)).filter((name) => extname(name).toLowerCase() === '.png').sort();
const report = [];

// Keep memory bounded and preserve all original PNGs.
for (const name of images) {
  const input = join(source, name);
  const outputName = `${basename(name, '.png')}.webp`;
  const output = join(destination, outputName);
  const info = await sharp(input)
    .rotate()
    .resize({ width: name === '24-hero.png' ? 1536 : 800, withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toFile(output);
  report.push({ source: name, output: outputName, width: info.width, height: info.height, originalBytes: (await stat(input)).size, bytes: info.size });
}

for (const name of ['vinyl', 'windows']) {
  const input = join(root, 'assets-generated', `${name}.png`);
  try {
    await stat(input);
  } catch (error) {
    if (error.code === 'ENOENT') continue;
    throw error;
  }
  const outputName = `${name}.webp`;
  const info = await sharp(input).rotate().resize({ width: 800, withoutEnlargement: true }).webp({ quality: 82, effort: 5 }).toFile(join(destination, outputName));
  report.push({ source: `assets-generated/${name}.png`, output: outputName, width: info.width, height: info.height, originalBytes: (await stat(input)).size, bytes: info.size });
}

const iconDirectory = join(destination, 'icons');
await mkdir(iconDirectory, { recursive: true });
for (const name of await readdir(join(source, 'icons'))) {
  if (extname(name) === '.svg') await copyFile(join(source, 'icons', name), join(iconDirectory, name));
}
await mkdir(join(root, 'docs'), { recursive: true });
await writeFile(join(root, 'docs', 'asset-optimization.json'), `${JSON.stringify(report, null, 2)}\n`);
const originalBytes = report.reduce((sum, item) => sum + item.originalBytes, 0);
const bytes = report.reduce((sum, item) => sum + item.bytes, 0);
console.log(`Optimized ${report.length} images: ${(originalBytes / 1024 / 1024).toFixed(2)} MB → ${(bytes / 1024 / 1024).toFixed(2)} MB (${Math.round((1 - bytes / originalBytes) * 100)}% smaller).`);
