import {expect,test} from '@playwright/test';
import {lessonOneHundredTwelvePractice,lessonOneHundredTwelveResponseCount} from '../src/data/lessonOneHundredTwelvePractice';
import {lessonOneHundredTwelveOpening} from '../src/LessonOneHundredTwelveOpening';

test('lesson 112 exact §30 source data and 20/50 contract are intact',()=>{
 expect(lessonOneHundredTwelveOpening.kicker).toContain('§ 30 · 4 из 4');expect(lessonOneHundredTwelvePractice).toHaveLength(20);expect(lessonOneHundredTwelveResponseCount).toBe(50);
 expect(lessonOneHundredTwelvePractice.slice(0,3).map(x=>x.source)).toEqual(['№ 810(4–6)','№ 813','№ 818']);
 expect(lessonOneHundredTwelvePractice[0].fields.map(f=>f.answers[0])).toEqual(['0,5876','2,6435','0,058']);
 expect(lessonOneHundredTwelvePractice[1].fields.map(f=>f.answers[0])).toEqual(['1','6','8','14','19','22']);
 expect(lessonOneHundredTwelvePractice[2].fields.map(f=>f.answers[0])).toEqual(['>','<']);
});
