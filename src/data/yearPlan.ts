export type {LessonType,YearLesson} from './yearPlanBase';
import {yearPlan as baseYearPlan} from './yearPlanBase';

export const yearPlan=baseYearPlan.map(lesson=>lesson.number===83?{...lesson,title:'Объём: обратные и составные задачи',available:true}:lesson.number===84?{...lesson,title:'Объём: итоговое обобщение',available:true}:lesson.number===85?{...lesson,title:'Комбинаторные задачи: систематический перебор',available:true}:lesson.number===86?{...lesson,title:'Комбинаторные задачи: ограничения и перебор',available:true}:lesson.number===87?{...lesson,title:'Комбинаторные задачи: итоговое обобщение',available:true}:lesson.number===88?{...lesson,title:'Повторение главы 3: диагностическая карта',available:true}:lesson.number===89?{...lesson,title:'Повторение главы 3: коррекция перед контрольной',available:true}:lesson.number===90?{...lesson,title:'Контрольная работа № 5',available:true}:lesson.number<=90?{...lesson,available:true}:{...lesson,available:false});
export const totalLessons=yearPlan.length;
export const yearUnits=Array.from(new Set(yearPlan.map(lesson=>lesson.unit)));
export const yearLessonByNumber=new Map(yearPlan.map(lesson=>[lesson.number,lesson]));
if(totalLessons!==175)throw new Error(`Year plan must contain 175 lessons, received ${totalLessons}`);
if(yearPlan.some((lesson,index)=>lesson.number!==index+1))throw new Error('Year plan lesson numbering must be continuous from 1 to 175');