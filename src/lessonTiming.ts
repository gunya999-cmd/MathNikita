export type LessonTiming = {
  version:1;
  activeSeconds:number;
  sessions:number;
  updatedAt:string;
};

export function lessonTimingStorageKey(lessonNumber:number){
  return `mathnikita:lesson-timing:${lessonNumber}:v1`;
}

export function loadLessonTiming(lessonNumber:number):LessonTiming{
  try{
    const parsed=JSON.parse(localStorage.getItem(lessonTimingStorageKey(lessonNumber))??'null') as Partial<LessonTiming>|null;
    if(parsed?.version===1)return{
      version:1,
      activeSeconds:Math.max(0,Number(parsed.activeSeconds)||0),
      sessions:Math.max(0,Number(parsed.sessions)||0),
      updatedAt:parsed.updatedAt??new Date().toISOString(),
    };
  }catch{/* ignore corrupted local timing */}
  return{version:1,activeSeconds:0,sessions:0,updatedAt:new Date().toISOString()};
}

export function saveLessonTiming(lessonNumber:number,timing:LessonTiming){
  localStorage.setItem(lessonTimingStorageKey(lessonNumber),JSON.stringify(timing));
}

export function resetLessonTiming(lessonNumber:number){
  localStorage.removeItem(lessonTimingStorageKey(lessonNumber));
}

export function formatActiveLessonTime(seconds:number){
  const whole=Math.max(0,Math.round(seconds));
  const minutes=Math.floor(whole/60);
  const remainder=whole%60;
  if(minutes===0)return `${remainder} сек`;
  return `${minutes} мин ${remainder} сек`;
}
