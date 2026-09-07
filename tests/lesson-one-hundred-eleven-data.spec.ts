import {expect,test} from '@playwright/test';
import {lessonOneHundredElevenPractice,lessonOneHundredElevenResponseCount} from '../src/data/lessonOneHundredElevenPractice';
import {lessonOneHundredElevenOpening} from '../src/LessonOneHundredElevenOpening';

test('lesson 111 exact §30 source data and 20/50 contract are intact',()=>{
 expect(lessonOneHundredElevenOpening.kicker).toContain('§ 30 · 3 из 4');expect(lessonOneHundredElevenPractice).toHaveLength(20);expect(lessonOneHundredElevenResponseCount).toBe(50);
 expect(lessonOneHundredElevenPractice.slice(0,3).map(x=>x.source)).toEqual(['№ 808','№ 810(1–3)','№ 816']);
 expect(lessonOneHundredElevenPractice[0].fields.map(f=>f.answers[0])).toEqual(['1,25','0,18','0,44','5,86','0,02','4,65']);
 expect(lessonOneHundredElevenPractice[1].fields.map(f=>f.answers[0])).toEqual(['4,2','0,35','24,84']);
 expect(lessonOneHundredElevenPractice[2].fields.map(f=>f.answers[0])).toEqual(['10']);
});
