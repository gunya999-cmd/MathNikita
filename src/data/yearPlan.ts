export type {LessonType,YearLesson} from './yearPlanReady152';
import {yearPlan as ready152} from './yearPlanReady152';
export const yearPlan=ready152.map(lesson=>lesson.number===153?{...lesson,title:'Итог §38: составные задачи на нахождение числа по процентам',available:true}:lesson.number===154?{...lesson,title:'Повторение §36–§38: среднее арифметическое и проценты',available:true}:lesson);
export const totalLessons=yearPlan.length;
export const yearUnits=Array.from(new Set(yearPlan.map(lesson=>lesson.unit)));
export const yearLessonByNumber=new Map(yearPlan.map(lesson=>[lesson.number,lesson]));
if(totalLessons!==175)throw new Error(`Year plan must contain 175 lessons, received ${totalLessons}`);
if(yearPlan.some((lesson,index)=>lesson.number!==index+1))throw new Error('Year plan lesson numbering must be continuous from 1 to 175');
