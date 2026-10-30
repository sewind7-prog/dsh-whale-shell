'use strict';
const path=require('node:path'),{spawn,execFileSync}=require('node:child_process'),{localUrl,childEnv,redact}=require('./policy.cjs');
function args(official){return['--expose-internals',path.join(official.asar,'dsh/node_modules/@deepseek-ai/dsh-desktop-host/lib/cli.js'),'--profile','web','--host','127.0.0.1','--port','0','--no-open'];}
function processTable(){return execFileSync('/bin/ps',['-axo','pid=,ppid=,pgid='],{encoding:'utf8'}).trim().split('\n').map(line=>{const[pid,parent,group]=line.trim().split(/\s+/).map(Number);return{pid,parent,group};});}
function stopper(child,grouped,{timeoutMs=10000,pollMs=150}={}){let pending;const attempt=async()=>{
 if(!child.pid||child.pid<2)return{rootExited:true,processGroupEmpty:true,trackedChildrenRemaining:0};
 const owned=new Set([child.pid]);if(grouped){const rows=processTable();let changed;do{changed=false;for(const row of rows)if(owned.has(row.parent)&&!owned.has(row.pid)){owned.add(row.pid);changed=true;}}while(changed);}
 try{if(child.exitCode===null&&child.signalCode===null)child.kill('SIGTERM');}catch(error){if(error.code!=='ESRCH')throw error;}
 const until=Date.now()+timeoutMs;let remaining=[];while(Date.now()<until){
  const rootExited=child.exitCode!==null||child.signalCode!==null;
  remaining=grouped?processTable().filter(row=>owned.has(row.pid)||row.group===child.pid):rootExited?[]:[{pid:child.pid}];
  if(rootExited&&remaining.length===0)return{rootExited:true,processGroupEmpty:true,trackedChildrenRemaining:0,trackedProcessCount:owned.size,onlyOwnedRootSignaled:true};
  await new Promise(resolve=>setTimeout(resolve,pollMs));
 }
 throw Error('Candidate host shutdown incomplete: '+remaining.length+' owned/tracked processes remain. No unrelated DSH was signaled.');
};return()=>{if(!pending)pending=attempt().catch(error=>{pending=undefined;throw error;});return pending;};}
function start(official,home,{finderPath=false}={}){
 const grouped=process.platform==='darwin';
 const child=spawn(official.executable,args(official),{env:childEnv(home,process.env,{finderPath}),cwd:home,detached:grouped,stdio:['ignore','pipe','pipe'],windowsHide:true});
 const stop=stopper(child,grouped);let stdout='',stderr='',settled=false;
 const ready=new Promise((resolve,reject)=>{
  const fail=error=>{if(settled)return;settled=true;clearTimeout(timer);stop().catch(()=>{});reject(error);};
  const timer=setTimeout(()=>fail(Error('Isolated DSH host startup timed out. '+redact(stderr).slice(-1600))),60000);
  child.stdout.on('data',data=>{stdout=(stdout+data).slice(-100000);const match=stdout.match(/dsh web:\s+(http:\/\/127\.0\.0\.1:\d+\/[^\s\x1b]*)/);if(match&&!settled){try{const url=localUrl(match[1]);settled=true;clearTimeout(timer);resolve(url.href);}catch(error){fail(error);}}});
  child.stderr.on('data',data=>{stderr=(stderr+data).slice(-16000);});
  child.on('error',error=>fail(Error(redact(error.message))));child.on('exit',code=>fail(Error('Isolated DSH host exited '+code+'. '+redact(stderr).slice(-1600))));
 });
 return{child,ready,stop};
}
module.exports={start,args,stopper};
