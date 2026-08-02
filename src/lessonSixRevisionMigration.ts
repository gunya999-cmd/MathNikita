const REVISION_V2_MARKER='mathnikita:lesson-6-revision-v2-migrated';
const PRACTICE_V3_MARKER='mathnikita:lesson-6-practice-v3-migrated';
const PRACTICE_V2_KEY='mathnikita:extended-practice:6:v2';
const PRACTICE_V3_KEY='mathnikita:extended-practice:6:v3';
const PRACTICE_V2_DRAFT=`${PRACTICE_V2_KEY}:draft`;
const PRACTICE_V3_DRAFT=`${PRACTICE_V3_KEY}:draft`;
const V2_TASK_COUNT=18;

export function migrateLessonSixRevision(){
  if(typeof window==='undefined')return;
  try{
    if(window.localStorage.getItem(REVISION_V2_MARKER)!=='1'){
      window.localStorage.removeItem('mathnikita-lesson-6-progress-v1');
      window.localStorage.removeItem('mathnikita:extended-practice:6:v1');
      window.localStorage.removeItem('mathnikita:extended-practice:6:v1:draft');
      window.localStorage.removeItem('mathnikita:reflection:6');
      window.localStorage.removeItem('mathnikita:lesson-complete:6');
      window.localStorage.removeItem('mathnikita:lesson-timing:6:v1');
      window.localStorage.setItem(REVISION_V2_MARKER,'1');
    }

    if(window.localStorage.getItem(PRACTICE_V3_MARKER)!=='1'){
      const previousProgress=window.localStorage.getItem(PRACTICE_V2_KEY);
      if(previousProgress!==null&&window.localStorage.getItem(PRACTICE_V3_KEY)===null){
        const numeric=Number(previousProgress);
        const completed=Number.isFinite(numeric)?Math.min(Math.max(Math.trunc(numeric),0),V2_TASK_COUNT):0;
        window.localStorage.setItem(PRACTICE_V3_KEY,String(completed));
      }

      const previousDraft=window.localStorage.getItem(PRACTICE_V2_DRAFT);
      if(previousDraft!==null&&window.localStorage.getItem(PRACTICE_V3_DRAFT)===null){
        window.localStorage.setItem(PRACTICE_V3_DRAFT,previousDraft);
      }

      window.localStorage.removeItem(PRACTICE_V2_KEY);
      window.localStorage.removeItem(PRACTICE_V2_DRAFT);
      window.localStorage.removeItem('mathnikita:reflection:6');
      window.localStorage.removeItem('mathnikita:lesson-complete:6');
      window.localStorage.setItem(PRACTICE_V3_MARKER,'1');
    }
  }catch{/* localStorage can be unavailable in restricted contexts */}
}
