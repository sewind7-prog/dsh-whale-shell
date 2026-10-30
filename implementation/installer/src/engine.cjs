'use strict';
// Installer data plane. No network, model calls, shell commands or user-state export.
const fs=require('original-fs'),path=require('node:path'),crypto=require('node:crypto');
const {createRequire}=require('node:module'),{pathToFileURL}=require('node:url'),{spawnSync}=require('node:child_process');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const {family,nextState}=require('./state-policy.cjs');
let cfg,app,home,profile,resources,root,payload,manifest,read,YAML,boot,anchor,avatarRoot,testMode;
function say(message){console.log(JSON.stringify({type:'progress',message}));}
function json(p){return JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));}
function within(p,base){const r=path.relative(base,path.resolve(p));return r===''||(!r.startsWith('..'+path.sep)&&r!=='..'&&!path.isAbsolute(r));}
function noLinkedParents(p){for(let q=path.dirname(p);;q=path.dirname(q)){try{if(fs.lstatSync(q).isSymbolicLink())throw Error('安装目标的父目录是链接，为保护其他位置的数据，已停止：'+path.basename(q));}catch(e){if(e.code!=='ENOENT')throw e;}if(q===path.dirname(q))break;}}
function owned(p){p=path.resolve(p);if(![profile,avatarRoot,root,resources].filter(Boolean).some(r=>within(p,r)&&p!==r))throw Error('路径超出安装范围，已停止。');noLinkedParents(p);return p;}
function atomic(p,bytes){owned(p);fs.mkdirSync(path.dirname(p),{recursive:true});const temp=p+'.whale-'+crypto.randomUUID()+'.tmp';try{fs.writeFileSync(temp,bytes,{flag:'wx'});fs.renameSync(temp,p);}finally{if(fs.existsSync(temp))fs.unlinkSync(temp);}}
function save(p,value){atomic(p,Buffer.from(JSON.stringify(value,null,2)+'\n'));}
function fingerprint(p){
 try{const s=fs.lstatSync(p);if(s.isSymbolicLink())return {type:'link',target:path.resolve(path.dirname(p),fs.readlinkSync(p)).toLowerCase()};
  if(s.isFile())return {type:'file',sha256:sha(fs.readFileSync(p))};
  if(s.isDirectory()){const parts=[];const walk=(dir,rel)=>{for(const name of fs.readdirSync(dir).sort()){const q=path.join(dir,name),r=rel+'/'+name,t=fs.lstatSync(q);if(t.isSymbolicLink())parts.push(r+'@'+fs.readlinkSync(q));else if(t.isDirectory())walk(q,r);else parts.push(r+':'+sha(fs.readFileSync(q)));}};walk(p,'');return {type:'dir',sha256:sha(Buffer.from(parts.join('\n')))};}
  throw Error('不支持的文件类型。');
 }catch(e){if(e.code==='ENOENT')return {type:'absent'};throw e;}
}
function same(a,b){return JSON.stringify(a)===JSON.stringify(b);}
function remove(p){owned(p);const s=fs.lstatSync(p);if(s.isSymbolicLink()||s.isFile())fs.unlinkSync(p);else fs.rmSync(p,{recursive:true,force:false});}
function copyEntry(src,dest){const s=fs.lstatSync(src);if(s.isSymbolicLink()){let type='junction';try{if(fs.statSync(src).isFile())type='file';}catch{}fs.symlinkSync(fs.readlinkSync(src),dest,type);}else if(s.isDirectory()){fs.mkdirSync(dest);for(const name of fs.readdirSync(src))copyEntry(path.join(src,name),path.join(dest,name));}else fs.copyFileSync(src,dest,fs.constants.COPYFILE_EXCL);}
function makeOp(tx,target,source,linkTarget){
 target=owned(target);const before=fingerprint(target),after=linkTarget?{type:'link',target:path.resolve(linkTarget).toLowerCase()}:fingerprint(source);
 if(same(before,after))return;
 const n=tx.ops.length,backup=path.join(tx.dir,'before',String(n));fs.mkdirSync(path.dirname(backup),{recursive:true});
 if(before.type!=='absent'&&before.type!=='link')copyEntry(target,backup);
 tx.ops.push({target,source:source||null,linkTarget:linkTarget||null,before,after,backup,staged:target+'.whale-stage-'+tx.id+'-'+n,started:false});
}
function materialize(p,snap,source){
 if(snap.type==='absent')return;
 fs.mkdirSync(path.dirname(p),{recursive:true});
 if(snap.type==='link')fs.symlinkSync(snap.target,p,'junction');else copyEntry(source,p);
}
function rollback(tx){
 const problems=[];
 for(const op of [...tx.ops].reverse()){
  try{const now=fingerprint(op.target);if(op.started&&!same(now,op.before)){if(!same(now,op.after)&&now.type!=='absent')throw Error('安装后文件又被修改，保留现状');const recovery=op.target+'.whale-rollback-'+tx.id;if(fingerprint(recovery).type!=='absent')remove(recovery);materialize(recovery,op.before,op.backup);if(!same(fingerprint(recovery),op.before))throw Error('原文件备份校验失败');if(now.type!=='absent')remove(op.target);if(op.before.type!=='absent')fs.renameSync(recovery,op.target);if(!same(fingerprint(op.target),op.before))throw Error('原文件恢复校验失败');}if(op.staged&&fingerprint(op.staged).type!=='absent')remove(op.staged);}catch(e){problems.push(path.basename(op.target)+': '+e.message);}
 }
 tx.status=problems.length?'rollback-incomplete':'rolled-back';save(tx.file,tx);
 if(problems.length)throw Error('部分文件需要手工恢复，备份已保留：'+problems.join('；'));
}
function validatePayload(){if(manifest.platform!=='win32'||manifest.arch!=='x64'||!Array.isArray(manifest.files)||!Array.isArray(manifest.avatars))throw Error('安装资源清单无效。');for(const item of manifest.files){const p=path.resolve(payload,item.path);if(!within(p,payload)||fingerprint(p).sha256!==item.sha256)throw Error('安装资源校验失败：'+item.path);}for(const a of manifest.avatars)if(!/^[a-f0-9]{64}$/.test(a.id)||a.mime!=='image/webp'||fingerprint(path.join(payload,'avatars',a.id+'.webp')).sha256!==a.id)throw Error('头像资源校验失败。');}
function packageAt(name){const p=path.join(profile,'node_modules',name,'package.json');return fs.existsSync(p)?json(p):null;}
function validateExistingPackage(name,installed){
 const expected=json(path.join(payload,'plugins',name,'package.json'));for(const key of ['name','version','type','main','exports','dependencies','peerDependencies','dsh'])if(!require('node:util').isDeepStrictEqual(installed[key],expected[key]))throw Error('现有 '+name+' 的运行元数据已修改；为保留用户安装，未覆盖。');
 const prefix='plugins/'+name+'/';for(const item of manifest.files){if(!item.path.startsWith(prefix)||item.path===prefix+'package.json'||!(/\.(?:[cm]?js|json|ya?ml)$/.test(item.path)))continue;const p=path.join(profile,'node_modules',name,item.path.slice(prefix.length));if(fingerprint(p).sha256!==item.sha256)throw Error('现有 '+name+' 同版本运行文件缺失或已修改：'+item.path.slice(prefix.length)+'；未覆盖，请先修复该插件。');}
}
function safeAvatarRoot(botHome){if(typeof botHome!=='string'||!path.isAbsolute(botHome)||botHome.startsWith('\\\\')||path.resolve(botHome)===path.parse(botHome).root||within(path.resolve(botHome),app)||within(app,path.resolve(botHome)))throw Error('DS Bot 自定义数据目录不是安全的本地绝对路径，未修改该配置。');const p=path.join(path.resolve(botHome),'avatars');noLinkedParents(path.join(p,'index.json'));return p;}
function resolveAvatarRoot(pkg){
 const layers=[];for(const name of pkg.dsh?.profile?.bundles||[]){let dir;if(name==='ds-bot')dir=path.join(payload,'plugins','ds-bot');else {try{dir=boot.resolveBundleDir('DSH installer',name,anchor,profile);}catch{throw Error('现有配置包无法离线解析：'+name+'；未修改现有插件。');}}const info=JSON.parse(require('node:fs').readFileSync(path.join(dir,'package.json'),'utf8'));if(info.dsh?.bundle)for(const file of boot.bundlePatchPaths(dir,info.dsh.bundle))layers.push(boot.loadOverlayPatches('DSH installer',file));}
 for(const p of [path.join(profile,'cordis.patch.yml'),path.join(home,'cordis.patch.yml')])if(fs.existsSync(p))layers.push(boot.loadOverlayPatches('DSH installer',p));
 const entries=boot.composeEntries(layers),bots=[];const walk=rows=>{for(const e of rows){if(e.id==='bot')bots.push(e);if(e.group&&Array.isArray(e.config))walk(e.config);}};walk(entries);
 if(bots.length!==1||bots[0].name!=='ds-bot')throw Error('现有 bot 插件条目冲突或缺失，未覆盖用户配置。');const bot=bots[0];if(bot.disabled===true)throw Error('现有配置禁用了 DS Bot，安装已停止并保留该设置。');if(bot.config?.__jsExpr||bot.config?.home&&typeof bot.config.home!=='string')throw Error('DS Bot 使用动态 home 配置，无法安全确定头像目录，未修改。');return safeAvatarRoot(bot.config?.home??path.join(home,'bot'));
}
function existingJson(p,empty,label){if(!fs.existsSync(p))return empty;try{return json(p);}catch{throw Error(label+' 无法解析；为保护现有数据，安装已停止。');}}
function parsePatch(text){const doc=YAML.parseDocument(text);if(doc.errors.length||!YAML.isSeq(doc.contents))throw Error('cordis.patch.yml 无法解析为配置列表；未修改原文件。');return doc;}
function patchSkin(doc,add){
 const data=doc.toJSON(),found=[];
 const walk=x=>{if(!x||typeof x!=='object')return;if(x.id==='ui-skin')found.push(x);for(const v of Object.values(x))if(v&&typeof v==='object')walk(v);};walk(data);
 if(found.some(x=>x.name!=='dsh-ui-skin'))throw Error('现有 ui-skin 条目属于其他插件，安装已停止。');
 if(add&&found.length===0)doc.contents.add(doc.createNode({insert:[{id:'ui-skin',name:'dsh-ui-skin'}]}));
 if(!add){for(let i=doc.contents.items.length-1;i>=0;i--){const row=doc.contents.items[i],v=row.toJSON();if(Array.isArray(v?.insert)){const keep=v.insert.filter(x=>!(x.id==='ui-skin'&&x.name==='dsh-ui-skin'));if(keep.length!==v.insert.length){if(keep.length===0&&Object.keys(v).length===1)doc.contents.delete(i);else row.set('insert',doc.createNode(keep));}}}}
 return found.length===0;
}
function newTx(kind){
 const id=new Date().toISOString().replace(/[:.]/g,'-')+'-'+crypto.randomBytes(3).toString('hex'),dir=path.join(root,'backups',id);fs.mkdirSync(path.join(dir,'stage'),{recursive:true});
 return {version:2,id,kind,appDir:app,dataHome:home,avatarRoot,dir,file:path.join(dir,'receipt.json'),status:'prepared',ops:[],guards:[{path:path.join(home,'cordis.patch.yml'),value:fingerprint(path.join(home,'cordis.patch.yml'))},{path:path.join(app,'DeepSeek Harness.exe'),value:fingerprint(path.join(app,'DeepSeek Harness.exe'))}],payloadVersion:manifest.version,asar:path.join(resources,'app.asar')};
}
function stageJson(tx,name,obj){const p=path.join(tx.dir,'stage',name);fs.writeFileSync(p,JSON.stringify(obj,null,2)+'\n');return p;}
function readReceipt(p){if(typeof p!=='string'||!within(path.resolve(p),path.join(root,'backups')))throw Error('安装记录路径无效。');const tx=json(p);if(tx.appDir!==app||tx.dataHome!==home)throw Error('安装记录属于另一程序或数据位置，已保留原记录并停止。');return tx;}
function prepareShell(tx,desired){
 const current=fingerprint(tx.asar),supported=family(current.sha256);if(current.type!=='file'||!supported)throw Error('仅支持已核验的 DSH 0.2.1-rc.3 / rc.5 及其鲸鱼外壳，未覆盖其他程序。');
 if(desired&&family(desired)?.version!==supported.version)throw Error('DSH 版本已改变；请先重新安装对应外壳以建立当前版本备份，禁止跨版本还原。');
 tx.dshVersion=supported.version;tx.shellBefore=current.sha256;tx.shellAfter=desired||supported.whale;tx.shellBackup=path.join(tx.dir,'app.asar.before');fs.copyFileSync(tx.asar,tx.shellBackup,fs.constants.COPYFILE_EXCL);
 if(tx.shellBefore===tx.shellAfter){tx.stagedAsar=null;return;}
 const staged=path.join(resources,'.dsh-whale-'+tx.id+'.asar');owned(staged);
 if(desired){const state=json(path.join(root,'install-state.json')),base=readReceipt(state.shellBaseline||state.baseline);if(base.shellBefore!==desired||fingerprint(base.shellBackup).sha256!==base.shellBefore)throw Error('原外壳备份校验失败，未还原。');fs.copyFileSync(base.shellBackup,staged,fs.constants.COPYFILE_EXCL);}
 else {const candidate=path.join(tx.dir,'stage','app.candidate.asar');const result=spawnSync(process.execPath,['--expose-internals',path.join(payload,'patch-shell.cjs'),tx.asar,candidate],{env:{...process.env,ELECTRON_RUN_AS_NODE:'1',ELECTRON_NO_ASAR:'1'},windowsHide:true,encoding:'utf8',timeout:60000});if(result.status!==0){fs.writeFileSync(path.join(tx.dir,'patch-error.txt'),result.stderr||String(result.error||result.status));throw Error('生成外壳失败，未修改原程序。'+String(result.error?.message||result.stderr||('退出码 '+result.status)).trim().slice(-1400));}if(fingerprint(candidate).sha256!==supported.whale)throw Error('候选外壳校验失败。');if(path.parse(candidate).root.toLowerCase()===path.parse(staged).root.toLowerCase())fs.renameSync(candidate,staged);else{fs.copyFileSync(candidate,staged,fs.constants.COPYFILE_EXCL);fs.unlinkSync(candidate);}}
 if(fingerprint(staged).sha256!==tx.shellAfter)throw Error('生成的外壳校验失败。');tx.stagedAsar=staged;
}
async function prepareInstall(){
 validatePayload();const pending=path.join(root,'pending.json');if(fs.existsSync(pending))throw Error('检测到未完成的安装，请先点击“修复上次未完成的安装”。');
 const previousState=path.join(root,'install-state.json');if(fs.existsSync(previousState)){const state=json(previousState);readReceipt(state.profileBaseline||state.baseline);readReceipt(state.shellBaseline||state.baseline);}
 const tx=newTx('install'),store=path.join(profile,'plugins','dsh-whale-pack',manifest.version),initial=path.join(tx.dir,'stage','initial');
 boot.initProfile(initial,['@deepseek-ai/dsh-base','@deepseek-ai/dsh-web-app']);
 const manifestPath=path.join(profile,'package.json'),patchPath=path.join(profile,'cordis.patch.yml');
 const oldManifest=existingJson(manifestPath,json(path.join(initial,'package.json')),'插件清单');if(!fs.existsSync(manifestPath))oldManifest.name='dsh-profile-desktop';
 const pkg=structuredClone(oldManifest);if(!pkg||typeof pkg!=='object'||Array.isArray(pkg)||pkg.dependencies&&(typeof pkg.dependencies!=='object'||Array.isArray(pkg.dependencies))||pkg.dsh?.profile?.bundles&&!Array.isArray(pkg.dsh.profile.bundles))throw Error('插件清单格式不正确，未修改。');pkg.dependencies={...pkg.dependencies};pkg.dsh={...pkg.dsh,profile:{...pkg.dsh?.profile,bundles:[...(pkg.dsh?.profile?.bundles||['@deepseek-ai/dsh-base','@deepseek-ai/dsh-web-app'])]}};
 const oldPatch=fs.existsSync(patchPath)?fs.readFileSync(patchPath,'utf8'):fs.readFileSync(path.join(initial,'cordis.patch.yml'),'utf8'),patch=parsePatch(oldPatch);
 tx.originalSkinDependency=Object.hasOwn(pkg.dependencies,'dsh-ui-skin')?{exists:true,value:pkg.dependencies['dsh-ui-skin']}:{exists:false};tx.insertedSkin=patchSkin(patch,true);
 for(const [name,version] of [['ds-bot','0.2.4'],['deep-view','0.1.0']]){
  const installed=packageAt(name);if(installed&&installed.version!==version&&!(name==='ds-bot'&&/^0\.2\.[0-3]$/.test(installed.version)))throw Error('现有 '+name+' '+installed.version+' 不在本安装包兼容范围内，未降级或覆盖。');
  if(installed?.version===version)validateExistingPackage(name,installed);
  if(!installed||installed.version!==version){const src=path.join(payload,'plugins',name),dest=path.join(store,name);makeOp(tx,dest,src);makeOp(tx,path.join(profile,'node_modules',name),null,dest);pkg.dependencies[name]='file:'+path.relative(profile,dest).replaceAll('\\','/');}
 }
 const skinStore=path.join(store,'dsh-ui-skin');makeOp(tx,skinStore,path.join(payload,'plugins','dsh-ui-skin'));makeOp(tx,path.join(profile,'node_modules','dsh-ui-skin'),null,skinStore);pkg.dependencies['dsh-ui-skin']='file:'+path.relative(profile,skinStore).replaceAll('\\','/');tx.skinSpec=pkg.dependencies['dsh-ui-skin'];tx.skinStore=skinStore;
 if(!pkg.dsh.profile.bundles.includes('ds-bot'))pkg.dsh.profile.bundles.push('ds-bot');
 avatarRoot=resolveAvatarRoot(pkg);tx.avatarRoot=avatarRoot;
 makeOp(tx,manifestPath,stageJson(tx,'package.json',pkg));const patchStage=path.join(tx.dir,'stage','cordis.patch.yml');fs.writeFileSync(patchStage,patch.toString());makeOp(tx,patchPath,patchStage);
 if(!fs.existsSync(path.join(profile,'pnpm-workspace.yaml')))makeOp(tx,path.join(profile,'pnpm-workspace.yaml'),path.join(initial,'pnpm-workspace.yaml'));
 const indexPath=path.join(avatarRoot,'index.json'),index=existingJson(indexPath,{version:1,items:[]},'头像库索引');if(!Array.isArray(index.items))throw Error('头像库索引格式不正确，未修改。');
 let added=0;for(const entry of manifest.avatars){const known=index.items.find(e=>e?.id===entry.id),dest=path.join(avatarRoot,'files',entry.id+'.webp');if(known){if(known.mime!=='image/webp')throw Error('现有头像索引类型冲突，未修改。');if(fingerprint(dest).type==='absent')makeOp(tx,dest,path.join(payload,'avatars',entry.id+'.webp'));else if(fingerprint(dest).sha256!==entry.id)throw Error('现有同 ID 头像文件被修改，未覆盖。');continue;}if(index.items.length>=500)throw Error('头像库已达到500项限制，未修改。');if(fingerprint(dest).type!=='absent'&&fingerprint(dest).sha256!==entry.id)throw Error('头像文件名冲突，未覆盖原文件。');makeOp(tx,dest,path.join(payload,'avatars',entry.id+'.webp'));index.items.push({...entry,createdAt:Date.now()+added});added++;}
 if(added)makeOp(tx,indexPath,stageJson(tx,'avatar-index.json',index));tx.avatarsAdded=added;tx.avatarTotal=index.items.length;
 say('正在备份外壳并生成安装文件……');prepareShell(tx);save(tx.file,tx);save(pending,{receipt:tx.file});say('安装准备完成。');return tx;
}
function prepareRestore(){
 if(fs.existsSync(path.join(root,'pending.json')))throw Error('请先修复上次未完成的安装。');
 const statePath=path.join(root,'install-state.json');if(!fs.existsSync(statePath))throw Error('尚无本安装器的安装记录。');const state=json(statePath);if(state.restored)throw Error('已还原安装前外壳；DS Bot 与头像仍保留。');
 const base=readReceipt(state.profileBaseline||state.baseline),shellBase=readReceipt(state.shellBaseline||state.baseline),latest=readReceipt(state.latest);if(family(shellBase.shellBefore)?.version!==family(fingerprint(path.join(resources,'app.asar')).sha256)?.version)throw Error('DSH 版本已改变；请先重新安装当前版本外壳再还原，未使用旧版本备份。');const tx=newTx('restore'),pkg=existingJson(path.join(profile,'package.json'),null,'插件清单');if(!pkg)throw Error('插件清单缺失，未还原。');
 if(pkg.dependencies?.['dsh-ui-skin']!==latest.skinSpec)throw Error('皮肤依赖已被其他操作修改，保留当前设置。');
 if(base.originalSkinDependency.exists)pkg.dependencies['dsh-ui-skin']=base.originalSkinDependency.value;else delete pkg.dependencies['dsh-ui-skin'];
 makeOp(tx,path.join(profile,'package.json'),stageJson(tx,'package.json',pkg));
 if(base.insertedSkin){const p=path.join(profile,'cordis.patch.yml'),doc=parsePatch(fs.readFileSync(p,'utf8'));patchSkin(doc,false);const s=path.join(tx.dir,'stage','cordis.patch.yml');fs.writeFileSync(s,doc.toString());makeOp(tx,p,s);}
 const original=base.ops.find(o=>o.target===path.join(profile,'node_modules','dsh-ui-skin'));
 if(original){const current=fingerprint(original.target),expected={type:'link',target:path.resolve(latest.skinStore).toLowerCase()};if(!same(current,expected))throw Error('皮肤插件路径已被其他操作修改，未覆盖。');const n=tx.ops.length,bak=path.join(tx.dir,'before',String(n));fs.mkdirSync(path.dirname(bak),{recursive:true});if(current.type!=='link'&&current.type!=='absent')copyEntry(original.target,bak);tx.ops.push({target:original.target,source:original.backup,linkTarget:null,before:current,after:original.before,backup:bak,started:false,restoreOriginal:true});}
 prepareShell(tx,shellBase.shellBefore);save(tx.file,tx);save(path.join(root,'pending.json'),{receipt:tx.file});return tx;
}
function loadTx(){const p=path.resolve(cfg.receipt||json(path.join(root,'pending.json')).receipt);if(!within(p,path.join(root,'backups')))throw Error('安装记录路径无效。');const tx=json(p);if(tx.appDir!==app||tx.dataHome!==home||tx.file!==p||path.resolve(tx.dir)!==path.dirname(p))throw Error('安装记录目录不符。');if(tx.asar!==path.join(resources,'app.asar')||![tx.shellBefore,tx.shellAfter].includes(fingerprint(tx.asar).sha256))throw Error('程序版本在事务期间已改变，保留备份与当前数据，未执行旧事务。');if(tx.avatarRoot)avatarRoot=safeAvatarRoot(path.dirname(tx.avatarRoot));for(const op of tx.ops){owned(op.target);if(op.staged)owned(op.staged);if(!within(op.backup,tx.dir))throw Error('备份路径无效。');}return tx;}
function applyTx(){
 const tx=loadTx();if(fingerprint(tx.asar).sha256!==tx.shellAfter)throw Error('外壳尚未切换到目标版本。');
 try{for(const g of tx.guards||[])if(!same(fingerprint(g.path),g.value))throw Error('配置在安装期间被其他程序修改，未继续。');for(let n=0;n<tx.ops.length;n++){const op=tx.ops[n];if(!same(fingerprint(op.target),op.before))throw Error('文件在安装期间被其他程序修改：'+path.basename(op.target));op.staged||=op.target+'.whale-stage-'+tx.id+'-'+n;save(tx.file,tx);owned(op.staged);materialize(op.staged,op.after,op.source);if(!same(fingerprint(op.staged),op.after))throw Error('候选文件校验失败：'+path.basename(op.target));if(testMode&&cfg.crashBeforeOp===n+1)process.exit(81);op.started=true;save(tx.file,tx);if(op.before.type!=='absent')remove(op.target);if(testMode&&cfg.crashAfterRemoveOp===n+1)process.exit(82);if(op.after.type!=='absent')fs.renameSync(op.staged,op.target);if(!same(fingerprint(op.target),op.after))throw Error('写入校验失败：'+path.basename(op.target));if(testMode&&cfg.failAfterOp===n+1)throw Error('独立测试：模拟安装中断');}tx.status='applied';save(tx.file,tx);return tx;}catch(e){rollback(tx);throw e;}
}
function finalize(){const tx=loadTx();if(!['applied','complete'].includes(tx.status)||fingerprint(tx.asar).sha256!==tx.shellAfter||tx.ops.some(o=>!same(fingerprint(o.target),o.after)))throw Error('安装尚未完成，不能标记成功。');const p=path.join(root,'install-state.json'),old=fs.existsSync(p)?json(p):null;save(p,nextState(old,tx,readReceipt));if(testMode&&cfg.crashFinalizeAfterState)process.exit(83);tx.status='complete';save(tx.file,tx);const pending=path.join(root,'pending.json');if(fs.existsSync(pending))fs.unlinkSync(pending);return tx;}
async function main(){
 cfg=json(process.argv[2]);app=path.resolve(cfg.appDir);home=path.resolve(cfg.dataHome);profile=path.join(home,'profiles','desktop');resources=path.join(app,'resources');root=path.join(home,'whale-shell-installer');payload=path.resolve(cfg.payloadDir);manifest=json(path.join(payload,'manifest.json'));
 if(process.platform!=='win32'||!fs.existsSync(path.join(app,'DeepSeek Harness.exe'))||!fs.existsSync(path.join(resources,'app.asar')))throw Error('请选择已安装的 Windows DSH 文件夹。');
 const supported=family(fingerprint(path.join(resources,'app.asar')).sha256);if(!supported||fingerprint(path.join(app,'DeepSeek Harness.exe')).sha256!==supported.exe)throw Error('当前 DSH 程序或外壳散列不匹配，仅支持已核验的 Windows x64 0.2.1-rc.3 / rc.5，未修改程序。');
 if(home===path.parse(home).root||app===home||within(app,home)||within(home,resources))throw Error('数据目录与程序目录不安全或重叠，安装已停止。');
 noLinkedParents(path.join(profile,'package.json'));noLinkedParents(path.join(root,'pending.json'));noLinkedParents(path.join(resources,'app.asar'));fs.mkdirSync(root,{recursive:true});anchor=path.join(resources,'app.asar','dsh','package.json');read=createRequire(anchor);YAML=read('yaml');boot=await import(pathToFileURL(read.resolve('@deepseek-ai/dsh-app-boot')).href);avatarRoot=safeAvatarRoot(path.join(home,'bot'));testMode=cfg.testMode===true&&fs.existsSync(path.join(app,'DSH-WHALE-TEST-FIXTURE'))&&within(home,path.dirname(app));
 validatePayload();let tx;if(cfg.action==='prepare')tx=await prepareInstall();else if(cfg.action==='prepare-restore')tx=prepareRestore();else if(cfg.action==='apply')tx=applyTx();else if(cfg.action==='finalize')tx=finalize();else if(cfg.action==='rollback'){tx=loadTx();const statePath=path.join(root,'install-state.json');if(fs.existsSync(statePath)&&json(statePath).latest===tx.file&&['applied','complete'].includes(tx.status))throw Error('安装完成记录已提交，请完成 finalize 而非回退已完成的安装。');rollback(tx);}else if(cfg.action==='clear-pending'){const p=path.join(root,'pending.json');if(fs.existsSync(p)){tx=loadTx();if(!['rolled-back','complete'].includes(tx.status))throw Error('尚未恢复或完成安装，不能清除恢复记录。');if(tx.stagedAsar&&fingerprint(tx.stagedAsar).type!=='absent')remove(tx.stagedAsar);fs.unlinkSync(p);}return;}else throw Error('未知安装操作。');
 console.log(JSON.stringify({type:'result',receipt:tx.file,shellBefore:tx.shellBefore,shellAfter:tx.shellAfter,shellBackup:tx.shellBackup,stagedAsar:tx.stagedAsar,avatarsAdded:tx.avatarsAdded,avatarTotal:tx.avatarTotal,kind:tx.kind}));
}
main().catch(e=>{console.log(JSON.stringify({type:'error',message:e.message}));process.exitCode=1;});
