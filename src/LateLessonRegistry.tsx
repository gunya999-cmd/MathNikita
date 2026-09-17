import type {ReactNode} from 'react';
import type {LessonOpeningData} from './LessonOpening';
import {lateOpeningForLesson as baseOpeningForLesson,lateRuntimeForLesson as baseRuntimeForLesson} from './LateLessonRegistryBase';
import {lessonOneHundredFiftyThreeOpening} from './LessonOneHundredFiftyThreeOpening';
import {InversePercentFinalePlayer} from './InversePercentFinalePlayer';
import {lessonOneHundredFiftyFourOpening} from './LessonOneHundredFiftyFourOpening';
import {MeanPercentReviewPlayer} from './MeanPercentReviewPlayer';
import {lessonOneHundredFiftyFiveOpening} from './LessonOneHundredFiftyFiveOpening';
import {ControlNineRehearsalPlayer} from './ControlNineRehearsalPlayer';
import {lessonOneHundredFiftySixOpening} from './LessonOneHundredFiftySixOpening';
import {ControlWorkNineGuard} from './ControlWorkNineGuard';
import {lessonOneHundredFiftySevenOpening} from './LessonOneHundredFiftySevenOpening';
import {NaturalNumberCourseReviewPlayer} from './NaturalNumberCourseReviewPlayer';
import {lessonOneHundredFiftyEightOpening} from './LessonOneHundredFiftyEightOpening';
import {NaturalMultiplicationDivisionReviewPlayer} from './NaturalMultiplicationDivisionReviewPlayer';

export const LATEST_READY_LESSON=158;

export function lateOpeningForLesson(lessonNumber:number):LessonOpeningData|null{
  if(lessonNumber===153)return lessonOneHundredFiftyThreeOpening;
  if(lessonNumber===154)return lessonOneHundredFiftyFourOpening;
  if(lessonNumber===155)return lessonOneHundredFiftyFiveOpening;
  if(lessonNumber===156)return lessonOneHundredFiftySixOpening;
  if(lessonNumber===157)return lessonOneHundredFiftySevenOpening;
  if(lessonNumber===158)return lessonOneHundredFiftyEightOpening;
  return baseOpeningForLesson(lessonNumber);
}

export function lateRuntimeForLesson(lessonNumber:number):ReactNode|null{
  if(lessonNumber===153)return <InversePercentFinalePlayer key="lesson-153"/>;
  if(lessonNumber===154)return <MeanPercentReviewPlayer key="lesson-154"/>;
  if(lessonNumber===155)return <ControlNineRehearsalPlayer key="lesson-155"/>;
  if(lessonNumber===156)return <ControlWorkNineGuard key="lesson-156"/>;
  if(lessonNumber===157)return <NaturalNumberCourseReviewPlayer key="lesson-157"/>;
  if(lessonNumber===158)return <NaturalMultiplicationDivisionReviewPlayer key="lesson-158"/>;
  return baseRuntimeForLesson(lessonNumber);
}
