import {expect,test} from '@playwright/test';
import {lessonOneHundredTenPractice,lessonOneHundredTenResponseCount} from '../src/data/lessonOneHundredTenPractice';
import {lessonOneHundredTenOpening} from '../src/LessonOneHundredTenOpening';

test('lesson 110 exact §30 source data and 20/50 contract are intact',()=>{
 expect(lessonOneHundredTenOpening.kicker).toContain('§ 30 · 2 из 4');expect(lessonOneHundredTenPractice).toHaveLength(20);expect(lessonOneHundredTenResponseCount).toBe(50);
 expect(lessonOneHundredTenPractice.slice(0,4).map(x=>x.source)).toEqual(['№ 799(9–16)','№ 801(4–6)','№ 803(7–8)','№ 805']);
 expect(lessonOneHundredTenPractice[0].fields.map(f=>f.answers[0])).toEqual(['2,003','74,00013','0,006','0,0012','0,00005','1,1','1,01','1,001']);
 expect(lessonOneHundredTenPractice[1].fields.map(f=>f.answers[0])).toEqual(['92,66','8,448','29,48697']);
 expect(lessonOneHundredTenPractice[2].fields.map(f=>f.answers[0])).toEqual(['5 6/100','12 18/1000']);
 expect(lessonOneHundredTenPractice[3].fields.map(f=>f.answers[0])).toEqual(['2,7','30,28','0,013']);
});
