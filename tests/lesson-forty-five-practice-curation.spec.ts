import {expect,test} from '@playwright/test';
import {extendedPracticeLesson45} from '../src/data/extendedPracticeLesson45';

test('lesson 45 mandatory practice stays fully curated',()=>{expect(extendedPracticeLesson45.tasks.filter(task=>task.provenance==='parametric')).toHaveLength(0);expect(new Set(extendedPracticeLesson45.tasks.map(task=>task.type)).size).toBeGreaterThanOrEqual(2)});
