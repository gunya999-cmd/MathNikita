const REVISION_V2_MARKER='mathnikita:lesson-13-revision-v2-migrated';

export function migrateLessonThirteenRevision(){
  if(typeof window==='undefined')return;
  try{
    if(window.localStorage.getItem(REVISION_V2_MARKER)==='1')return;

    window.localStorage.removeItem('mathnikita-lesson-13-progress-v1');
    window.localStorage.removeItem('mathnikita:extended-practice:13:v1');
    window.localStorage.removeItem('mathnikita:extended-practice:13:v1:draft');
    window.localStorage.removeItem('mathnikita:reflection:13');
    window.localStorage.removeItem('mathnikita:lesson-complete:13');
    window.localStorage.removeItem('mathnikita:lesson-timing:13:v1');
    window.localStorage.setItem(REVISION_V2_MARKER,'1');
  }catch{/* localStorage can be unavailable in restricted contexts */}
}
