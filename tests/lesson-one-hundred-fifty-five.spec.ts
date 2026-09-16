import {expect,test} from '@playwright/test';
import {lessonOneHundredFiftyFivePractice,lessonOneHundredFiftyFiveResponseCount} from '../src/data/lessonOneHundredFiftyFivePractice';
import {extendedPracticeByLesson} from '../src/data/extendedPracticeData';

test('lesson 155 rehearsal has 20 curated cards and exactly 50 responses',()=>{
 expect(lessonOneHundredFiftyFivePractice).toHaveLength(20);
 expect(lessonOneHundredFiftyFiveResponseCount).toBe(50);
 expect(lessonOneHundredFiftyFivePractice.every(task=>task.sourceExact===false)).toBeTruthy();
 expect(lessonOneHundredFiftyFivePractice[0].fields.map(f=>f.answers[0])).toEqual(['76','19','12']);
 expect(lessonOneHundredFiftyFivePractice[8].fields.map(f=>f.answers[0])).toEqual(['250','45','18']);
 expect(lessonOneHundredFiftyFivePractice[19].fields.map(f=>f.answers[0])).toEqual(['24','30','45']);
});

test('lesson 155 mandatory practice is registered with exact decimal validation',()=>{
 const set=extendedPracticeByLesson[155];
 expect(set).toBeTruthy();
 expect(set.tasks).toHaveLength(20);
 expect(set.tasks.reduce((sum,t)=>sum+(t.fields?.length??0),0)).toBe(50);
 for(const task of set.tasks)for(const field of task.fields??[])expect(field.validation).toBe('exact-decimal');
});
