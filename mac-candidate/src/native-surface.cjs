'use strict';
const crypto=require('node:crypto'),{localUrl,redact}=require('./policy.cjs');
// Protocol inspection only. No browser, script evaluation, chat or model request.
async function inspectSurface(boot,skinSource,request=fetch){
 if(!Buffer.isBuffer(skinSource)||skinSource.length===0)throw Error('Expected installed skin source bytes');
 const url=localUrl(boot),response=await request(url,{redirect:'manual'});if(response.status!==303)throw Error('Expected native launch-token exchange (HTTP '+response.status+')');
 const cookies=response.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ');if(!cookies)throw Error('Native session cookie missing');
 const api=await request(new URL('/api/bot',url),{method:'POST',headers:{Cookie:cookies,Origin:url.origin,'Content-Type':'application/json'},body:JSON.stringify({endpoint:'avatar-library',payload:{limit:48}})});if(!api.ok)throw Error('Avatar API HTTP '+api.status);
 const body=await api.json();if(!body.ok)throw Error('Avatar API rejected request: '+redact(String(body.error?.message||body.error?.code||'unknown error')).slice(0,1000));if(body.value?.total!==36||body.value.items?.length!==36||!body.value.items.every(item=>typeof item.image==='string'&&item.image.startsWith('data:image/webp;base64,')))throw Error('Native avatar API must return all 36 seeded WebP images');
 const page=await request(new URL('/',url),{headers:{Cookie:cookies}});if(!page.ok)throw Error('Native index HTTP '+page.status);const html=await page.text(),match=html.match(/globalThis\s*\[\s*["']__DSH_BOOT__["']\s*\]\s*=\s*([\s\S]*?)<\/script>/);if(!match)throw Error('Native client module graph missing');
 let graph;try{graph=JSON.parse(match[1].trim());}catch{throw Error('Native client module graph is not valid JSON');}
 // The configured Cordis entry (ui-skin) and client package (dsh-ui-skin) have distinct IDs.
 let skin;function visit(value){if(!value||typeof value!=='object')return;if((value.id==='ui-skin'||value.id==='dsh-ui-skin')&&typeof value.url==='string')skin=value;for(const child of Object.values(value))if(child&&typeof child==='object')visit(child);}visit(graph);if(!skin)throw Error('Whale skin is not registered in the native client graph');
 const moduleUrl=localUrl(new URL(skin.url,url).href);if(moduleUrl.origin!==url.origin)throw Error('Native module URL changed origin; session credentials were not forwarded');
 const client=await request(moduleUrl,{headers:{Cookie:cookies}});if(!client.ok)throw Error('Native skin combo HTTP '+client.status);const script=Buffer.from(await client.arrayBuffer());if(!script.includes(skinSource))throw Error('Native combo script omitted or changed the installed whale skin source');
 return{total:36,nativeSessionAuthenticated:true,skinRegisteredInNativeGraph:true,nativeSkinModuleId:skin.id,skinSourceSha256:crypto.createHash('sha256').update(skinSource).digest('hex'),nativeComboContainsExactSkinSource:true,scriptExecuted:false,browserOpened:false};
}
module.exports={inspectSurface};
