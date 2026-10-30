if(process.platform!=='darwin'||process.arch!==process.env.EXPECTED_ARCH)throw Error('Runner OS/CPU differs from requested native acceptance target');
console.log(JSON.stringify({platform:process.platform,arch:process.arch,guiAutomation:false}));
