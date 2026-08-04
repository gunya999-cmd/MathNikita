import { execFileSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';

function git(args,fallback='unknown'){
  try{return execFileSync('git',args,{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim()||fallback}catch{return fallback}
}

const gitSha=process.env.WORKERS_CI_COMMIT_SHA||process.env.GITHUB_SHA||git(['rev-parse','HEAD']);
const branch=process.env.WORKERS_CI_BRANCH||process.env.GITHUB_REF_NAME||git(['branch','--show-current']);
const buildUuid=process.env.WORKERS_CI_BUILD_UUID||process.env.GITHUB_RUN_ID||'local';
const generatedAt=new Date().toISOString();
const output=`export const BUILD_INFO=${JSON.stringify({gitSha,branch,buildUuid,generatedAt},null,2)} as const;\n`;
await writeFile(new URL('../worker/buildVersion.ts',import.meta.url),output,'utf8');
console.log(`Worker build metadata: ${gitSha.slice(0,12)} (${branch})`);
