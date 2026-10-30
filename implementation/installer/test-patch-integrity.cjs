'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function parse(p){const bytes=fs.readFileSync(p);return{bytes,header:JSON.parse(bytes.subarray(16,16+bytes.readUInt32LE(12))),body:bytes.subarray(8+bytes.readUInt32LE(4))};}
function entry(header,name){return name.split('/').reduce((at,key)=>at.files[key],header);}
const checks=[];
for(const version of ['rc3','rc5']){
 const spec=require('./src/supported-shells.cjs').find(row=>row.version==='0.2.1-'+version.replace('rc','rc.'));
 const stock=process.env['DSH_'+version.toUpperCase()+'_STOCK_ASAR'];if(!stock)throw Error('Set DSH_'+version.toUpperCase()+'_STOCK_ASAR');
 const patched=path.join(__dirname,'build',version+'-patch-proof-1.0.3/candidate.asar'),before=parse(stock),after=parse(patched);assert.equal(sha(before.bytes),spec.stock);assert.equal(sha(after.bytes),spec.whale);assert(after.body.subarray(0,before.body.length).equals(before.body));
 const changed=new Set(['lib/main.js','lib/preload-app.cjs']);let preserved=0;function walk(node,prefix=''){for(const[name,value]of Object.entries(node.files||{})){const p=prefix?prefix+'/'+name:name;if(value.files)walk(value,p);else if(!changed.has(p)){assert.deepEqual(entry(after.header,p),value,p+' metadata changed');preserved++;}}}walk(before.header);
 for(const name of changed){const value=entry(after.header,name),bytes=after.body.subarray(Number(value.offset),Number(value.offset)+value.size);assert.equal(sha(bytes),value.integrity.hash);const blocks=[];for(let i=0;i<bytes.length;i+=value.integrity.blockSize)blocks.push(sha(bytes.subarray(i,i+value.integrity.blockSize)));assert.deepEqual(blocks,value.integrity.blocks);}
 checks.push({version:spec.version,originalSha256:spec.stock,patchedSha256:spec.whale,originalBodyPreserved:true,preservedEntries:preserved,changedEntries:[...changed],changedEntryIntegrityVerified:true});
}
const out=path.join(__dirname,'build/patch-integrity-1.0.3.json');fs.writeFileSync(out,JSON.stringify({status:'PASS',checks},null,2));console.log(JSON.stringify({status:'PASS',checks,report:out}));
