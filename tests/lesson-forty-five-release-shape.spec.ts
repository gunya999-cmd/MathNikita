import {expect,test} from '@playwright/test';
import {yearLessonByNumber} from '../src/data/yearPlan';
import {extendedPracticeByLesson} from '../src/data/extendedPracticeData';

test('lesson 45 release boundary is internally consistent',()=>{expect(yearLessonByNumber.get(45)?.available).toBeTruthy();expect(yearLessonByNumber.get(45)?.paragraph).toBe('§ 13');expect(yearLessonByNumber.get(46)?.available).toBeFalsy();expect(yearLessonByNumber.get(46)?.paragraph).toBe('§ 14');expect(extendedPracticeByLesson[45]?.tasks).toHaveLength(20)});
