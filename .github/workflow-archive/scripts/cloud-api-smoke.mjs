import {spawn} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';

const port=8791;
const base=`http://127.0.0.1:${port}`;
const child=spawn('npx',['-y','wrangler@4.114.0','dev','--local','--ip','127.0.0.1','--port',String(port),'--var','PROFILE_PIN_PEPPER:local-cloud-smoke-pepper-2026'],{stdio:['ignore','pipe','pipe'],env:{...process.env},detached:process.platform!=='win32'});
let output='';
child.stdout.on('data',chunk=>{output+=chunk.toString();process.stdout.write(chunk)});
child.stderr.on('data',chunk=>{output+=chunk.toString();process.stderr.write(chunk)});

async function fetchBound(url,options={},timeoutMs=20_000){
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{return await fetch(url,{...options,signal:controller.signal})}
  catch(error){if(error?.name==='AbortError')throw new Error(`request timed out after ${timeoutMs}ms: ${url}`);throw error}
  finally{clearTimeout(timer)}
}

async function waitReady(){
  for(let attempt=0;attempt<80;attempt+=1){
    if(child.exitCode!==null)throw new Error(`wrangler exited early (${child.exitCode})\n${output}`);
    try{const response=await fetchBound(`${base}/api/cloud/status`,{},2_000);if(response.ok)return}catch{}
    await sleep(500);
  }
  throw new Error(`wrangler did not become ready\n${output}`);
}

async function api(path,options={}){
  console.log(`\n[cloud-smoke] ${options.method??'GET'} ${path}`);
  const response=await fetchBound(`${base}${path}`,{...options,headers:{'content-type':'application/json',...(options.headers??{})}});
  const text=await response.text();let body={};try{body=text?JSON.parse(text):{}}catch{body={raw:text}}
  console.log(`[cloud-smoke] -> ${response.status}`);
  return{status:response.status,body};
}

function assert(condition,message){if(!condition)throw new Error(message)}
function stopWrangler(){
  if(child.exitCode!==null)return;
  try{if(process.platform!=='win32')process.kill(-child.pid,'SIGTERM');else child.kill('SIGTERM')}catch{try{child.kill('SIGTERM')}catch{}}
}

let failed;
try{
  await waitReady();
  const id=`cloud-smoke-${Date.now()}`;
  const register=await api('/api/cloud/register',{method:'POST',body:JSON.stringify({studentId:id,name:'Никита Test',pin:'1234',entries:{'mathnikita:test-marker':'device-a'}})});
  assert(register.status===200,`register failed ${register.status} ${JSON.stringify(register.body)}`);
  assert(/^MN-[A-Z0-9]{7}$/.test(register.body.student?.code??''),'student code was not issued');
  assert(/^MN-RCV-/.test(register.body.recoveryCode??''),'recovery code was not issued');
  assert(typeof register.body.token==='string'&&register.body.token.length>20,'session token missing');
  const code=register.body.student.code;const recovery=register.body.recoveryCode;const token=register.body.token;const revision=register.body.revision;

  const wrong=await api('/api/cloud/login',{method:'POST',body:JSON.stringify({code,pin:'9999'})});
  assert(wrong.status===401,`wrong PIN should be 401, got ${wrong.status}`);
  const login=await api('/api/cloud/login',{method:'POST',body:JSON.stringify({code,pin:'1234'})});
  assert(login.status===200,'correct PIN login failed');
  assert(login.body.entries?.['mathnikita:test-marker']==='device-a','registered progress was not restored');

  const sync=await api('/api/cloud/sync',{method:'POST',headers:{authorization:`Bearer ${token}`},body:JSON.stringify({baseRevision:revision,changes:{'mathnikita:test-marker':'device-b','mathnikita:second-key':'42'}})});
  assert(sync.status===200,`sync failed ${sync.status} ${JSON.stringify(sync.body)}`);
  const stale=await api('/api/cloud/sync',{method:'POST',headers:{authorization:`Bearer ${token}`},body:JSON.stringify({baseRevision:revision,changes:{'mathnikita:test-marker':'stale-overwrite'}})});
  assert(stale.status===409,'stale revision did not conflict');
  assert(stale.body.entries?.['mathnikita:test-marker']==='device-b','conflict response lost current server progress');

  const snapshot=await api('/api/cloud/snapshot',{method:'GET',headers:{authorization:`Bearer ${token}`}});
  assert(snapshot.status===200,'snapshot failed');
  assert(snapshot.body.entries?.['mathnikita:test-marker']==='device-b','snapshot did not persist latest value');
  assert(snapshot.body.entries?.['mathnikita:second-key']==='42','snapshot did not persist second key');

  const recovered=await api('/api/cloud/recover',{method:'POST',body:JSON.stringify({code,recoveryCode:recovery,newPin:'5678'})});
  assert(recovered.status===200,`recovery failed ${recovered.status}`);
  assert(recovered.body.recoveryCode&&recovered.body.recoveryCode!==recovery,'recovery code was not rotated');
  const oldPin=await api('/api/cloud/login',{method:'POST',body:JSON.stringify({code,pin:'1234'})});
  assert(oldPin.status===401,'old PIN still works after recovery');
  const newPin=await api('/api/cloud/login',{method:'POST',body:JSON.stringify({code,pin:'5678'})});
  assert(newPin.status===200,'new PIN does not work after recovery');
  assert(newPin.body.entries?.['mathnikita:test-marker']==='device-b','progress was lost during PIN recovery');

  console.log('\nCloud D1 smoke: OK');
}catch(error){failed=error;console.error('\nCloud D1 smoke failed:',error)}finally{
  stopWrangler();
  await Promise.race([new Promise(resolve=>child.once('exit',resolve)),sleep(2500)]);
  if(child.exitCode===null){try{if(process.platform!=='win32')process.kill(-child.pid,'SIGKILL');else child.kill('SIGKILL')}catch{}}
}
if(failed)throw failed;
process.exit(0);
