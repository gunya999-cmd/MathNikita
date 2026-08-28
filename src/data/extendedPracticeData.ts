import {extendedPracticeByLesson as baseExtendedPracticeByLesson} from './extendedPracticeDataBase';
import {extendedPracticeLesson83} from './extendedPracticeLesson83';
import type {ExtendedPracticeSet} from './extendedPracticeTypes';

export const extendedPracticeByLesson:Record<number,ExtendedPracticeSet>={...baseExtendedPracticeByLesson,83:extendedPracticeLesson83};
export const extendedPracticeLessonNumbers=Object.keys(extendedPracticeByLesson).map(Number);
export type{ExtendedPracticeSet,ExtendedPracticeTask}from'./extendedPracticeTypes';
