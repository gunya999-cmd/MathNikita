import {expect,test} from '@playwright/test';
import {lessonOneHundredEighteenPractice,lessonOneHundredEighteenResponseCount} from '../src/data/lessonOneHundredEighteenPractice';
import {lessonOneHundredEighteenOpening} from '../src/LessonOneHundredEighteenOpening';

test('lesson 118 exact §32 source data and 20/50 contract are intact',()=>{
 expect(lessonOneHundredEighteenOpening.kicker).toContain('§ 32 · 3 из 3');expect(lessonOneHundredEighteenPractice).toHaveLength(20);expect(lessonOneHundredEighteenResponseCount).toBe(50);
 expect(lessonOneHundredEighteenPractice.slice(0,7).map(x=>x.source)).toEqual(['№ 850(1)','№ 850(2)','№ 850(3)','№ 850(4)','№ 854','№ 856','№ 858']);
 expect(lessonOneHundredEighteenPractice[0].fields.map(f=>f.answers[0])).toEqual(['5,9','десятых']);
 expect(lessonOneHundredEighteenPractice[1].fields.map(f=>f.answers[0])).toEqual(['3,53','сотых']);
 expect(lessonOneHundredEighteenPractice[2].fields.map(f=>f.answers[0])).toEqual(['20,78','сотых']);
 expect(lessonOneHundredEighteenPractice[3].fields.map(f=>f.answers[0])).toEqual(['2,335','тысячных']);
 expect(lessonOneHundredEighteenPractice[4].fields.map(f=>f.answers[0])).toEqual(['1','5','7','18','325','550']);
 expect(lessonOneHundredEighteenPractice[5].fields.map(f=>f.answers[0])).toEqual(['0 1 2 3 4','5 6 7 8 9']);
 expect(lessonOneHundredEighteenPractice[6].fields.map(f=>f.answers[0])).toEqual(['100','30','3000','невозможно']);
});
