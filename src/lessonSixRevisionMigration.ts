const REVISION_MARKER='mathnikita:lesson-6-revision-v2-migrated';

export function migrateLessonSixRevision(){
  if(typeof window==='undefined')return;
  try{
    if(window.localStorage.getItem(REVISION_MARKER)==='1')return;
    window.localStorage.removeItem('mathnikita-lesson-6-progress-v1');
    window.localStorage.removeItem('mathnikita:extended-practice:6:v1');
    window.localStorage.removeItem('mathnikita:extended-practice:6:v1:draft');
    window.localStorage.removeItem('mathnikita:reflection:6');
    window.localStorage.removeItem('mathnikita:lesson-complete:6');
    window.localStorage.removeItem('mathnikita:lesson-timing:6:v1');
    window.localStorage.setItem(REVISION_MARKER,'1');
  }catch{/* localStorage can be unavailable in restricted contexts */}
}
