import { readFile, writeFile } from 'node:fs/promises';

const path = new URL('../public/audio/neural/manifest.json', import.meta.url);
const manifest = JSON.parse(await readFile(path, 'utf8'));
delete manifest.clips?.['lesson-04-stage-23'];
await writeFile(path, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log('Audio manifest cleaned');
