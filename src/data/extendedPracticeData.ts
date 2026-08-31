import {extendedPracticeByLesson as baseExtendedPracticeByLesson} from './extendedPracticeDataBase';
import {extendedPracticeLesson83} from './extendedPracticeLesson83';
import {extendedPracticeLesson84} from './extendedPracticeLesson84';
import {extendedPracticeLesson85} from './extendedPracticeLesson85';
import {extendedPracticeLesson86} from './extendedPracticeLesson86';
import {extendedPracticeLesson87} from './extendedPracticeLesson87';
import {extendedPracticeLesson88} from './extendedPracticeLesson88';
import type {ExtendedPracticeSet} from './extendedPracticeTypes';

export const extendedPracticeByLesson:Record<number,ExtendedPracticeSet>={...baseExtendedPracticeByLesson,83:extendedPracticeLesson83,84:extendedPracticeLesson84,85:extendedPracticeLesson85,86:extendedPracticeLesson86,87:extendedPracticeLesson87,88:extendedPracticeLesson88};
export const extendedPracticeLessonNumbers=Object.keys(extendedPracticeByLesson).map(Number);
export type{ExtendedPracticeSet,ExtendedPracticeTask}from'./extendedPracticeTypes';