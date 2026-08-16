import {expect,test} from '@playwright/test';
import {lessonFortyFiveStages} from '../src/PolygonConstructionPlayer';
import {extendedPracticeLesson45} from '../src/data/extendedPracticeLesson45';

test('lesson 45 follows the second §13 methodology without turning into a repeat of lesson 44',()=>{
  expect(lessonFortyFiveStages).toHaveLength(36);
  expect(lessonFortyFiveStages[0].id).toBe('l45-mission');
  expect(lessonFortyFiveStages.at(-1)?.id).toBe('l45-summary');
  expect(lessonFortyFiveStages.some(stage=>stage.builder)).toBeTruthy();
  const allText=lessonFortyFiveStages.map(stage=>`${stage.title} ${stage.body} ${stage.note??''}`).join(' ');
  expect(allText).toContain('n − 3');
  expect(allText).toContain('n(n − 3) : 2');
  expect(allText).toContain('постро');
  expect(allText).toContain('диагонал');
  expect(allText).toContain('периметр');
  expect(allText).toContain('налож');
  expect(extendedPracticeLesson45.tasks).toHaveLength(20);
  expect(new Set(extendedPracticeLesson45.tasks.map(task=>task.type)).size).toBeGreaterThanOrEqual(2);
});
