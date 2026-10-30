'use strict';
// Native system acceptance only. Never imports main.cjs, constructs BrowserWindow,
// opens a desktop, sends a chat, or copies official DSH/user data into artifacts.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const {probe,hash,redact,FINDER_PATH}=require('../src/policy.cjs'),{prepare}=require('../src/workspace.cjs'),{start}=require('../src/host.cjs'),{inspectSurface}=require('../src/native-surface.cjs');
const {serializeError}=require('./download-diagnostics.cjs');
(async()=>{
 if(process.platform!=='darwin'||!['arm64','x64'].includes(process.arch))throw Error('Use a matching standard macOS runner');
 if(!process.env.DSH_OFFICIAL_APP)throw Error('Set DSH_OFFICIAL_APP to the verified unmodified App');
 const official=probe(process.env.DSH_OFFICIAL_APP,process.arch,{allowInspectedIntel:true});
 const signature=()=>execFileSync('/usr/bin/codesign',['--verify','--deep','--strict',official.appDir],{stdio:'pipe'});signature();
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'dsh-whale-native-')),home=path.join(root,'isolated-workspace');prepare(home,path.resolve(__dirname,'../payload'));
 const before=hash(official.asar),skin=path.join(home,'profiles/web/node_modules/dsh-ui-skin/lib/client.js'),skinBefore=hash(skin),skinSource=fs.readFileSync(skin);
 const host=start(official,home,{finderPath:true});let api,shutdown;const errors=[];
 try{api=await inspectSurface(await host.ready,skinSource);}catch(error){errors.push('Native surface: '+JSON.stringify(serializeError(error)));}
 try{shutdown=await host.stop();assert(shutdown.rootExited&&shutdown.processGroupEmpty&&shutdown.trackedChildrenRemaining===0);}catch(error){errors.push('Host shutdown: '+JSON.stringify(serializeError(error)));}
 try{assert.equal(hash(skin),skinBefore);assert.equal(hash(official.asar),before);signature();}catch(error){errors.push('Original/signature integrity: '+JSON.stringify(serializeError(error)));}
 if(errors.length)throw Error(errors.join('; '));assert.equal(api.skinSourceSha256,skinBefore);
 const report={status:'PASS',platform:process.platform,arch:process.arch,officialVersion:official.version,officialAsarSha256:before,officialExecutableSha256:hash(official.executable),officialAppSignaturePreserved:true,originalDataImported:false,nativeHostPath:FINDER_PATH,nativeHostFinderPath:true,nativeLocalHostAndAvatarAPI:api,shutdown,guiAcceptance:false,mousePassThroughVerified:false,ownAppSigningOrNotarizationVerified:false,modelRequestsSent:0};
 const out=process.env.DSH_TEST_REPORT||path.join(root,'native-report.json');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2));console.log(JSON.stringify(report));
})().catch(error=>{console.error(redact(error.message));process.exitCode=1;});
