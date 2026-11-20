import {createServer} from 'node:http';import {readFile,writeFile} from 'node:fs/promises';import {resolve,extname} from 'node:path';import {pathToFileURL} from 'node:url';import {readLeaderboard,saveScore} from './leaderboard-store.mjs';
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png'};
export function createGameServer(root=resolve('dist')){
 return createServer(async(req,res)=>{const reply=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
 try{const url=new URL(req.url,'http://localhost');if(url.pathname==='/api/leaderboard'){
   if(req.method==='GET'){reply(200,readLeaderboard());return;}
   if(req.method==='POST'){if(req.headers.origin&&req.headers.origin!==`http://${req.headers.host}`)return reply(403,{error:'Origin không hợp lệ.'});let body='';for await(const chunk of req){body+=chunk;if(body.length>4096)return reply(413,{error:'Dữ liệu quá dài.'});}try{reply(200,saveScore(JSON.parse(body)));}catch(e){reply(400,{error:e.message});}return;}reply(405,{error:'Method not allowed'});return;
 }
 const name=decodeURIComponent(url.pathname);const file=resolve(root,'.'+(name==='/'?'/index.html':name));if(!file.startsWith(root+'/'))throw Error();const data=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]??'application/octet-stream','Cache-Control':'no-cache'});res.end(data);
 }catch{reply(404,{error:'Không tìm thấy. Hãy chạy npm run build.'});}});
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const args=process.argv.slice(2);if(args[0]==='--export-leaderboard'&&args.length===2){try{await writeFile(args[1],JSON.stringify(readLeaderboard(),null,2)+'\n');}catch(e){console.error(e.message);process.exitCode=1;}}
 else if(args.length){console.error('Dùng node scripts/serve.mjs [--export-leaderboard out.json]');process.exitCode=2;}
 else createGameServer().listen(Number(process.env.PORT??4173),'127.0.0.1',function(){console.log('Đảo Đèn Lồng: http://localhost:'+this.address().port);}).on('error',e=>{console.error(e.message);process.exitCode=1;});
}
