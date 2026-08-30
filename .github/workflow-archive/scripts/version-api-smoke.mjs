import {spawn} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';

const port=8792;
const base=`http://127.0.0.1:${port}`;
const child=spawn('npx',['-y','wrangler@4.114.0','dev','--local','--ip','127.0.0.1','--port',String(port)],{stdio:['ignore','pipe','pipe'],env:{...process.env},detached:process.platform!=='win32'});
let output='';
child.stdout.on('data',chunk=>{output+=chunk.toString();process.stdout.write(chunk)});
child.stderr.on('data',chunk=>{output+=chunk.toString();process.stderr.write(chunk)});

function assert(condition,message){if(!condition)throw new Error(message)}
function stop(){if(child.exitCode!==null)return;try{if(process.platform!=='win32')process.kill(-child.pid,'SIGTERM');else child.kill('SIGTERM')}catch{try{child.kill('SIGTERM')}catch{}}}
async function fetchBound(path,options={},timeoutMs=3000){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeoutMs);try{return await fetch(`${base}${path}`,{...options,signal:controller.signal})}finally{clearTimeout(timer)}}

let failed;
try{
  let response;
  for(let attempt=0;attempt<80;attempt+=1){
    if(child.exitCode!==null)throw new Error(`wrangler exited early (${child.exitCode})\n${output}`);
    try{response=await fetchBound('/api/version');if(response.ok)break}catch{}
    await sleep(500);
  }
  if(!response?.ok)throw new Error(`version endpoint did not become ready\n${output}`);
  const body=await response.json();
  assert(body.ok===true,'version endpoint did not return ok=true');
  assert(body.app==='mathnikita','wrong app identifier');
  assert(typeof body.gitSha==='string'&&body.gitSha.length>=7,'git SHA missing');
  if(process.env.GITHUB_SHA)assert(body.gitSha===process.env.GITHUB_SHA,`expected ${process.env.GITHUB_SHA}, got ${body.gitSha}`);
  assert(typeof body.branch==='string'&&body.branch.length>0,'branch missing');
  assert(typeof body.builtAt==='string'&&body.builtAt.length>0,'build timestamp missing');
  assert(body.workerVersion&&typeof body.workerVersion.id==='string'&&body.workerVersion.id.length>0,'Cloudflare Worker version id missing');
  assert(typeof body.workerVersion.timestamp==='string'&&body.workerVersion.timestamp.length>0,'Cloudflare Worker version timestamp missing');
  const head=await fetchBound('/api/version',{method:'HEAD'});assert(head.status===200,'HEAD /api/version failed');assert((await head.text())==='','HEAD /api/version returned a body');
  const post=await fetchBound('/api/version',{method:'POST'});assert(post.status===405,'POST /api/version must be 405');
  console.log(`\nVersion API smoke: OK ${body.gitSha.slice(0,12)} / ${body.workerVersion.id}`);
}catch(error){failed=error;console.error('\nVersion API smoke failed:',error)}finally{
  stop();await Promise.race([new Promise(resolve=>child.once('exit',resolve)),sleep(2500)]);if(child.exitCode===null){try{if(process.platform!=='win32')process.kill(-child.pid,'SIGKILL');else child.kill('SIGKILL')}catch{}}
}
if(failed)throw failed;
