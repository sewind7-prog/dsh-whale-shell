import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const refs = path.join(root, 'refs');
const manifest = JSON.parse(fs.readFileSync(path.join(refs, 'assets.json'), 'utf8'));
const cropped = JSON.parse(fs.readFileSync(path.join(refs, 'icons.cropped.json'), 'utf8'));
function png(name) {
  const entry = manifest.assets[name];
  if (!entry || !entry.path || !entry.sha256) throw new Error(`Missing asset manifest entry: ${name}`);
  const filename = path.resolve(refs, entry.path);
  if (!filename.startsWith(path.resolve(refs) + path.sep)) throw new Error(`Asset outside refs: ${name}`);
  const bytes = fs.readFileSync(filename);
  if (!bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) throw new Error(`Not a PNG: ${name}`);
  const hash = crypto.createHash('sha256').update(bytes).digest('hex');
  if (hash !== entry.sha256.toLowerCase()) throw new Error(`Asset checksum mismatch: ${name}`);
  return `data:image/png;base64,${cropped[name] || bytes.toString('base64')}`;
}
const assets = {
  shell: png('whale-shell'), paper: png('chat-paper'),
  menuApp: png('menu-app'), menuEdit: png('menu-edit'),
  inputAdd: png('input-add'), inputMicrophone: png('input-microphone'),
  minimize: png('window-minimize'), maximize: png('window-maximize'), close: png('window-close'),
  bots: Array.from({ length: 10 }, (_, i) => png(`bot-${String(i + 1).padStart(2, '0')}`)),
};
const template = fs.readFileSync(path.join(root, 'client.template.js'), 'utf8');
const marker = '__ASSETS_JSON__';
if (template.indexOf(marker) < 0 || template.indexOf(marker) !== template.lastIndexOf(marker)) throw new Error('Expected one assets marker');
const output = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, 'dist', 'client.js');
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, template.replace(marker, JSON.stringify(assets)), 'utf8');
console.log(`Built ${output} (${fs.statSync(output).size} bytes)`);
