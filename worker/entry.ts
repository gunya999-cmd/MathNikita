import legacyWorker from './index';
import {handleCloudProfiles,type CloudProfilesEnv} from './cloudProfiles';
import {BUILD_INFO} from './buildVersion';

type Env=CloudProfilesEnv&{
  ASSETS:Fetcher;
  OPENAI_API_KEY?:string;
  GEMINI_API_KEY?:string;
  CF_VERSION_METADATA:WorkerVersionMetadata;
};

function versionResponse(env:Env){
  const worker=env.CF_VERSION_METADATA;
  return new Response(JSON.stringify({
    ok:true,
    app:'mathnikita',
    gitSha:BUILD_INFO.gitSha,
    branch:BUILD_INFO.branch,
    buildUuid:BUILD_INFO.buildUuid,
    builtAt:BUILD_INFO.generatedAt,
    workerVersion:{id:worker.id,tag:worker.tag??null,timestamp:worker.timestamp},
  }),{headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
}

export default{
  async fetch(request:Request,env:Env,ctx:ExecutionContext):Promise<Response>{
    const url=new URL(request.url);
    if(url.pathname==='/api/version'){
      if(request.method!=='GET'&&request.method!=='HEAD')return new Response(JSON.stringify({error:'Method not allowed'}),{status:405,headers:{'content-type':'application/json; charset=utf-8','allow':'GET, HEAD'}});
      const response=versionResponse(env);
      return request.method==='HEAD'?new Response(null,{status:response.status,headers:response.headers}):response;
    }
    const cloudResponse=await handleCloudProfiles(request,env);
    if(cloudResponse)return cloudResponse;
    return legacyWorker.fetch(request,env,ctx);
  },
};
