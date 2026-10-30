const {openAsar,entry}=require('../src/asar.cjs'),archive=openAsar(process.argv[2]);
console.log(entry(archive,'package.json').toString());
for(const name of ['dsh/node_modules/@deepseek-ai/dsh-desktop-host/lib/cli.js','dsh/node_modules/@deepseek-ai/dsh-app-boot/lib/index.js']){try{const text=entry(archive,name).toString();console.log(name+' '+text.slice(0,1200));const keys=[...new Set(text.match(/(?:DSH|DO_NOT_TRACK|ELECTRON)_[A-Z_]+/g)||[])];console.log(JSON.stringify(keys));}catch(e){console.log(e.message);}}
