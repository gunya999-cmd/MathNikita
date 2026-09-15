import {extendedPracticeByLesson as baseExtendedPracticeByLesson} from './extendedPracticeDataBase';
import {extendedPracticeLesson83} from './extendedPracticeLesson83';
import {extendedPracticeLesson84} from './extendedPracticeLesson84';
import {extendedPracticeLesson85} from './extendedPracticeLesson85';
import {extendedPracticeLesson86} from './extendedPracticeLesson86';
import {extendedPracticeLesson87} from './extendedPracticeLesson87';
import {extendedPracticeLesson88} from './extendedPracticeLesson88';
import {extendedPracticeLesson89} from './extendedPracticeLesson89';
import {extendedPracticeLesson141} from './extendedPracticeLesson141';
import {extendedPracticeLesson143} from './extendedPracticeLesson143';
import {extendedPracticeLesson144} from './extendedPracticeLesson144';
import {extendedPracticeLesson145} from './extendedPracticeLesson145';
import {extendedPracticeLesson146} from './extendedPracticeLesson146';
import type {ExtendedPracticeSet} from './extendedPracticeTypes';

export const extendedPracticeByLesson:Record<number,ExtendedPracticeSet>={...baseExtendedPracticeByLesson,83:extendedPracticeLesson83,84:extendedPracticeLesson84,85:extendedPracticeLesson85,86:extendedPracticeLesson86,87:extendedPracticeLesson87,88:extendedPracticeLesson88,89:extendedPracticeLesson89,141:extendedPracticeLesson141,143:extendedPracticeLesson143,144:extendedPracticeLesson144,145:extendedPracticeLesson145,146:extendedPracticeLesson146};
export const extendedPracticeLessonNumbers=Object.keys(extendedPracticeByLesson).map(Number);
export type{ExtendedPracticeSet,ExtendedPracticeTask}from'./extendedPracticeTypes';