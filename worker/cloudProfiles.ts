// @ts-expect-error Cloudflare Workers provides node:crypto when nodejs_compat is enabled.
import {pbkdf2 as nodePbkdf2} from 'node:crypto';

type D1ResultLike={meta?:{changes?:number};results?:unknown[]};
type D1StatementLike={bind:(...values:unknown[])=>D1StatementLike;run:()=>Promise<D1ResultLike>;first:<T=Record<string,unknown>>()=>Promise<T|null>;all:<T=Record<string,unknown>>()=>Promise<{results:T[]}>};
type D1DatabaseLike={prepare:(sql:string)=>D1StatementLike;batch:(statements:D1StatementLike[])=>Promise<D1ResultLike[]>};

export type CloudProfilesEnv={DB?:D1DatabaseLike};

type StudentRow={
  id:string;login_code:string;display_name:string;pin_salt:string;pin_hash:string;recovery_hash:string;
  progress_revision:number;last_sync_id:string|null;failed_attempts:number;locked_until:number;created_at:string;updated_at:string;
};
type SessionRow={student_id:string;display_name:string;login_code:string;progress_revision:number;expires_at:number};
type ProgressRow={storage_key:string;storage_value:string};

type RegisterBody={studentId?:string;name?:string;pin?:string;entries?:unknown};
type LoginBody={code?:string;pin?:string};
type SyncBody={baseRevision?:number;changes?:unknown};
type RecoverBody={code?:string;recoveryCode?:string;newPin?:string};

type JsonInit=ResponseInit&{headers?:Record<string,string>};

const LOGIN_ALPHABET='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const SESSION_TTL_MS=30*24*60*60*1000;
const LOCK_MS=5*60*1000;
const MAX_FAILED_ATTEMPTS=5;
const PIN_ITERATIONS=120_000;
const MAX_ENTRY_COUNT=400;
const MAX_KEY_BYTES=300;
const MAX_VALUE_BYTES=1_800_000;
const MAX_TOTAL_VALUE_BYTES=5_000_000;
const encoder=new TextEncoder();
let schemaPromise:Promise<void>|null=null;

function json(data:unknown,init:JsonInit={}){
  return new Response(JSON.stringify(data),{...init,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...(init.headers??{})}});
}

function bytesToHex(bytes:Uint8Array){return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('')}
function hexToBytes(value:string){const bytes=new Uint8Array(value.length/2);for(let i=0;i<bytes.length;i+=1)bytes[i]=Number.parseInt(value.slice(i*2,i*2+2),16);return bytes}
function randomBytes(length:number){const bytes=new Uint8Array(length);crypto.getRandomValues(bytes);return bytes}
function randomHex(length=16){return bytesToHex(randomBytes(length))}
function randomChars(length:number){const bytes=randomBytes(length);let value='';for(let i=0;i<length;i+=1)value+=LOGIN_ALPHABET[bytes[i]%LOGIN_ALPHABET.length];return value}
function randomId(){return typeof crypto.randomUUID==='function'?crypto.randomUUID():`${Date.now().toString(36)}-${randomHex(12)}`}
function randomToken(){const bytes=randomBytes(32);let binary='';bytes.forEach(byte=>binary+=String.fromCharCode(byte));return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function randomLoginCode(){return`MN-${randomChars(7)}`}
function randomRecoveryCode(){return`MN-RCV-${randomChars(4)}-${randomChars(4)}-${randomChars(4)}`}
function normalizeCode(value:string){return value.trim().toUpperCase().replace(/\s+/g,'')}
function cleanName(value:string){return value.trim().replace(/\s+/g,' ')}
function validStudentId(value:string){return/^[A-Za-z0-9_-]{8,80}$/.test(value)}
function validPin(value:string){return/^\d{4}$/.test(value)}
function byteLength(value:string){return encoder.encode(value).byteLength}

async function sha256(value:string){const digest=await crypto.subtle.digest('SHA-256',encoder.encode(value));return bytesToHex(new Uint8Array(digest))}
async function pinHash(pin:string,saltHex:string){
  const derived=await new Promise<Uint8Array>((resolve,reject)=>{
    nodePbkdf2(pin,hexToBytes(saltHex),PIN_ITERATIONS,32,'sha256',(error:Error|null,key:Uint8Array)=>{
      if(error){reject(error);return}
      resolve(new Uint8Array(key))
    })
  });
  return bytesToHex(derived);
}
async function safeEqualHex(left:string,right:string){
  if(left.length!==right.length)return false;let result=0;for(let i=0;i<left.length;i+=1)result|=left.charCodeAt(i)^right.charCodeAt(i);return result===0;
}

async function ensureSchema(db:D1DatabaseLike){
  if(schemaPromise)return schemaPromise;
  schemaPromise=(async()=>{
    await db.batch([
      db.prepare(`CREATE TABLE IF NOT EXISTS students (id TEXT PRIMARY KEY, login_code TEXT NOT NULL UNIQUE, display_name TEXT NOT NULL, pin_salt TEXT NOT NULL, pin_hash TEXT NOT NULL, recovery_hash TEXT NOT NULL, progress_revision INTEGER NOT NULL DEFAULT 0, last_sync_id TEXT, failed_attempts INTEGER NOT NULL DEFAULT 0, locked_until INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_students_login_code ON students(login_code)`),
      db.prepare(`CREATE TABLE IF NOT EXISTS student_progress (student_id TEXT NOT NULL, storage_key TEXT NOT NULL, storage_value TEXT NOT NULL, revision INTEGER NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY (student_id, storage_key), FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE)`),
      db.prepare(`CREATE TABLE IF NOT EXISTS student_sessions (id TEXT PRIMARY KEY, student_id TEXT NOT NULL, token_hash TEXT NOT NULL UNIQUE, expires_at INTEGER NOT NULL, created_at TEXT NOT NULL, last_seen_at TEXT NOT NULL, FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE)`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_student_sessions_token ON student_sessions(token_hash)`),
      db.prepare(`CREATE TABLE IF NOT EXISTS progress_history (id INTEGER PRIMARY KEY AUTOINCREMENT, student_id TEXT NOT NULL, revision INTEGER NOT NULL, changed_keys INTEGER NOT NULL, created_at TEXT NOT NULL, FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE)`),
    ]);
  })().catch(error=>{schemaPromise=null;throw error});
  return schemaPromise;
}

function validateEntries(input:unknown,allowNull:boolean){
  if(input===undefined||input===null)return{} as Record<string,string|null>;
  if(typeof input!=='object'||Array.isArray(input))throw new Error('invalid_entries');
  const entries=Object.entries(input as Record<string,unknown>);
  if(entries.length>MAX_ENTRY_COUNT)throw new Error('too_many_entries');
  let total=0;const clean:Record<string,string|null>={};
  for(const[key,value]of entries){
    if(!key||byteLength(key)>MAX_KEY_BYTES)throw new Error('invalid_storage_key');
    if(value===null&&allowNull){clean[key]=null;continue}
    if(typeof value!=='string')throw new Error('invalid_storage_value');
    const size=byteLength(value);if(size>MAX_VALUE_BYTES)throw new Error('storage_value_too_large');total+=size;if(total>MAX_TOTAL_VALUE_BYTES)throw new Error('storage_payload_too_large');clean[key]=value;
  }
  return clean;
}

async function parseJson<T>(request:Request){try{return await request.json() as T}catch{return null}}
function sameOrigin(request:Request){const origin=request.headers.get('origin');return!origin||origin===new URL(request.url).origin}
async function uniqueLoginCode(db:D1DatabaseLike){for(let i=0;i<10;i+=1){const code=randomLoginCode();const existing=await db.prepare('SELECT id FROM students WHERE login_code=?').bind(code).first();if(!existing)return code}throw new Error('login_code_collision')}

async function loadEntries(db:D1DatabaseLike,studentId:string){const rows=(await db.prepare('SELECT storage_key,storage_value FROM student_progress WHERE student_id=?').bind(studentId).all<ProgressRow>()).results;return Object.fromEntries(rows.map(row=>[row.storage_key,row.storage_value]))}

async function createSession(db:D1DatabaseLike,studentId:string){
  const token=randomToken();const tokenHash=await sha256(token);const now=Date.now();const nowIso=new Date(now).toISOString();
  await db.prepare('INSERT INTO student_sessions(id,student_id,token_hash,expires_at,created_at,last_seen_at) VALUES(?,?,?,?,?,?)').bind(randomId(),studentId,tokenHash,now+SESSION_TTL_MS,nowIso,nowIso).run();
  return token;
}

async function sessionFor(request:Request,db:D1DatabaseLike){
  const auth=request.headers.get('authorization')??'';const match=auth.match(/^Bearer\s+(.+)$/i);if(!match)return null;
  const tokenHash=await sha256(match[1]);const now=Date.now();
  const row=await db.prepare(`SELECT s.student_id,st.display_name,st.login_code,st.progress_revision,s.expires_at FROM student_sessions s JOIN students st ON st.id=s.student_id WHERE s.token_hash=? AND s.expires_at>?`).bind(tokenHash,now).first<SessionRow>();
  return row?{...row,tokenHash}:null;
}

async function recordWrongPin(db:D1DatabaseLike,student:StudentRow,now:number){
  const attempts=student.failed_attempts+1;const locked=attempts>=MAX_FAILED_ATTEMPTS?now+LOCK_MS:0;
  await db.prepare('UPDATE students SET failed_attempts=?,locked_until=?,updated_at=? WHERE id=?').bind(locked?0:attempts,locked,new Date(now).toISOString(),student.id).run();
  return locked;
}

function lockedResponse(lockedUntil:number,now:number){
  const retryAfterSeconds=Math.max(1,Math.ceil((lockedUntil-now)/1000));
  return json({error:'Слишком много попыток. Попробуйте позже.',retryAfterSeconds},{status:429,headers:{'retry-after':String(retryAfterSeconds)}});
}

async function register(request:Request,db:D1DatabaseLike){
  const body=await parseJson<RegisterBody>(request);if(!body)return json({error:'Invalid JSON'},{status:400});
  const studentId=String(body.studentId??'');const name=cleanName(String(body.name??''));const pin=String(body.pin??'');
  if(!validStudentId(studentId))return json({error:'Invalid student id'},{status:400});
  if(name.length<2||name.length>24)return json({error:'Name must be 2-24 characters'},{status:400});
  if(!validPin(pin))return json({error:'PIN must contain 4 digits'},{status:400});
  let entries:Record<string,string|null>;try{entries=validateEntries(body.entries,false)}catch(error){return json({error:error instanceof Error?error.message:'Invalid entries'},{status:413})}
  const existing=await db.prepare('SELECT * FROM students WHERE id=?').bind(studentId).first<StudentRow>();
  if(existing){
    const now=Date.now();if(existing.locked_until>now)return lockedResponse(existing.locked_until,now);
    const candidate=await pinHash(pin,existing.pin_salt);
    if(!(await safeEqualHex(candidate,existing.pin_hash))){const locked=await recordWrongPin(db,existing,now);return locked?lockedResponse(locked,now):json({error:'Student id already exists'},{status:409})}
    const recoveryCode=randomRecoveryCode();await db.prepare('UPDATE students SET recovery_hash=?,failed_attempts=0,locked_until=0,updated_at=? WHERE id=?').bind(await sha256(recoveryCode),new Date().toISOString(),existing.id).run();
    const token=await createSession(db,existing.id);return json({ok:true,student:{id:existing.id,name:existing.display_name,code:existing.login_code},token,recoveryCode,revision:existing.progress_revision,entries:await loadEntries(db,existing.id),resumed:true});
  }
  const loginCode=await uniqueLoginCode(db);const pinSalt=randomHex(16);const recoveryCode=randomRecoveryCode();const now=new Date().toISOString();const revision=Object.keys(entries).length?1:0;const token=randomToken();const tokenHash=await sha256(token);
  const statements:D1StatementLike[]=[db.prepare('INSERT INTO students(id,login_code,display_name,pin_salt,pin_hash,recovery_hash,progress_revision,last_sync_id,failed_attempts,locked_until,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').bind(studentId,loginCode,name,pinSalt,await pinHash(pin,pinSalt),await sha256(recoveryCode),revision,null,0,0,now,now)];
  for(const[key,value]of Object.entries(entries)){if(value!==null)statements.push(db.prepare('INSERT INTO student_progress(student_id,storage_key,storage_value,revision,updated_at) VALUES(?,?,?,?,?)').bind(studentId,key,value,revision,now))}
  statements.push(db.prepare('INSERT INTO student_sessions(id,student_id,token_hash,expires_at,created_at,last_seen_at) VALUES(?,?,?,?,?,?)').bind(randomId(),studentId,tokenHash,Date.now()+SESSION_TTL_MS,now,now));
  if(revision)statements.push(db.prepare('INSERT INTO progress_history(student_id,revision,changed_keys,created_at) VALUES(?,?,?,?)').bind(studentId,revision,Object.keys(entries).length,now));
  await db.batch(statements);
  return json({ok:true,student:{id:studentId,name,code:loginCode},token,recoveryCode,revision,entries:Object.fromEntries(Object.entries(entries).filter(([,value])=>value!==null))});
}

async function login(request:Request,db:D1DatabaseLike){
  const body=await parseJson<LoginBody>(request);if(!body)return json({error:'Invalid JSON'},{status:400});const code=normalizeCode(String(body.code??''));const pin=String(body.pin??'');if(!validPin(pin))return json({error:'PIN must contain 4 digits'},{status:400});
  const student=await db.prepare('SELECT * FROM students WHERE login_code=?').bind(code).first<StudentRow>();if(!student)return json({error:'Неверный код ученика или PIN.'},{status:401});
  const now=Date.now();if(student.locked_until>now)return lockedResponse(student.locked_until,now);
  const candidate=await pinHash(pin,student.pin_salt);if(!(await safeEqualHex(candidate,student.pin_hash))){const locked=await recordWrongPin(db,student,now);if(locked)return lockedResponse(locked,now);return json({error:'Неверный код ученика или PIN.'},{status:401})}
  await db.prepare('UPDATE students SET failed_attempts=0,locked_until=0,updated_at=? WHERE id=?').bind(new Date().toISOString(),student.id).run();const token=await createSession(db,student.id);
  return json({ok:true,student:{id:student.id,name:student.display_name,code:student.login_code},token,revision:student.progress_revision,entries:await loadEntries(db,student.id)});
}

async function snapshot(request:Request,db:D1DatabaseLike){const session=await sessionFor(request,db);if(!session)return json({error:'Unauthorized'},{status:401});return json({ok:true,student:{id:session.student_id,name:session.display_name,code:session.login_code},revision:session.progress_revision,entries:await loadEntries(db,session.student_id)})}

async function sync(request:Request,db:D1DatabaseLike){
  const session=await sessionFor(request,db);if(!session)return json({error:'Unauthorized'},{status:401});const body=await parseJson<SyncBody>(request);if(!body)return json({error:'Invalid JSON'},{status:400});const baseRevision=Number(body.baseRevision);if(!Number.isInteger(baseRevision)||baseRevision<0)return json({error:'Invalid base revision'},{status:400});
  let changes:Record<string,string|null>;try{changes=validateEntries(body.changes,true)}catch(error){return json({error:error instanceof Error?error.message:'Invalid changes'},{status:413})}
  if(!Object.keys(changes).length)return snapshot(request,db);
  const newRevision=baseRevision+1;const operationId=randomId();const now=new Date().toISOString();const statements:D1StatementLike[]=[db.prepare('UPDATE students SET progress_revision=?,last_sync_id=?,updated_at=? WHERE id=? AND progress_revision=?').bind(newRevision,operationId,now,session.student_id,baseRevision)];
  for(const[key,value]of Object.entries(changes)){
    if(value===null){statements.push(db.prepare('DELETE FROM student_progress WHERE student_id=? AND storage_key=? AND EXISTS(SELECT 1 FROM students WHERE id=? AND progress_revision=? AND last_sync_id=?)').bind(session.student_id,key,session.student_id,newRevision,operationId));continue}
    statements.push(db.prepare(`INSERT INTO student_progress(student_id,storage_key,storage_value,revision,updated_at) SELECT ?,?,?,?,? WHERE EXISTS(SELECT 1 FROM students WHERE id=? AND progress_revision=? AND last_sync_id=?) ON CONFLICT(student_id,storage_key) DO UPDATE SET storage_value=excluded.storage_value,revision=excluded.revision,updated_at=excluded.updated_at`).bind(session.student_id,key,value,newRevision,now,session.student_id,newRevision,operationId));
  }
  statements.push(db.prepare('INSERT INTO progress_history(student_id,revision,changed_keys,created_at) SELECT ?,?,?,? WHERE EXISTS(SELECT 1 FROM students WHERE id=? AND progress_revision=? AND last_sync_id=?)').bind(session.student_id,newRevision,Object.keys(changes).length,now,session.student_id,newRevision,operationId));
  const results=await db.batch(statements);if((results[0]?.meta?.changes??0)===0){const current=await db.prepare('SELECT progress_revision FROM students WHERE id=?').bind(session.student_id).first<{progress_revision:number}>();return json({error:'revision_conflict',revision:current?.progress_revision??session.progress_revision,entries:await loadEntries(db,session.student_id)},{status:409})}
  return json({ok:true,revision:newRevision,updatedAt:now});
}

async function recover(request:Request,db:D1DatabaseLike){
  const body=await parseJson<RecoverBody>(request);if(!body)return json({error:'Invalid JSON'},{status:400});const code=normalizeCode(String(body.code??''));const recoveryCode=normalizeCode(String(body.recoveryCode??''));const newPin=String(body.newPin??'');if(!validPin(newPin))return json({error:'PIN must contain 4 digits'},{status:400});
  const student=await db.prepare('SELECT * FROM students WHERE login_code=?').bind(code).first<StudentRow>();if(!student||!(await safeEqualHex(await sha256(recoveryCode),student.recovery_hash)))return json({error:'Неверный код восстановления.'},{status:401});
  const salt=randomHex(16);const newRecovery=randomRecoveryCode();const now=new Date().toISOString();await db.batch([db.prepare('UPDATE students SET pin_salt=?,pin_hash=?,recovery_hash=?,failed_attempts=0,locked_until=0,updated_at=? WHERE id=?').bind(salt,await pinHash(newPin,salt),await sha256(newRecovery),now,student.id),db.prepare('DELETE FROM student_sessions WHERE student_id=?').bind(student.id)]);const token=await createSession(db,student.id);
  return json({ok:true,student:{id:student.id,name:student.display_name,code:student.login_code},token,recoveryCode:newRecovery,revision:student.progress_revision,entries:await loadEntries(db,student.id)});
}

export async function handleCloudProfiles(request:Request,env:CloudProfilesEnv){
  const url=new URL(request.url);if(!url.pathname.startsWith('/api/cloud/'))return null;
  if(!sameOrigin(request))return json({error:'Cross-origin cloud access is not allowed'},{status:403});
  if(url.pathname==='/api/cloud/status')return json({ok:true,configured:Boolean(env.DB)});
  if(!env.DB)return json({error:'Cloud storage is not configured'},{status:503});
  try{await ensureSchema(env.DB)}catch(error){return json({error:'Cloud database is unavailable',detail:error instanceof Error?error.message:'schema_error'},{status:503})}
  if(url.pathname==='/api/cloud/register'&&request.method==='POST')return register(request,env.DB);
  if(url.pathname==='/api/cloud/login'&&request.method==='POST')return login(request,env.DB);
  if(url.pathname==='/api/cloud/snapshot'&&request.method==='GET')return snapshot(request,env.DB);
  if(url.pathname==='/api/cloud/sync'&&request.method==='POST')return sync(request,env.DB);
  if(url.pathname==='/api/cloud/recover'&&request.method==='POST')return recover(request,env.DB);
  return json({error:'Not found'},{status:404});
}
