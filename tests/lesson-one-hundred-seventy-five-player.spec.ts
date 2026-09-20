import {expect,test} from '@playwright/test';
import fs from 'node:fs';

test('lesson 175 player keeps final-control contract',()=>{
  const source=fs.readFileSync('src/FinalCourseControlPlayer.tsx','utf8');
  expect(source).toContain("mathnikita:lesson-complete:175");
  expect(source).toContain('lessonNumber!==175');
  expect(source).toContain('Сдать итоговую работу');
  expect(source).toContain('Курс из 175 уроков завершён.');
  expect(source).toContain('submittedResponses');
  expect(source).toContain('data-control-work="final"');
  expect(source).not.toContain('instant-feedback');
  expect(source).not.toContain('Проверить</button>');
});
