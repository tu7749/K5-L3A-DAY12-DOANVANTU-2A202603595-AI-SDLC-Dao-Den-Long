import {rankEntries,validateEntry} from './leaderboard.js';
const KEY='lantern-leaderboard';
export async function getScores(){try{const r=await fetch('/api/leaderboard');if(!r.ok)throw Error();return {entries:rankEntries((await r.json()).entries),disk:true};}catch{return {entries:rankEntries(JSON.parse(localStorage.getItem(KEY)??'[]')),disk:false};}}
export async function saveBrowserScore(entry){const row=validateEntry({...entry,achieved_at:new Date().toISOString()});
 let response;try{response=await fetch('/api/leaderboard',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(row)});}catch{}
 if(response?.ok)return {entries:rankEntries((await response.json()).entries),disk:true};
 if(response&&response.status===400)throw Error((await response.json()).error);
 const entries=rankEntries([...JSON.parse(localStorage.getItem(KEY)??'[]'),row]);localStorage.setItem(KEY,JSON.stringify(entries));return {entries,disk:false};
}
