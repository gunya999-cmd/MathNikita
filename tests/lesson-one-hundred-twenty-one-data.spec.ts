import {expect,test} from '@playwright/test';
import {lessonOneHundredTwentyOnePractice,lessonOneHundredTwentyOneResponseCount} from '../src/data/lessonOneHundredTwentyOnePractice';
import {lessonOneHundredTwentyOneOpening} from '../src/LessonOneHundredTwentyOneOpening';

test('lesson 121 exact §33 source data and 20/50 contract are intact',()=>{
 expect(lessonOneHundredTwentyOneOpening.kicker).toContain('§ 33 · 3 из 6');
 expect(lessonOneHundredTwentyOnePractice).toHaveLength(20);expect(lessonOneHundredTwentyOneResponseCount).toBe(50);
 expect(lessonOneHundredTwentyOnePractice.slice(0,3).map(x=>x.source)).toEqual(['№ 869','№ 882','№ 892']);
 expect(lessonOneHundredTwentyOnePractice[0].fields.map(f=>f.answers[0])).toEqual(['4,38','2,272','56','7,86']);
 expect(lessonOneHundredTwentyOnePractice[1].fields.map(f=>f.answers[0])).toEqual(['1,54','70','445']);
 expect(lessonOneHundredTwentyOnePractice[2].fields.map(f=>f.answers[0])).toEqual(['91,35','11,987']);
});
