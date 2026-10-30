// Version-guarded ASAR patch: preserve original payload and every unaffected entry.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const input = process.argv[2], output = process.argv[3];
if (!input || !output || path.resolve(input)===path.resolve(output)) throw Error('Usage: node patch-shell.cjs original.asar candidate.asar');
if (fs.existsSync(output)) throw Error('Candidate already exists; preserve it or choose a new output');
const bytes = fs.readFileSync(input);
const header = JSON.parse(bytes.subarray(16,16+bytes.readUInt32LE(12)).toString());
const body = bytes.subarray(8+bytes.readUInt32LE(4));
const entry = name => name.split('/').reduce((node,part)=>node.files[part],header);
const read = name => { const e=entry(name); if(e.unpacked||e.link)throw Error('Unexpected archive entry'); return body.subarray(Number(e.offset),Number(e.offset)+e.size).toString(); };
const pkg=JSON.parse(read('package.json'));
const supported=require('./supported-shells.cjs').find(item=>item.stock===sha(bytes));
if(!supported||pkg.version!==supported.version)throw Error('Unsupported original ASAR bytes/version');
function once(source,before,after) {
 if(source.indexOf(before)<0 || source.indexOf(before)!==source.lastIndexOf(before)) throw Error('Patch anchor changed: '+before.slice(0,90));
 return source.replace(before,after);
}
let main=read('lib/main.js').replace(/\r\n/g,'\n');
main=once(main,'protocol, session, shell, systemPreferences } from "electron"','protocol, screen, session, shell, systemPreferences } from "electron"');
main=once(main,'function createWindow(preload, show = false, primary = false) {',`function createWindow(preload, show = false, primary = false) {
 const whale = process.platform === "win32" && primary;
 const work = whale ? screen.getPrimaryDisplay().workArea : null;
 const initialWidth = whale ? Math.max(800,Math.floor(Math.min(1512,work.width * .94))) : 1280;
 const initialHeight = whale ? Math.max(600,Math.floor(Math.min(980,work.height * .94))) : 820;
`);
main=once(main,'width: 1280,\n\t\theight: 820,\n\t\tminWidth: 520,\n\t\tminHeight: 600,','width: initialWidth,\n\t\theight: initialHeight,\n\t\tminWidth: whale ? 800 : 520,\n\t\tminHeight: 600,');
main=once(main,`titleBarStyle: "hidden",
\t\t\ttitleBarOverlay: {
\t\t\t\theight: 40,
\t\t\t\tcolor: chromeFallbackFill(),
\t\t\t\tsymbolColor: nativeTheme.shouldUseDarkColors ? "#f9fafb" : "#0f1115"
\t\t\t}`,`frame: false, transparent: true, backgroundColor: "#00000000", hasShadow: false`);
main=once(main,'\twindow.webContents.setWindowOpenHandler(({ url }) => {',` if (whale) {
  window.__dshWhale = { expanded: false, restore: null };
  const notify = () => { if (!window.isDestroyed()) window.webContents.send("dsh-whale:maximized", window.__dshWhale.expanded); };
  window.webContents.on("did-finish-load", notify);
 }
\twindow.webContents.setWindowOpenHandler(({ url }) => {`);
main=once(main,'\tlet navigation;\n\tconst navigateMain',` // DSH whale v10: only the authenticated primary app renderer can control its own window.
 ipcMain.handle("dsh-whale:window", (event, action, payload) => {
  assertProductSender(event);
  const w=mainWindow, state=w.__dshWhale;
  if (!state) throw new Error("Whale window controls unavailable");
  if (action==="shape") {
   if (payload === null) { w.setShape([]); return; }
   const {width,height,rects}=payload || {};
   if (!Number.isFinite(width) || !Number.isFinite(height) || width<=0 || height<=0 || width>100000 || height>100000 || !Array.isArray(rects) || !rects.length || rects.length>5000) throw new Error("Invalid whale window shape");
   const [cw,ch]=w.getContentSize();
   const mapped=rects.map(r=>{
    if (!r || ![r.x,r.y,r.width,r.height].every(Number.isFinite) || r.width<=0 || r.height<=0 || r.x<0 || r.y<0 || r.x+r.width>width+0.01 || r.y+r.height>height+0.01) throw new Error("Invalid whale shape rectangle");
    const x=Math.max(0,Math.floor(r.x*cw/width)),y=Math.max(0,Math.floor(r.y*ch/height));
    const right=Math.min(cw,Math.ceil((r.x+r.width)*cw/width)),bottom=Math.min(ch,Math.ceil((r.y+r.height)*ch/height));
    return {x,y,width:right-x,height:bottom-y};
   }).filter(r=>r.width>0 && r.height>0);
   if (!mapped.length) throw new Error("Empty whale window shape");
   w.setShape(mapped); return;
  }
  if (action==="state") return state.expanded;
  if (action==="beginMove") {
   if (state.expanded) return false;
   state.move={cursor:screen.getCursorScreenPoint(),bounds:w.getBounds()}; return true;
  }
  if (action==="endMove") { state.move=null; return; }
  if (action==="move") {
   if (!state.move || state.expanded) return;
   const point=screen.getCursorScreenPoint(), start=state.move;
   w.setPosition(Math.round(start.bounds.x+point.x-start.cursor.x),Math.round(start.bounds.y+point.y-start.cursor.y)); return;
  }
  state.move=null;
  if (action==="minimize") { w.minimize(); return; }
  if (action==="close") { w.close(); return; }
  if (action!=="toggleMaximize") throw new Error("Invalid whale window action");
  if (state.expanded) { w.setBounds(state.restore); state.expanded=false; state.restore=null; }
  else { state.restore=w.getBounds(); w.setBounds(screen.getDisplayMatching(state.restore).workArea); state.expanded=true; }
  w.webContents.send("dsh-whale:maximized",state.expanded);
  return state.expanded;
 });
\tlet navigation;
\tconst navigateMain`);
main=once(main,'if (validColor(color) && validColor(symbolColor)) mainWindow.setTitleBarOverlay({','if (!mainWindow.__dshWhale && validColor(color) && validColor(symbolColor)) mainWindow.setTitleBarOverlay({');
let preload=read('lib/preload-app.cjs');
preload+=`\n// DSH whale v10: restricted bridge; no generic IPC or code execution is exposed.
if (process.platform === "win32" && process.isMainFrame && location.protocol === "dsh-app:" && location.hostname === "app") {
 const invoke = (action,payload) => electron.ipcRenderer.invoke("dsh-whale:window", action,payload);
 electron.contextBridge.exposeInMainWorld("dshWindow", {
  minimize:()=>invoke("minimize"), toggleMaximize:()=>invoke("toggleMaximize"), close:()=>invoke("close"),
  isMaximized:()=>invoke("state"),
  beginMove:()=>invoke("beginMove"), move:()=>invoke("move"), endMove:()=>invoke("endMove"),
  setShape:(shape)=>invoke("shape",shape),
  onMaximizedChange:(listener)=>{
   if(typeof listener!=="function") throw new TypeError("Expected listener");
   const handler=(_event,value)=>listener(value===true);
   electron.ipcRenderer.on("dsh-whale:maximized",handler);
   return ()=>electron.ipcRenderer.off("dsh-whale:maximized",handler);
  }
 });
 const fallback=()=>{
  const style=document.createElement("style");
  style.textContent="#dsh-whale-fallback{position:fixed;inset:0 0 auto;height:38px;z-index:2147483646;background:#fbf8ee;display:flex;justify-content:flex-end;-webkit-app-region:drag}#dsh-whale-fallback button{width:46px;border:0;background:transparent;color:#1a2340;-webkit-app-region:no-drag}html[data-dsh-whale-ready] #dsh-whale-fallback{display:none}";
  const bar=document.createElement("div");bar.id="dsh-whale-fallback";
  for(const [action,label,text] of [["minimize","最小化","—"],["toggleMaximize","最大化或还原","□"],["close","关闭窗口","×"]]) {
   const button=document.createElement("button");button.type="button";button.textContent=text;button.setAttribute("aria-label",label);button.onclick=()=>invoke(action);bar.appendChild(button);
  }
  document.head.appendChild(style);document.body.appendChild(bar);
 };
 if(document.readyState==="loading") window.addEventListener("DOMContentLoaded",fallback,{once:true}); else fallback();
}
`;
const changes={'lib/main.js':Buffer.from(main),'lib/preload-app.cjs':Buffer.from(preload)};
const outDir=path.dirname(path.resolve(output));fs.mkdirSync(outDir,{recursive:true});
let nextOffset=body.length;const additions=[];
for(const [name,buffer] of Object.entries(changes)) {
 const check=path.join(outDir,name==='lib/main.js'?'patched-main.mjs':'patched-preload.cjs');fs.writeFileSync(check,buffer);
 const result=spawnSync(process.execPath,['--check',check],{encoding:'utf8'});if(result.status!==0)throw Error(result.stderr);
 const e=entry(name);e.offset=String(nextOffset);e.size=buffer.length;
 const blockSize=e.integrity?.blockSize||4194304;const blocks=[];
 for(let i=0;i<buffer.length;i+=blockSize)blocks.push(sha(buffer.subarray(i,i+blockSize)));
 e.integrity={algorithm:'SHA256',hash:sha(buffer),blockSize,blocks};
 nextOffset+=buffer.length;additions.push(buffer);
}
const json=Buffer.from(JSON.stringify(header));const payloadLength=Math.ceil((4+json.length)/4)*4;
const headerBytes=Buffer.alloc(4+payloadLength);headerBytes.writeUInt32LE(payloadLength,0);headerBytes.writeUInt32LE(json.length,4);json.copy(headerBytes,8);
const size=Buffer.alloc(8);size.writeUInt32LE(4,0);size.writeUInt32LE(headerBytes.length,4);
const patched=Buffer.concat([size,headerBytes,body,...additions]);
if(supported.whale&&sha(patched)!==supported.whale)throw Error('Patched ASAR checksum differs from the verified target');
fs.writeFileSync(output,patched,{flag:'wx'});
const manifest={version:pkg.version,originalSha256:sha(bytes),patchedSha256:sha(patched),originalBytes:bytes.length,patchedBytes:patched.length,changedFiles:Object.keys(changes),preservedPayloadSha256:sha(body)};
fs.writeFileSync(output+'.json',JSON.stringify(manifest,null,2));console.log(JSON.stringify(manifest,null,2));
