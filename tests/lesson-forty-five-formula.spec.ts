import {expect,test} from '@playwright/test';
import {lessonFortyFiveStages} from '../src/PolygonConstructionPlayer';

test('lesson 45 diagonal examples remain mathematically consistent',()=>{const answers=lessonFortyFiveStages.flatMap(stage=>stage.activity?[{id:stage.activity.id,answer:stage.activity.answer}]:[]);const byId=new Map(answers.map(item=>[item.id,item.answer]));expect(byId.get('l45-p3')).toBe('2');expect(byId.get('l45-p4')).toBe('3');expect(byId.get('l45-p5')).toBe('5');expect(byId.get('l45-p7')).toBe('5');expect(byId.get('l45-p8')).toBe('9');expect(byId.get('l45-p9')).toBe('14');expect(byId.get('l45-p10')).toBe('20');expect(byId.get('l45-p11')).toBe('9');expect(byId.get('l45-p19')).toBe('54');expect(byId.get('l45-q1')).toBe('35');expect(byId.get('l45-q2')).toBe('11')});
