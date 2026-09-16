import {expect,test} from '@playwright/test';
import {lessonOneHundredFiftyFivePracticeResponseCount,lessonOneHundredFiftyFivePracticeTaskCount,lessonOneHundredFiftyFiveStageCount} from '../src/ControlNineRehearsalPlayer';

test('lesson 155 player keeps 28-stage and 20/50 workload contract',()=>{
 expect(lessonOneHundredFiftyFiveStageCount).toBe(28);
 expect(lessonOneHundredFiftyFivePracticeTaskCount).toBe(20);
 expect(lessonOneHundredFiftyFivePracticeResponseCount).toBe(50);
});
