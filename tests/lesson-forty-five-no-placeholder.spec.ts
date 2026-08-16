import {expect,test} from '@playwright/test';
import {lessonFortyFiveStages} from '../src/PolygonConstructionPlayer';

test('lesson 45 has no placeholder stages',()=>{const text=JSON.stringify(lessonFortyFiveStages);expect(text).not.toContain('TODO');expect(text).not.toContain('Заглушка');expect(text).not.toContain('Скоро здесь')});
