import {expect,test} from '@playwright/test';
import {lessonOneHundredFourteenPractice,lessonOneHundredFourteenResponseCount} from '../src/data/lessonOneHundredFourteenPractice';
import {lessonOneHundredFourteenOpening} from '../src/LessonOneHundredFourteenOpening';

test('lesson 114 exact §31 source data and 20/50 contract are intact',()=>{
 expect(lessonOneHundredFourteenOpening.kicker).toContain('§ 31 · 2 из 3');expect(lessonOneHundredFourteenPractice).toHaveLength(20);expect(lessonOneHundredFourteenResponseCount).toBe(50);
 expect(lessonOneHundredFourteenPractice.slice(0,3).map(x=>x.source)).toEqual(['№ 828','№ 830','№ 832']);
 expect(lessonOneHundredFourteenPractice[0].fields.map(f=>f.answers[0])).toEqual(['8','13','14','15','16','17','18','19']);
 expect(lessonOneHundredFourteenPractice[1].fields.map(f=>f.answers[0])).toEqual(['5','6','24','25']);
 expect(lessonOneHundredFourteenPractice[2].fields.map(f=>f.answers[0])).toEqual(['0','012345','789']);
});
