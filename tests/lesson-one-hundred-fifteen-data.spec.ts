import {expect,test} from '@playwright/test';
import {lessonOneHundredFifteenPractice,lessonOneHundredFifteenResponseCount} from '../src/data/lessonOneHundredFifteenPractice';
import {lessonOneHundredFifteenOpening} from '../src/LessonOneHundredFifteenOpening';

test('lesson 115 exact §31 source data and 20/50 contract are intact',()=>{
 expect(lessonOneHundredFifteenOpening.kicker).toContain('§ 31 · 3 из 3');expect(lessonOneHundredFifteenPractice).toHaveLength(20);expect(lessonOneHundredFifteenResponseCount).toBe(50);
 expect(lessonOneHundredFifteenPractice.slice(0,4).map(x=>x.source)).toEqual(['№ 834','№ 836','№ 842','№ 843 · дополнительная']);
 expect(lessonOneHundredFifteenPractice[0].fields.map(f=>f.answers[0])).toEqual(['1,1','1,01','4,001','10,0001']);
 expect(lessonOneHundredFifteenPractice[1].fields.map(f=>f.answers[0])).toEqual(['10,537','10,542','10,549']);expect(lessonOneHundredFifteenPractice[1].distinct).toBe(true);
 expect(lessonOneHundredFifteenPractice[1].fields.every(f=>f.minExclusive===10.53&&f.maxExclusive===10.55)).toBe(true);
 expect(lessonOneHundredFifteenPractice[2].fields.map(f=>f.answers[0])).toEqual(['123','132','213','231','312','321']);
 expect(lessonOneHundredFifteenPractice[3].fields[0].answers).toContain('90с');
});
