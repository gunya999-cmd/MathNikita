import {expect,test} from '@playwright/test';
import {lessonOneHundredNinePractice,lessonOneHundredNineResponseCount} from '../src/data/lessonOneHundredNinePractice';
import {lessonOneHundredNineOpening} from '../src/LessonOneHundredNineOpening';

test('lesson 109 exact §30 source data and 20/50 contract are intact',()=>{
 expect(lessonOneHundredNineOpening.kicker).toContain('§ 30 · 1 из 4');expect(lessonOneHundredNinePractice).toHaveLength(20);expect(lessonOneHundredNineResponseCount).toBe(50);
 expect(lessonOneHundredNinePractice.slice(0,3).map(x=>x.source)).toEqual(['№ 799(1–8)','№ 801(1–3)','№ 803(1–6)']);
 expect(lessonOneHundredNinePractice[0].fields.map(f=>f.answers[0])).toEqual(['0,7','0,27','0,574','21,8','9,83','56,144','1,05','18,045']);
 expect(lessonOneHundredNinePractice[1].fields.map(f=>f.answers[0])).toEqual(['3,4','2,55','3,978']);
 expect(lessonOneHundredNinePractice[2].fields.map(f=>f.answers[0])).toEqual(['4 9/10','8 95/100','1 567/1000','2/10','43/1000','8/1000']);
});
