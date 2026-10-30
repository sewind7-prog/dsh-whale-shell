'use strict';
const path=require('node:path'),requests=new WeakMap();
function safeUrl(value){try{const url=new URL(value);return url.origin+url.pathname;}catch{return'[invalid URL]';}}
function safeText(value){return String(value).replace(/https?:\/\/[^\s'"<>]+/g,safeUrl).replace(/Bearer\s+\S+/gi,'Bearer [redacted]').replace(/((?:api[_-]?key|token|secret|password)\s*[:=]\s*)[^\s,;]+/gi,'$1[redacted]').slice(0,4000);}
function serializeError(error,seen=new Set(),depth=0){
 if(!error||typeof error!=='object')return{message:safeText(error)};
 if(seen.has(error)||depth>5)return{message:'[nested error limit]'};seen.add(error);
 const output={name:safeText(error.name||'Error'),message:safeText(error.message||String(error))};
 for(const key of ['code','errno','syscall','hostname','port'])if(typeof error[key]==='string'||typeof error[key]==='number')output[key]=typeof error[key]==='string'?safeText(error[key]):error[key];
 if(error.response){output.httpStatus=error.response.status;output.responseUrl=safeUrl(error.response.url);}
 const request=requests.get(error);if(request)output.downloadRequest=request;
 if(error.cause)output.cause=serializeError(error.cause,seen,depth+1);
 if(Array.isArray(error.errors))output.errors=error.errors.slice(0,8).map(value=>serializeError(value,seen,depth+1));
 return output;
}
// Delegate to the locked library's actual default downloader exactly once.
// No mirror, proxy, timeout, retry, options or checksum behavior is changed.
function traceDownloader(original,log=value=>console.log(JSON.stringify(value))){return{async download(url,target,options){
 const request={url:safeUrl(url),artifact:path.posix.basename(new URL(url).pathname)};
 log({type:'sdk-download',...request});
 try{return await original.download(url,target,options);}catch(error){if(error&&typeof error==='object')requests.set(error,request);throw error;}
}};}
module.exports={serializeError,traceDownloader};
