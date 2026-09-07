import {expect,test} from '@playwright/test';
import {lessonOneHundredThirteenPractice,lessonOneHundredThirteenResponseCount} from '../src/data/lessonOneHundredThirteenPractice';
import {lessonOneHundredThirteenOpening} from '../src/LessonOneHundredThirteenOpening';

test('lesson 113 exact §31 source data and 20/50 contract are intact',()=>{
 expect(lessonOneHundredThirteenOpening.kicker).toContain('§ 31 · 1 из 3');expect(lessonOneHundredThirteenPractice).toHaveLength(20);expect(lessonOneHundredThirteenResponseCount).toBe(50);
 expect(lessonOneHundredThirteenPractice.slice(0,3).map(x=>x.source)).toEqual(['№ 824','№ 826','№ 839']);
 expect(lessonOneHundredThirteenPractice[0].fields.map(f=>f.answers[0])).toEqual(['<','>','>','<','<','>']);
 expect(lessonOneHundredThirteenPractice[1].fields.map(f=>f.answers[0])).toEqual(['9,02','9,2','9,53','9,6','9,613','9,8']);
 expect(lessonOneHundredThirteenPractice[2].fields.map(f=>f.answers[0])).toEqual(['10','да']);
});
