import { useEffect,useRef,useState,type KeyboardEvent,type MouseEvent } from 'react';
import { allRichLessons } from './data/richLessonContent';
import { totalLessons,yearLessonByNumber } from './data/yearPlan';
import { CourseCatalog } from './CourseCatalog';
import { LessonPlayer } from './LessonPlayer';
import { NaturalRowPracticePlayer } from './NaturalRowPracticePlayer';
import { DecimalNotationPlayer } from './DecimalNotationPlayer';
import { PlaceValueMasteryPlayer } from './PlaceValueMasteryPlayer';
import { DecimalNotationMasteryPlayer } from './DecimalNotationMasteryPlayer';
import { SegmentLengthPlayer } from './SegmentLengthPlayer';
import { SegmentLengthPracticePlayer } from './SegmentLengthPracticePlayer';
import { PolylineLessonPlayer } from './PolylineLessonPlayer';
import { GeometrySummaryPlayer } from './GeometrySummaryPlayer';
import { PlaneLineRayPlayer } from './PlaneLineRayPlayer';
import { PlaneLineRayPracticePlayer } from './PlaneLineRayPracticePlayer';
import { PlaneLineRaySummaryPlayer } from './PlaneLineRaySummaryPlayer';
import { ScaleCoordinateRayPlayer } from './ScaleCoordinateRayPlayer';
import { ScaleCoordinateRayPracticePlayer } from './ScaleCoordinateRayPracticePlayer';
import { ScaleCoordinateRaySummaryPlayer } from './ScaleCoordinateRaySummaryPlayer';
import { NaturalNumberComparisonPlayer } from './NaturalNumberComparisonPlayer';
import { NaturalNumberComparisonPracticePlayer } from './NaturalNumberComparisonPracticePlayer';
import { NaturalNumberComparisonSummaryPlayer } from './NaturalNumberComparisonSummaryPlayer';
import { ChapterOneReviewPlayer } from './ChapterOneReviewPlayer';
import { ControlWorkOnePlayer } from './ControlWorkOnePlayer';
import { NaturalNumberAdditionPlayer } from './NaturalNumberAdditionPlayer';
import { AdditionPropertiesPlayer } from './AdditionPropertiesPlayer';
import { AdditionPropertiesPracticePlayer } from './AdditionPropertiesPracticePlayer';
import { LessonOpening,buildGenericOpening,lessonOneOpening,lessonTwoOpening,lessonThreeOpening,lessonFourOpening,lessonFiveOpening,lessonSixOpening,lessonSevenOpening,lessonEightOpening,lessonNineOpening,lessonTenOpening,lessonElevenOpening } from './LessonOpening';
import { lessonThirteenOpening } from './LessonThirteenOpening';
import { lessonFourteenOpening } from './LessonFourteenOpening';
import { lessonFifteenOpening } from './LessonFifteenOpening';
import { lessonSixteenOpening } from './LessonSixteenOpening';
import { lessonSeventeenOpening } from './LessonSeventeenOpening';
import { lessonEighteenOpening } from './LessonEighteenOpening';
import { lessonNineteenOpening } from './LessonNineteenOpening';
import { lessonTwentyOpening } from './LessonTwentyOpening';
import { lessonTwentyOneOpening } from './LessonTwentyOneOpening';
import { lessonTwentyTwoOpening } from './LessonTwentyTwoOpening';
import { lessonTwentyThreeOpening } from './LessonTwentyThreeOpening';
import { LessonReflection } from './LessonReflection';
import { ProgressiveHintCoach,type ProgressiveHintState } from './ProgressiveHintCoach';
import { VoiceNarrator } from './VoiceNarrator';
import { CatMentor,type MentorSignal } from './CatMentor';
import { LessonResponsePersistence } from './LessonResponsePersistence';
import { LessonAnalyticsTracker } from './LessonAnalyticsTracker';
import { MentorResponsiveBehavior } from './MentorResponsiveBehavior';

type CourseMode='catalog'|'opening'|'lesson';
const emptyHintState:ProgressiveHintState={prompt:'',stageTitle:'',activityType:'',attempts:0,revealedLevel:0,fullExplanation:'',mountNode:null};
const emptyMentorSignal:MentorSignal={kind:'idle',version:0};
const readyLessons=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];

function loadSelectedLesson(){
  const saved=Number(localStorage.getItem('mathnikita-selected-lesson'));
  return readyLessons.includes(saved)?saved:1;
}

export function LessonCourseShell(){
  const[selectedLesson,setSelectedLesson]=useState(loadSelectedLesson);
  const[mode,setMode]=useState<CourseMode>('catalog');
  const[showReflection,setShowReflection]=useState(false);
  const[hintState,setHintState]=useState<ProgressiveHintState>(emptyHintState);
  const[mentorSignal,setMentorSignal]=useState<MentorSignal>(emptyMentorSignal);
  const shellRef=useRef<HTMLDivElement>(null);
  const feedbackTimerRef=useRef<number|null>(null);
  const lesson=allRichLessons.find(item=>item.lessonNumber===selectedLesson)??allRichLessons[0];
  const officialLesson=yearLessonByNumber.get(selectedLesson);
  const isControlWork=selectedLesson===20;
  const opening=
    selectedLesson===1?lessonOneOpening:
    selectedLesson===2?lessonTwoOpening:
    selectedLesson===3?lessonThreeOpening:
    selectedLesson===4?lessonFourOpening:
    selectedLesson===5?lessonFiveOpening:
    selectedLesson===6?lessonSixOpening:
    selectedLesson===7?lessonSevenOpening:
    selectedLesson===8?lessonEightOpening:
    selectedLesson===9?lessonNineOpening:
    selectedLesson===10?lessonTenOpening:
    selectedLesson===11?lessonElevenOpening:
    selectedLesson===13?lessonThirteenOpening:
    selectedLesson===14?lessonFourteenOpening:
    selectedLesson===15?lessonFifteenOpening:
    selectedLesson===16?lessonSixteenOpening:
    selectedLesson===17?lessonSeventeenOpening:
    selectedLesson===18?lessonEighteenOpening:
    selectedLesson===19?lessonNineteenOpening:
    selectedLesson===20?lessonTwentyOpening:
    selectedLesson===21?lessonTwentyOneOpening:
    selectedLesson===22?lessonTwentyTwoOpening:
    selectedLesson===23?lessonTwentyThreeOpening:
    buildGenericOpening(lesson);
  const showOpening=mode==='opening';
  const openingNarrationText=[opening.title,opening.intro,opening.question,...opening.goals].filter(Boolean).join('. ');

  function clearHints(){setHintState(emptyHintState)}
  function resetMentor(){setMentorSignal(previous=>({kind:'idle',version:previous.version+1}))}
  function signalMentor(kind:MentorSignal['kind']){setMentorSignal(previous=>({kind,version:previous.version+1}))}
  function stopVoice(){if('speechSynthesis'in window)window.speechSynthesis.cancel();window.dispatchEvent(new CustomEvent('mathnikita-stop-narration'))}
  function openLesson(lessonNumber:number){
    if(!readyLessons.includes(lessonNumber))return;
    stopVoice();
    setSelectedLesson(lessonNumber);
    localStorage.setItem('mathnikita-selected-lesson',String(lessonNumber));
    setShowReflection(false);
    clearHints();
    resetMentor();
    setMode('opening');
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function returnToCatalog(){
    stopVoice();
    setMode('catalog');
    setShowReflection(false);
    clearHints();
    resetMentor();
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function scheduleFeedbackAssessment(){
    if(isControlWork)return;
    if(feedbackTimerRef.current!==null)window.clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current=window.setTimeout(()=>{
      const root=shellRef.current;
      if(!root)return;
      const good=root.querySelector<HTMLElement>('.instant-feedback.good');
      if(good){clearHints();signalMentor('correct');return}
      const bad=root.querySelector<HTMLElement>('.instant-feedback.bad');
      const stage=root.querySelector<HTMLElement>('.interactive-stage');
      if(!bad||!stage)return;
      signalMentor('wrong');
      const prompt=stage.querySelector<HTMLElement>('.activity-area h3')?.textContent?.trim()??'Текущее задание';
      const stageTitle=stage.querySelector<HTMLElement>('.stage-copy h2')?.textContent?.trim()??'Задание';
      const fullExplanation=bad.dataset.explanation??bad.querySelector<HTMLElement>('span')?.textContent?.trim()??'Вернись к правилу урока и проверь каждый шаг.';
      const activityType=stage.querySelector('.order-bank')?'order':stage.querySelector('.inline-answer input')?'input':stage.querySelector('.compare-board')?'compare':stage.querySelector('.number-line')?'number-line':'choice';
      setHintState(previous=>{
        const same=previous.prompt===prompt&&previous.stageTitle===stageTitle;
        const attempts=same?previous.attempts+1:1;
        const automaticLevel=Math.min(attempts,3);
        return{prompt,stageTitle,activityType,attempts,revealedLevel:same?Math.max(previous.revealedLevel,automaticLevel):automaticLevel,fullExplanation,mountNode:stage};
      });
    },80);
  }

  useEffect(()=>{
    const root=shellRef.current;
    if(!root||mode!=='lesson'||isControlWork)return;
    const update=()=>setShowReflection(Boolean(root.querySelector('.stage-summary, .block-summary, .summary-card')));
    update();
    const observer=new MutationObserver(update);
    observer.observe(root,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
    return()=>observer.disconnect();
  },[mode,selectedLesson,isControlWork]);
  useEffect(()=>{
    stopVoice();
    clearHints();
    resetMentor();
    return()=>{if(feedbackTimerRef.current!==null)window.clearTimeout(feedbackTimerRef.current)};
  },[mode,selectedLesson]);
  useEffect(()=>{
    const handleStageJump=()=>{stopVoice();clearHints();resetMentor()};
    window.addEventListener('mathnikita-go-to-stage',handleStageJump);
    return()=>window.removeEventListener('mathnikita-go-to-stage',handleStageJump);
  },[]);

  function handleCourseClick(event:MouseEvent<HTMLDivElement>){
    if(isControlWork)return;
    const target=event.target as HTMLElement;
    if(target.closest('.check-button'))scheduleFeedbackAssessment();
    if(target.closest('.lesson-controls button')){stopVoice();clearHints();resetMentor()}
  }
  function handleCourseKeyDown(event:KeyboardEvent<HTMLDivElement>){
    if(isControlWork)return;
    const target=event.target as HTMLElement;
    if(event.key==='Enter'&&target.closest('.inline-answer input'))scheduleFeedbackAssessment();
  }

  if(mode==='catalog')return <CourseCatalog selectedLesson={selectedLesson} onOpenLesson={openLesson}/>;

  const runtime=
    selectedLesson===23?<AdditionPropertiesPracticePlayer key="lesson-23"/>:
    selectedLesson===22?<AdditionPropertiesPlayer key="lesson-22"/>:
    selectedLesson===21?<NaturalNumberAdditionPlayer key="lesson-21"/>:
    selectedLesson===20?<ControlWorkOnePlayer key="lesson-20"/>:
    selectedLesson===19?<ChapterOneReviewPlayer key="lesson-19"/>:
    selectedLesson===18?<NaturalNumberComparisonSummaryPlayer key="lesson-18"/>:
    selectedLesson===17?<NaturalNumberComparisonPracticePlayer key="lesson-17"/>:
    selectedLesson===16?<NaturalNumberComparisonPlayer key="lesson-16"/>:
    selectedLesson===15?<ScaleCoordinateRaySummaryPlayer key="lesson-15"/>:
    selectedLesson===14?<ScaleCoordinateRayPracticePlayer key="lesson-14"/>:
    selectedLesson===13?<ScaleCoordinateRayPlayer key="lesson-13"/>:
    selectedLesson===12?<PlaneLineRaySummaryPlayer key="lesson-12"/>:
    selectedLesson===11?<PlaneLineRayPracticePlayer key="lesson-11"/>:
    selectedLesson===10?<PlaneLineRayPlayer key="lesson-10"/>:
    selectedLesson===9?<GeometrySummaryPlayer key="lesson-9"/>:
    selectedLesson===8?<PolylineLessonPlayer key="lesson-8"/>:
    selectedLesson===7?<SegmentLengthPracticePlayer key="lesson-7"/>:
    selectedLesson===6?<SegmentLengthPlayer key="lesson-6"/>:
    selectedLesson===5?<DecimalNotationMasteryPlayer key="lesson-5"/>:
    selectedLesson===4?<PlaceValueMasteryPlayer key="lesson-4"/>:
    selectedLesson===3?<DecimalNotationPlayer key="lesson-3"/>:
    selectedLesson===2?<NaturalRowPracticePlayer key="lesson-2"/>:
    <LessonPlayer key="lesson-1"/>;

  return <div ref={shellRef} className={`lesson-course-shell ${showOpening?'is-opening':'is-learning'} ${isControlWork?'is-control-work':''}`} onClickCapture={handleCourseClick} onKeyDownCapture={handleCourseKeyDown}>
    <LessonAnalyticsTracker rootRef={shellRef} lessonNumber={selectedLesson} active={mode==='lesson'}/>
    {!isControlWork?<LessonResponsePersistence rootRef={shellRef} lessonNumber={selectedLesson} active={mode==='lesson'}/>:null}
    {!isControlWork?<MentorResponsiveBehavior rootRef={shellRef} lessonNumber={selectedLesson} mode={showOpening?'opening':'lesson'}/>:null}
    <div className="lesson-mode-toolbar">
      <button type="button" onClick={returnToCatalog}>← Все уроки</button>
      <div><span>Урок {selectedLesson} из {totalLessons}</span><b>{officialLesson?.title??lesson.title}</b></div>
      <VoiceNarrator rootRef={shellRef} mode={showOpening?'opening':'lesson'} lessonNumber={selectedLesson} openingText={openingNarrationText}/>
      {mode==='lesson'?<button type="button" onClick={()=>setMode('opening')}>Вступление</button>:<span/>}
    </div>
    <div className={`mentor-learning-layout ${isControlWork?'control-layout':''}`}>
      <div className="mentor-learning-main">
        <div className="opening-screen" hidden={!showOpening}><LessonOpening data={opening} onStart={()=>setMode('lesson')}/></div>
        <div className="lesson-runtime" hidden={mode!=='lesson'}>{runtime}</div>
        {!isControlWork?<ProgressiveHintCoach state={hintState} onRevealNext={()=>setHintState(previous=>({...previous,revealedLevel:Math.min(previous.revealedLevel+1,4)}))}/>:null}
        {mode==='lesson'&&showReflection&&!isControlWork?<LessonReflection key={selectedLesson} lessonNumber={selectedLesson} lessonTitle={officialLesson?.title??lesson.title} openingQuestion={opening.question} goals={opening.goals} onReviewOpening={()=>{setShowReflection(false);setMode('opening');clearHints();resetMentor();window.scrollTo({top:0,behavior:'smooth'})}}/>:null}
      </div>
      {!isControlWork?<CatMentor rootRef={shellRef} lessonNumber={selectedLesson} mode={showOpening?'opening':'lesson'} signal={mentorSignal}/>:null}
    </div>
  </div>;
}
