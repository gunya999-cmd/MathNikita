import {expect,test} from '@playwright/test';
import {lessonOneHundredFiftySixFields,lessonOneHundredFiftySixResponseCount,lessonOneHundredFiftySixStages,lessonOneHundredFiftySixTaskCount} from '../src/data/lessonOneHundredFiftySixControl';

test('lesson 156 matches control work 9 variant 1 workload and answers',()=>{
 expect(lessonOneHundredFiftySixTaskCount).toBe(6);
 expect(lessonOneHundredFiftySixResponseCount).toBe(6);
 expect(lessonOneHundredFiftySixFields).toHaveLength(6);
 expect(lessonOneHundredFiftySixStages).toHaveLength(9);
 const answers=Object.fromEntries(lessonOneHundredFiftySixFields.map(field=>[field.id,field.answer]));
 expect(answers).toEqual({'l156-1':'35,1','l156-2':'54','l156-3':'300','l156-4':'12,9','l156-5':'10,2','l156-6':'600'});
 for(const text of ['32,6; 38,5; 34; 35,3','Площадь поля равна 300 га','книгу за 90 р.','2 ч со скоростью 12,3 км/ч','Турист прошёл за три дня 48 км','оставшиеся 144 страницы'])expect(lessonOneHundredFiftySixStages.some(stage=>stage.body.includes(text))).toBeTruthy();
});
