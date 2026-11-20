import {readFileSync,writeFileSync,mkdirSync,renameSync} from 'node:fs';import {resolve,dirname} from 'node:path';import {rankEntries,validateEntry} from '../src/leaderboard.js';
export const leaderboardFile=()=>resolve(process.env.LANTERN_DATA_DIR??'.local','leaderboard.json');
export function readLeaderboard(file=leaderboardFile()){try{return {entries:rankEntries(JSON.parse(readFileSync(file,'utf8')).entries)};}catch(e){if(e.code==='ENOENT')return {entries:[]};throw e;}}
export function saveScore(entry,file=leaderboardFile()){
 const row=validateEntry({...entry,achieved_at:new Date().toISOString()});const result={entries:rankEntries([...readLeaderboard(file).entries,row])};mkdirSync(dirname(file),{recursive:true});const temp=file+'.tmp';writeFileSync(temp,JSON.stringify(result,null,2)+'\n');renameSync(temp,file);return result;
}
