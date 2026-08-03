const REVISION_V2_MARKER='mathnikita:lesson-11-revision-v2-migrated';

export function migrateLessonElevenRevision(){
  if(typeof window==='undefined')return;
  try{
    if(window.localStorage.getItem(REVISION_V2_MARKER)==='1')return;

    window.localStorage.removeItem('mathnikita-lesson-11-progress-v1');
    window.localStorage.removeItem('mathnikita:extended-practice:11:v1');
    window.localStorage.removeItem('mathnikita:extended-practice:11:v1:draft');
    window.localStorage.removeItem('mathnikita:reflection:11');
    window.localStorage.removeItem('mathnikita:lesson-complete:11');
    window.localStorage.removeItem('mathnikita:lesson-timing:11:v1');
    window.localStorage.setItem(REVISION_V2_MARKER,'1');
  }catch{/* localStorage can be unavailable in restricted contexts */}
}
