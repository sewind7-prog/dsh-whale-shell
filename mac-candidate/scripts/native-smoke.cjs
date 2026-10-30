'use strict';
// Native system acceptance only. Never imports main.cjs, constructs BrowserWindow,
// opens a desktop, sends a chat, or copies official DSH/user data into artifacts.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const {probe,hash,redact}=require('../src/policy.cjs'),{prepare}=require('../src/workspace.cjs'),{start,avatarView}=require('../src/host.cjs');
(async()=>{
 if(process.platform!=='darwin'||!['arm64','x64'].includes(process.arch))throw Error('Use a matching standard macOS runner');
 if(!process.env.DSH_OFFICIAL_APP)throw Error('Set DSH_OFFICIAL_APP to the verified unmodified App');
 const official=probe(process.env.DSH_OFFICIAL_APP,process.arch,{allowInspectedIntel:true});
 const signature=()=>execFileSync('/usr/bin/codesign',['--verify','--deep','--strict',official.appDir],{stdio:'pipe'});signature();
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'dsh-whale-native-')),home=path.join(root,'isolated-workspace');prepare(home,path.resolve(__dirname,'../payload'));
 const before=hash(official.asar),host=start(official,home);let api,shutdown;
 try{api=await avatarView(await host.ready);}finally{shutdown=await host.stop();}
 assert(shutdown.rootExited&&shutdown.processGroupEmpty&&shutdown.trackedChildrenRemaining===0);assert.equal(hash(official.asar),before);signature();
 const report={status:'PASS',platform:process.platform,arch:process.arch,officialVersion:official.version,officialAsarSha256:before,officialExecutableSha256:hash(official.executable),officialAppSignaturePreserved:true,originalDataImported:false,nativeLocalHostAndAvatarAPI:api,shutdown,guiAcceptance:false,mousePassThroughVerified:false,ownAppSigningOrNotarizationVerified:false,modelRequestsSent:0};
 const out=process.env.DSH_TEST_REPORT||path.join(root,'native-report.json');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2));console.log(JSON.stringify(report));
})().catch(error=>{console.error(redact(error.message));process.exitCode=1;});
