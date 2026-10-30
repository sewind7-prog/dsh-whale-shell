const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=__dirname,payload=path.resolve(process.argv[2]||path.join(root,'build','payload-1.0.3')),manifest=path.join(payload,'manifest.json'),m=JSON.parse(fs.readFileSync(manifest));
if(m.version!=='1.0.3')throw Error('This updater only stages 1.0.3; preserve older payloads.');
fs.writeFileSync(manifest,JSON.stringify(require('./payload-code.cjs').sync(payload,m),null,2));
