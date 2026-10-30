'use strict';
const {app,BrowserWindow,dialog,Menu}=require('electron'),path=require('node:path'),os=require('node:os'),fs=require('node:fs'),{execFileSync}=require('node:child_process');
const {probe,hash,redact}=require('./policy.cjs'),{prepare}=require('./workspace.cjs'),{start}=require('./host.cjs'),{create}=require('./window.cjs');
app.setName('DSH Whale Candidate');app.setPath('userData',path.join(os.homedir(),'Library/Application Support/DSH Whale Candidate/0.1.0'));
let host,window,official;
if(!app.requestSingleInstanceLock()){app.quit();}else app.whenReady().then(async()=>{
 if(process.platform!=='darwin'||!require('./build-status.json').nativeValidatedArchitectures.includes(process.arch))throw Error('This architecture has not passed native host validation in this candidate build.');
 const supplied=process.argv.find(arg=>arg.startsWith('--official-app=')),officialPath=supplied?supplied.slice('--official-app='.length):'/Applications/DeepSeek Harness.app';official=probe(officialPath,process.arch,{allowInspectedIntel:true});
 execFileSync('/usr/bin/codesign',['--verify','--deep','--strict',official.appDir],{stdio:'pipe'});
 const home=path.join(app.getPath('userData'),'isolated-workspace');prepare(home,path.join(__dirname,'../payload'));
 Menu.setApplicationMenu(Menu.buildFromTemplate([{label:'DSH Whale Candidate',submenu:[{role:'about'},{type:'separator'},{role:'hide'},{role:'hideOthers'},{type:'separator'},{role:'quit'}]},{role:'editMenu'}]));
 host=start(official,home);const boot=await host.ready;window=create(require('electron'),boot);host.child.on('exit',()=>{if(!app.isQuitting&&window&&!window.isDestroyed())dialog.showErrorBox('Isolated host stopped','The candidate local host stopped. Your original DSH and its data were not modified. Restart this candidate after reviewing its isolated workspace.');});
 app.on('activate',()=>{if(window&&!window.isDestroyed())window.show();else window=create(require('electron'),boot);});
}).catch(error=>{dialog.showErrorBox('Mac candidate could not start',redact(error.message));app.quit();});
app.on('second-instance',()=>{if(window&&!window.isDestroyed())window.show();});
app.on('window-all-closed',()=>{}); // macOS close hides the window; the isolated host remains until explicit Quit.
app.on('before-quit',event=>{if(app.isQuitting)return;app.isQuitting=true;if(host){event.preventDefault();host.stop().then(()=>app.quit()).catch(error=>{app.isQuitting=false;dialog.showErrorBox('Candidate host is still running',redact(error.message));});}});
app.on('quit',()=>{if(official&&hash(official.asar)!==official.asarSha256)fs.writeFileSync(path.join(app.getPath('userData'),'official-file-changed-warning.txt'),'Official ASAR changed externally while the candidate was open. The candidate never writes it.');});
