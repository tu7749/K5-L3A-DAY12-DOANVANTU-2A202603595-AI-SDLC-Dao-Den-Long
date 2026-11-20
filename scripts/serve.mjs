import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const root=resolve('dist');const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json'};
createServer(async(req,res)=>{try{const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=resolve(root,'.'+(name==='/'?'/index.html':name));if(!file.startsWith(root+'/'))throw Error();const data=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]??'application/octet-stream'});res.end(data);}catch{res.writeHead(404);res.end('Not found. Run npm run build first.');}}).listen(Number(process.env.PORT??4173),'127.0.0.1',function(){console.log('Đảo Đèn Lồng: http://localhost:'+this.address().port);});
