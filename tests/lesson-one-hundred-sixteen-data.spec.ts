import {expect,test} from '@playwright/test';
import {lessonOneHundredSixteenPractice,lessonOneHundredSixteenResponseCount} from '../src/data/lessonOneHundredSixteenPractice';
import {lessonOneHundredSixteenOpening} from '../src/LessonOneHundredSixteenOpening';

test('lesson 116 exact §32 source data and 20/50 contract are intact',()=>{
 expect(lessonOneHundredSixteenOpening.kicker).toContain('§ 32 · 1 из 3');expect(lessonOneHundredSixteenPractice).toHaveLength(20);expect(lessonOneHundredSixteenResponseCount).toBe(50);
 expect(lessonOneHundredSixteenPractice.slice(0,6).map(x=>x.source)).toEqual(['№ 845(1)','№ 845(2)','№ 847(1)','№ 847(2)','№ 847(3)','№ 860(1)']);
 expect(lessonOneHundredSixteenPractice[0].fields.map(f=>f.answers[0])).toEqual(['16,9','4,7','1,3','48,2','37,0']);
 expect(lessonOneHundredSixteenPractice[1].fields.map(f=>f.answers[0])).toEqual(['8,64','2,78','1,00','104,94']);
 expect(lessonOneHundredSixteenPractice[2].fields.map(f=>f.answers[0])).toEqual(['530','18360','4783390']);
 expect(lessonOneHundredSixteenPractice[3].fields.map(f=>f.answers[0])).toEqual(['2200','1400']);
 expect(lessonOneHundredSixteenPractice[4].fields.map(f=>f.answers[0])).toEqual(['313000','67000']);
 expect(lessonOneHundredSixteenPractice[5].fields[0].answers[0]).toBe('138');
});
