'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const {pathToFileURL}=require('node:url'),{serializeError,traceDownloader}=require('./download-diagnostics.cjs');
const {SUPPORTED,INSPECTED_INTEL,inside}=require('../src/policy.cjs');
const copy=(a,b)=>{const s=fs.lstatSync(a);if(s.isSymbolicLink())throw Error('Source links not allowed');if(s.isDirectory()){fs.mkdirSync(b);for(const n of fs.readdirSync(a))copy(path.join(a,n),path.join(b,n));}else fs.copyFileSync(a,b,fs.constants.COPYFILE_EXCL);};
(async()=>{
 if(process.platform!=='darwin'||!['arm64','x64'].includes(process.arch))throw Error('Build on a matching standard macOS runner');
 const root=path.resolve(__dirname,'..'),out=path.join(root,'build');if(fs.existsSync(out))throw Error('Use a fresh build directory');
 const native=JSON.parse(fs.readFileSync(process.env.DSH_NATIVE_REPORT||path.join(root,'results/native-report.json'))),spec=SUPPORTED[process.arch]||INSPECTED_INTEL;
 if(native.status!=='PASS'||native.arch!==process.arch||native.officialAsarSha256!==spec.asarSha256||native.nativeLocalHostAndAvatarAPI?.total!==36||!native.officialAppSignaturePreserved)throw Error('Matching native host acceptance must pass before packaging this architecture');
 fs.mkdirSync(out);const source=path.join(out,'app-source');fs.mkdirSync(source);
 // Only our code/assets and offline plugins. Official inputs and test data cannot enter the App.
 for(const name of ['src','payload','assets','package.json','LICENSE','THIRD_PARTY_NOTICES.md','third_party'])copy(path.join(root,name),path.join(source,name));
 fs.writeFileSync(path.join(source,'src/build-status.json'),JSON.stringify({nativeValidatedArchitectures:[process.arch],nativeHostOnly:true,guiValidated:false}));
 const iconset=path.join(out,'Whale.iconset');fs.mkdirSync(iconset);
 for(const size of [16,32,128,256,512])for(const retina of [false,true])execFileSync('/usr/bin/sips',['-z',String(size*(retina?2:1)),String(size*(retina?2:1)),path.join(root,'assets/whale-head.png'),'--out',path.join(iconset,'icon_'+size+'x'+size+(retina?'@2x':'')+'.png')],{stdio:'pipe'});
 const icon=path.join(out,'Whale.icns');execFileSync('/usr/bin/iconutil',['-c','icns',iconset,'-o',icon],{stdio:'pipe'});
 const {packager}=await import('@electron/packager'),config=JSON.parse(fs.readFileSync(path.join(root,'package.json')));
 const resolver=path.join(path.dirname(require.resolve('@electron/get')),'downloader-resolver.js');
 const {getDownloaderForSystem}=await import(pathToFileURL(resolver).href);
 const downloader=traceDownloader(await getDownloaderForSystem());
 const apps=await packager({dir:source,out:path.join(out,'packaged'),name:'DSH Whale Candidate',appBundleId:'org.dshwhale.isolatedcandidate',appCategoryType:'public.app-category.productivity',platform:'darwin',arch:process.arch,electronVersion:config.config.electronVersion,download:{downloader},icon,asar:true,prune:true,overwrite:false,osxSign:false,osxNotarize:false});
 const artifacts=path.join(out,'artifacts');fs.mkdirSync(artifacts);
 for(const built of apps){
  const appPath=path.resolve(built,'DSH Whale Candidate.app');if(!inside(appPath,out))throw Error('Refusing to sign any App outside this new build');
  const plist=path.join(appPath,'Contents/Info.plist'),id=execFileSync('/usr/bin/plutil',['-extract','CFBundleIdentifier','raw','-o','-',plist],{encoding:'utf8'}).trim();
  if(id!=='org.dshwhale.isolatedcandidate')throw Error('Refusing to sign a different bundle identity');
  const xml=execFileSync('/usr/bin/plutil',['-convert','xml1','-o','-',plist],{encoding:'utf8'});if(/<string>dsh<\/string>/.test(xml))throw Error('Candidate must not register the official dsh URL scheme');
  const legal=[];const scan=dir=>{for(const name of fs.readdirSync(dir)){const p=path.join(dir,name),st=fs.lstatSync(p);if(st.isSymbolicLink())continue;if(st.isDirectory())scan(p);else if(/^LICENSE(?:S)?(?:[._].*)?$/i.test(name))legal.push(p);}};scan(built);if(!legal.some(p=>/LICENSES\.chromium\.html$/i.test(p)))throw Error('Electron Chromium runtime notices missing; inspect the SDK before packaging');const notices=path.join(appPath,'Contents/Resources/electron-notices');fs.mkdirSync(notices,{recursive:true});for(let i=0;i<legal.length;i++)fs.copyFileSync(legal[i],path.join(notices,i+'-'+path.basename(legal[i])));
  execFileSync('/usr/bin/codesign',['--force','--deep','--sign','-',appPath],{stdio:'pipe'});execFileSync('/usr/bin/codesign',['--verify','--deep','--strict',appPath],{stdio:'pipe'});
  const filename='DSH-Whale-Mac-'+process.arch+'-0.1.0-candidate.zip',zip=path.join(artifacts,filename);execFileSync('/usr/bin/ditto',['-c','-k','--sequesterRsrc','--keepParent',appPath,zip],{stdio:'pipe'});
  const digest=crypto.createHash('sha256').update(fs.readFileSync(zip)).digest('hex');fs.writeFileSync(path.join(artifacts,'SHA256SUMS.txt'),digest+'  '+filename+'\n');
  fs.writeFileSync(path.join(artifacts,'CHECKS.json'),JSON.stringify({candidate:true,architecture:process.arch,officialVersion:spec.version,officialAsarSha256:spec.asarSha256,signature:'local ad-hoc, no Developer ID or notarization',independentBundleId:id,officialDSHBundled:false,nativeHostAnd36AvatarAPI:'PASS',guiTested:false,mousePassThroughTested:false,existingConversationsImported:false,candidateZipSha256:digest},null,2));
  fs.writeFileSync(path.join(artifacts,'READ-ME-FIRST.txt'),'Experimental isolated Mac candidate. It does not show your existing DSH chats, settings or Bots. Configure its fresh workspace separately. Official DSH must be separately installed at the exact supported version. The App has only a local ad-hoc signature, no Developer ID or notarization. Gatekeeper may block it; do not disable system security globally. Native host API passed; GUI, mouse pass-through and window interactions are untested. Quit this candidate to stop its own local host; original DSH is untouched.');
  console.log(JSON.stringify({candidate:true,architecture:process.arch,archive:filename,sha256:digest,guiTested:false}));
 }
})().catch(error=>{console.error(JSON.stringify({type:'build-error',architecture:process.arch,error:serializeError(error)}));process.exitCode=1;});
