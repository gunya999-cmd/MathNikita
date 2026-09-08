import {expect,test} from '@playwright/test';
import {lessonOneHundredNineteenPractice,lessonOneHundredNineteenResponseCount} from '../src/data/lessonOneHundredNineteenPractice';
import {lessonOneHundredNineteenOpening} from '../src/LessonOneHundredNineteenOpening';

test('lesson 119 exact §33 source data and 20/50 contract are intact',()=>{
 expect(lessonOneHundredNineteenOpening.kicker).toContain('§ 33 · 1 из 6');
 expect(lessonOneHundredNineteenPractice).toHaveLength(20);expect(lessonOneHundredNineteenResponseCount).toBe(50);
 expect(lessonOneHundredNineteenPractice.slice(0,3).map(x=>x.source)).toEqual(['Вопрос 1','№ 865','№ 871']);
 expect(lessonOneHundredNineteenPractice[0].fields).toHaveLength(4);
 expect(lessonOneHundredNineteenPractice[1].fields.map(f=>f.answers[0])).toEqual(['10,5','10,35','20,2','1,552','19,091','94,5']);
 expect(lessonOneHundredNineteenPractice[2].fields.map(f=>f.answers[0])).toEqual(['23,5','41,1']);
});
