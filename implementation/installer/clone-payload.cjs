'use strict';
// Reuse verified offline assets for an installer-only release; do not re-encode avatars.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const [fromArg,toArg,version]=process.argv.slice(2);if(!fromArg||!toArg||!/^\d+\.\d+\.\d+$/.test(version||''))throw Error('Usage: node clone-payload.cjs existing-payload new-payload new-version');
const from=path.resolve(fromArg),to=path.resolve(toArg),hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'),old=JSON.parse(fs.readFileSync(path.join(from,'manifest.json')));
if(fs.existsSync(to))throw Error('Output exists; do not replace an existing payload.');
for(const item of old.files){const p=path.resolve(from,item.path);if(!p.startsWith(from+path.sep)||hash(p)!==item.sha256)throw Error('Source payload checksum mismatch: '+item.path);}
fs.mkdirSync(to,{recursive:true});for(const item of old.files){const dest=path.resolve(to,item.path);if(!dest.startsWith(to+path.sep))throw Error('Unsafe payload path');fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(path.join(from,item.path),dest,fs.constants.COPYFILE_EXCL);}
const skinPath=path.join(to,'plugins/dsh-ui-skin/package.json'),skin=JSON.parse(fs.readFileSync(skinPath));skin.version=version;fs.writeFileSync(skinPath,JSON.stringify(skin,null,2));
if(version!=='1.0.3')throw Error('This source stages only the 1.0.3 installer code.');
const manifest=require('./payload-code.cjs').sync(to,{...old,version,files:old.files.map(item=>({...item,sha256:hash(path.join(to,item.path))}))});fs.writeFileSync(path.join(to,'manifest.json'),JSON.stringify(manifest,null,2));console.log(JSON.stringify({payload:to,version,avatars:manifest.avatars.length,avatarBytesReused:true,engineSha256:hash(path.join(to,'engine.cjs'))}));
