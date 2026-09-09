import {expect,test} from '@playwright/test';
import {lessonOneHundredTwentyPractice,lessonOneHundredTwentyResponseCount} from '../src/data/lessonOneHundredTwentyPractice';
import {lessonOneHundredTwentyOpening} from '../src/LessonOneHundredTwentyOpening';

test('lesson 120 exact §33 source data and 20/50 contract are intact',()=>{
 expect(lessonOneHundredTwentyOpening.kicker).toContain('§ 33 · 2 из 6');
 expect(lessonOneHundredTwentyPractice).toHaveLength(20);expect(lessonOneHundredTwentyResponseCount).toBe(50);
 expect(lessonOneHundredTwentyPractice.slice(0,4).map(x=>x.source)).toEqual(['Вопрос 2','№ 867','№ 873','№ 875']);
 expect(lessonOneHundredTwentyPractice[0].fields).toHaveLength(4);
 expect(lessonOneHundredTwentyPractice[1].fields.map(f=>f.answers[0])).toEqual(['2,5','9,77','5,22','14,37','3,622','20,66']);
 expect(lessonOneHundredTwentyPractice[2].fields.map(f=>f.answers[0])).toEqual(['18,2','14,6']);
 expect(lessonOneHundredTwentyPractice[3].fields.map(f=>f.answers[0])).toEqual(['70','71,5']);
});
