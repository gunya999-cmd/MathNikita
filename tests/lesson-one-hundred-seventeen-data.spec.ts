import {expect,test} from '@playwright/test';
import {lessonOneHundredSeventeenPractice,lessonOneHundredSeventeenResponseCount} from '../src/data/lessonOneHundredSeventeenPractice';
import {lessonOneHundredSeventeenOpening} from '../src/LessonOneHundredSeventeenOpening';

test('lesson 117 exact §32 source data and 20/50 contract are intact',()=>{
 expect(lessonOneHundredSeventeenOpening.kicker).toContain('§ 32 · 2 из 3');expect(lessonOneHundredSeventeenPractice).toHaveLength(20);expect(lessonOneHundredSeventeenResponseCount).toBe(50);
 expect(lessonOneHundredSeventeenPractice.slice(0,5).map(x=>x.source)).toEqual(['№ 845(3)','№ 845(4)','№ 847(4)','№ 847(5)','№ 861']);
 expect(lessonOneHundredSeventeenPractice[0].fields.map(f=>f.answers[0])).toEqual(['26','8','56','62']);
 expect(lessonOneHundredSeventeenPractice[1].fields.map(f=>f.answers[0])).toEqual(['2,398','8,556','47,785']);
 expect(lessonOneHundredSeventeenPractice[2].fields.map(f=>f.answers[0])).toEqual(['5000000','10000000']);
 expect(lessonOneHundredSeventeenPractice[3].fields.map(f=>f.answers[0])).toEqual(['5000','600000','30000000']);
 expect(lessonOneHundredSeventeenPractice[4].fields[0].answers[0]).toBe('4');
});
