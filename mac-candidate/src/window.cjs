'use strict';
const path=require('node:path'),{shape,hit,localUrl,externalUrl,redact}=require('./policy.cjs');
function create(electron,boot){
 const {BrowserWindow,ipcMain,screen}=electron,url=localUrl(boot),area=screen.getPrimaryDisplay().workArea;
 const win=new BrowserWindow({title:'DSH Whale Candidate — isolated workspace',width:Math.max(800,Math.floor(Math.min(1512,area.width*.94))),height:Math.max(600,Math.floor(Math.min(980,area.height*.94))),minWidth:800,minHeight:600,show:false,frame:false,transparent:true,backgroundColor:'#00000000',hasShadow:false,webPreferences:{preload:path.join(__dirname,'preload.cjs'),nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true,webviewTag:false}});
 let outline=null,expanded=false,restore=null,drag=null,ignored=false;
 const sender=event=>{if(event.sender!==win.webContents||event.senderFrame!==win.webContents.mainFrame||new URL(event.senderFrame.url).origin!==url.origin)throw Error('Only this local main renderer may control its own window');};
 const ignore=value=>{if(value!==ignored){win.setIgnoreMouseEvents(value,{forward:true});ignored=value;}};
 const pointer=point=>{if(drag||outline===null){ignore(false);return;}ignore(!hit(outline,point.x,point.y));};
 const currentPointer=()=>{const p=screen.getCursorScreenPoint(),b=win.getContentBounds();pointer({x:(p.x-b.x)*(outline?.width||b.width)/b.width,y:(p.y-b.y)*(outline?.height||b.height)/b.height});};
 ipcMain.handle('dsh-whale-mac:window',(event,action,payload)=>{
  sender(event);if(action==='shape'){outline=shape(payload);currentPointer();return;}
  if(action==='state')return expanded;
  if(action==='minimize'){win.minimize();return;}
  if(action==='close'){win.close();return;}
  if(action==='beginMove'){if(expanded)return false;drag={cursor:screen.getCursorScreenPoint(),bounds:win.getBounds()};ignore(false);return true;}
  if(action==='endMove'){drag=null;currentPointer();return;}
  if(action==='move'){if(!drag||expanded)return;const p=screen.getCursorScreenPoint();win.setPosition(Math.round(drag.bounds.x+p.x-drag.cursor.x),Math.round(drag.bounds.y+p.y-drag.cursor.y));return;}
  if(action==='toggleMaximize'){drag=null;if(expanded){win.setBounds(restore);restore=null;expanded=false;}else{restore=win.getBounds();win.setBounds(screen.getDisplayMatching(restore).workArea);expanded=true;}win.webContents.send('dsh-whale-mac:maximized',expanded);return expanded;}
  throw Error('Unsupported whale window action');
 });
 ipcMain.on('dsh-whale-mac:pointer',(event,point)=>{try{sender(event);}catch{return;}if(!point||![point.x,point.y].every(Number.isFinite))return;pointer(point);});
 ipcMain.on('dsh-whale-mac:external-link',(event,value)=>{try{sender(event);}catch{return;}const target=externalUrl(value);if(target)electron.shell.openExternal(target,{activate:true}).catch(error=>electron.dialog.showErrorBox('Could not open link',redact(error.message)));});
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 win.webContents.on('will-navigate',(event,target)=>{try{if(new URL(target).origin!==url.origin)event.preventDefault();}catch{event.preventDefault();}});
 win.webContents.on('will-attach-webview',event=>event.preventDefault());
 win.on('blur',()=>{drag=null;currentPointer();});win.on('closed',()=>{ipcMain.removeHandler('dsh-whale-mac:window');ipcMain.removeAllListeners('dsh-whale-mac:pointer');ipcMain.removeAllListeners('dsh-whale-mac:external-link');});win.once('ready-to-show',()=>win.show());
 win.loadURL(url.href);return win;
}
module.exports={create};
