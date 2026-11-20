import {mkdir,copyFile,cp,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist/vendor',{recursive:true});
for(const f of ['index.html','style.css','game.contract.json'])await copyFile(f,'dist/'+f);
await cp('src','dist/src',{recursive:true});
await copyFile('node_modules/three/build/three.module.js','dist/vendor/three.module.js');
await copyFile('node_modules/three/build/three.core.js','dist/vendor/three.core.js');
await copyFile('node_modules/three/LICENSE','dist/vendor/THREE-LICENSE.txt');
console.log('Static release built in dist/');
