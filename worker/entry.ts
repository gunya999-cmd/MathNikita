import legacyWorker from './index';
import {handleCloudProfiles,type CloudProfilesEnv} from './cloudProfiles';

type Env=CloudProfilesEnv&{
  ASSETS:Fetcher;
  OPENAI_API_KEY?:string;
  GEMINI_API_KEY?:string;
};

export default{
  async fetch(request:Request,env:Env,ctx:ExecutionContext):Promise<Response>{
    const cloudResponse=await handleCloudProfiles(request,env);
    if(cloudResponse)return cloudResponse;
    return legacyWorker.fetch(request,env,ctx);
  },
};
