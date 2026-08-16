import {expect,test} from '@playwright/test';

test('lesson 45 is released while lesson 46 stays locked',async({page})=>{await page.goto('/');const lessons=page.locator('.course-lesson-grid > button');await expect(lessons.nth(44)).toBeEnabled();await expect(lessons.nth(44)).toHaveAccessibleName(/Открыть урок 45:/);await expect(lessons.nth(45)).toBeDisabled();await expect(lessons.nth(45)).toHaveAccessibleName(/Урок 46 в разработке/)});
