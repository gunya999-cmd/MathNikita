import {expect,test} from '@playwright/test';

test('lesson 45 catalog boundary remains exactly 45 released lessons',async({page})=>{await page.goto('/');await expect(page.locator('.course-lesson-grid > button:not([disabled])')).toHaveCount(45);await expect(page.locator('.course-lesson-grid > button.is-interactive')).toHaveCount(43);await expect(page.locator('.course-lesson-grid > button.is-control-ready')).toHaveCount(2)});
