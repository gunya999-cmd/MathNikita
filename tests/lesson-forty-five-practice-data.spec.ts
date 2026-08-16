import {expect,test} from '@playwright/test';
import {extendedPracticeLesson45} from '../src/data/extendedPracticeLesson45';

test('lesson 45 mandatory practice includes construction, diagonals, perimeter and equality',()=>{expect(extendedPracticeLesson45.tasks).toHaveLength(20);const text=extendedPracticeLesson45.tasks.map(task=>task.prompt).join(' ');expect(text).toContain('диагонал');expect(text).toContain('периметр');expect(text).toContain('равн');const ids=extendedPracticeLesson45.tasks.map(task=>task.id);expect(new Set(ids).size).toBe(20)});
