'use strict';
const supported=require('./supported-shells.cjs');
function family(hash){return supported.find(item=>item.stock===hash||item.whale===hash);}
// Profile history survives DSH upgrades; ASAR rollback follows the current DSH family.
function nextState(old,tx,readReceipt){
 let profile=old?.profileBaseline||old?.baseline,shell=old?.shellBaseline||old?.baseline;
 if(old?.latest!==tx.file&&tx.kind==='install'){
  if(!old||old.restored){profile=tx.file;shell=tx.file;}
  else {
   const previous=family(readReceipt(shell).shellBefore),current=family(tx.shellBefore);
   if(!previous||!current)throw Error('Unknown restore family in installation history');
   if(previous.version!==current.version)shell=tx.file;
  }
 }
 if(!profile||!shell)throw Error('Installation baseline is missing');
 return{version:2,baseline:profile,profileBaseline:profile,shellBaseline:shell,latest:tx.file,restored:tx.kind==='restore',updatedAt:new Date().toISOString()};
}
module.exports={family,nextState};
