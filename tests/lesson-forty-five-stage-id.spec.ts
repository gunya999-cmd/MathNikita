import {expect,test} from '@playwright/test';
import {lessonFortyFiveStages} from '../src/PolygonConstructionPlayer';

test('lesson 45 stage ids are unique and narration-safe',()=>{const ids=lessonFortyFiveStages.map(stage=>stage.id);expect(new Set(ids).size).toBe(ids.length);for(const id of ids)expect(id).toMatch(/^l45-[a-z0-9-]+$/)});
