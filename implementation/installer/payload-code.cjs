'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const code=['engine.cjs','patch-shell.cjs','supported-shells.cjs','state-policy.cjs'];
const licenseFiles=['DeepSeek-Harness-LICENSE.txt','Project-MIT.txt'];
const owned=[...code,...licenseFiles.map(name=>'licenses/'+name),'THIRD-PARTY-NOTICES.txt'];
const digest=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function sync(payload,manifest){
 for(const item of manifest.files||[])if(!owned.includes(item.path)&&digest(path.join(payload,item.path))!==item.sha256)throw Error('Unexpected payload modification: '+item.path);
 for(const name of code)fs.copyFileSync(path.join(__dirname,'src',name),path.join(payload,name));
 fs.mkdirSync(path.join(payload,'licenses'),{recursive:true});for(const name of licenseFiles)fs.copyFileSync(path.join(__dirname,'licenses',name),path.join(payload,'licenses',name));
 fs.writeFileSync(path.join(payload,'THIRD-PARTY-NOTICES.txt'),'Project code and artwork are offered under the included project MIT license.\nDS Bot 0.2.4 and deep-view 0.1.0 remain Apache-2.0; original LICENSE and README files are included under plugins/.\nThe patch contains matching excerpts of DeepSeek Harness (MIT, Copyright (c) 2026 DeepSeek); its complete original license is included under licenses/.\nThe DSH main program and full ASAR are not redistributed. The user must have a byte-verified supported DSH desktop application installed.\n');
 const supported=require('./src/supported-shells.cjs');for(const row of supported)for(const key of ['stock','whale','exe'])if(!/^[a-f0-9]{64}$/.test(row[key]||''))throw Error('Unpinned supported-shell checksum');
 delete manifest.dshVersion;manifest.dshVersions=supported.map(row=>row.version);manifest.supportedShells=supported;
 manifest.files=(manifest.files||[]).filter(item=>!owned.includes(item.path)).concat(owned.map(p=>({path:p,sha256:digest(path.join(payload,p))}))).sort((a,b)=>a.path.localeCompare(b.path));
 return manifest;
}
module.exports={sync,owned};
