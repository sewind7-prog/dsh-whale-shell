const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {chromium}=require('playwright');const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const version='1.0.2',dir=__dirname,project=path.resolve(dir,'../..'),impl=path.dirname(dir),out=path.resolve(process.argv[2]||path.join(dir,'build','payload-'+version));
function copy(src,dest){fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(src,dest,fs.constants.COPYFILE_EXCL);}
(async()=>{
 if(fs.existsSync(out))throw Error('Payload already exists; use a fresh version/build directory.');fs.mkdirSync(out,{recursive:true});
 copy(path.join(dir,'src','engine.cjs'),path.join(out,'engine.cjs'));copy(path.join(impl,'patch-shell.cjs'),path.join(out,'patch-shell.cjs'));
 const packages=path.resolve(process.argv[3]||process.env.DSH_INSTALLER_PACKAGES||path.join(project,'vendor'));
 for(const [name,folder] of [['ds-bot','ds-bot-0.2.4'],['deep-view','deep-view-0.1.0']])fs.cpSync(path.join(packages,folder,'package'),path.join(out,'plugins',name),{recursive:true,errorOnExist:true,force:false});
 const skin=path.join(out,'plugins','dsh-ui-skin');fs.mkdirSync(path.join(skin,'lib'),{recursive:true});
 const pkg=JSON.parse(fs.readFileSync(path.join(impl,'package.json')));pkg.version=version;fs.writeFileSync(path.join(skin,'package.json'),JSON.stringify(pkg,null,2));
 copy(path.join(impl,'index.js'),path.join(skin,'lib','index.js'));const active=path.resolve(process.env.DSH_SKIN_CLIENT||path.join(project,'build','client.js'));
 if(sha(fs.readFileSync(active))!=='4acc9c1ea0dbcee422c8bd6f551492d952e7d005ab5a54653157216ed5cb40d3')throw Error('Unexpected skin version');copy(active,path.join(skin,'lib','client.js'));
 copy(path.join(project,'refs','透明腹窗纸艺蓝鲸.png'),path.join(out,'art','whale.png'));
 const avatars=[],originals=[],iconDir=path.join(project,'refs','icons'),names=fs.readdirSync(iconDir).filter(n=>/^bot-\d+\.png$/.test(n)).sort((a,b)=>Number(a.match(/\d+/)[0])-Number(b.match(/\d+/)[0]));
 const browser=await chromium.launch({headless:true,channel:'msedge'});try{const page=await browser.newPage();for(const name of names){
  const original=fs.readFileSync(path.join(iconDir,name));if(original.length>25*1024*1024)throw Error('Avatar too large: '+name);copyBytes(original,path.join(out,'avatar-originals',name));originals.push({name,sha256:sha(original),bytes:original.length});
  // Match DS Bot 0.2.4's native avatar-library import: centered 160px WebP.
  const data=await page.evaluate(async url=>{const image=await createImageBitmap(await(await fetch(url)).blob()),side=160,c=document.createElement('canvas');c.width=c.height=side;const ctx=c.getContext('2d');ctx.imageSmoothingQuality='high';const crop=Math.min(image.width,image.height);ctx.drawImage(image,(image.width-crop)/2,(image.height-crop)/2,crop,crop,0,0,side,side);image.close();return c.toDataURL('image/webp',.9);},'data:image/png;base64,'+original.toString('base64'));
  const bytes=Buffer.from(data.split(',')[1],'base64'),id=sha(bytes);if(bytes.length>110000)throw Error('Normalized avatar exceeds limit');copyBytes(bytes,path.join(out,'avatars',id+'.webp'));avatars.push({id,name,mime:'image/webp',bytes:bytes.length});
 }}finally{await browser.close();}
 fs.writeFileSync(path.join(out,'THIRD-PARTY-NOTICES.txt'),'DS Bot 0.2.4 and deep-view 0.1.0 are distributed under Apache-2.0. Original LICENSE and README files are included under plugins/.\nDSH itself and its full ASAR are not redistributed. The target user must have the supported DSH desktop application installed. The included patch is applied locally.\nAvatar and whale artwork: supplied in this project by the user.\n');
 const files=[];function walk(p,rel=''){for(const e of fs.readdirSync(p,{withFileTypes:true})){const next=rel?rel+'/'+e.name:e.name;if(e.isSymbolicLink())throw Error('No machine-specific symlinks in payload');if(e.isDirectory())walk(path.join(p,e.name),next);else files.push({path:next,sha256:sha(fs.readFileSync(path.join(p,e.name)))});}}walk(out);
 const manifest={version,platform:'win32',arch:'x64',dshVersion:'0.2.1-rc.3',dsBotVersion:'0.2.4',deepViewVersion:'0.1.0',skinSha256:sha(fs.readFileSync(active)),avatars,originals,files};fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2));console.log(JSON.stringify({payload:out,avatars:avatars.length,files:files.length,skinSha256:manifest.skinSha256}));
})().catch(e=>{console.error(e);process.exitCode=1});
function copyBytes(b,p){fs.mkdirSync(path.dirname(p),{recursive:true});if(fs.existsSync(p)){if(sha(fs.readFileSync(p))!==sha(b))throw Error('Hash collision');return;}fs.writeFileSync(p,b,{flag:'wx'});}
