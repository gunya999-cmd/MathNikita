import type {ReactNode} from 'react';
import type {LessonOpeningData} from './LessonOpening';
import {lateOpeningForLesson as baseOpeningForLesson,lateRuntimeForLesson as baseRuntimeForLesson} from './LateLessonRegistryBase';
import {lessonOneHundredFiftyThreeOpening} from './LessonOneHundredFiftyThreeOpening';
import {InversePercentFinalePlayer} from './InversePercentFinalePlayer';
import {lessonOneHundredFiftyFourOpening} from './LessonOneHundredFiftyFourOpening';
import {MeanPercentReviewPlayer} from './MeanPercentReviewPlayer';
import {lessonOneHundredFiftyFiveOpening} from './LessonOneHundredFiftyFiveOpening';
import {ControlNineRehearsalPlayer} from './ControlNineRehearsalPlayer';

export const LATEST_READY_LESSON=155;

export function lateOpeningForLesson(lessonNumber:number):LessonOpeningData|null{
  if(lessonNumber===153)return lessonOneHundredFiftyThreeOpening;
  if(lessonNumber===154)return lessonOneHundredFiftyFourOpening;
  if(lessonNumber===155)return lessonOneHundredFiftyFiveOpening;
  return baseOpeningForLesson(lessonNumber);
}

export function lateRuntimeForLesson(lessonNumber:number):ReactNode|null{
  if(lessonNumber===153)return <InversePercentFinalePlayer key="lesson-153"/>;
  if(lessonNumber===154)return <MeanPercentReviewPlayer key="lesson-154"/>;
  if(lessonNumber===155)return <ControlNineRehearsalPlayer key="lesson-155"/>;
  return baseRuntimeForLesson(lessonNumber);
}
