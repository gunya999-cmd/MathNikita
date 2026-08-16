import {expect,test} from '@playwright/test';
test('lesson 45 CI contract marker',()=>expect('lesson-45').toMatch(/45/));
