const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=__dirname,payload=path.resolve(process.argv[2]||path.join(root,'build','payload-1.0.2')),manifest=path.join(payload,'manifest.json'),m=JSON.parse(fs.readFileSync(manifest));
fs.copyFileSync(path.join(root,'src','engine.cjs'),path.join(payload,'engine.cjs'));
for(const item of m.files)if(item.path==='engine.cjs')item.sha256=crypto.createHash('sha256').update(fs.readFileSync(path.join(payload,item.path))).digest('hex');else if(item.sha256!==crypto.createHash('sha256').update(fs.readFileSync(path.join(payload,item.path))).digest('hex'))throw Error('Unexpected payload modification: '+item.path);
fs.writeFileSync(manifest,JSON.stringify(m,null,2));
