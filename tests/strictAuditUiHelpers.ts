import { expect,type Page,type Locator } from '@playwright/test';
import type { ExtendedPracticeTask } from '../src/data/extendedPracticeTypes';

async function typeLikeLearner(input:Locator,value:string){
  await input.click();
  await input.fill('');
  await input.pressSequentially(value,{delay:1});
  await expect(input).toHaveValue(value);
}

export async function answerMandatoryPractice(practice:Locator,task:ExtendedPracticeTask){
  await expect(practice).toHaveAttribute('data-practice-task',task.id);
  if(task.type==='choice'){
    await practice.locator('.extended-practice-options').getByRole('button',{name:task.answer,exact:true}).click();
  }else if(task.type==='multi-input'){
    const inputs=practice.locator('.extended-practice-multi input');
    await expect(inputs).toHaveCount(task.fields.length);
    for(let index=0;index<task.fields.length;index+=1){
      await typeLikeLearner(inputs.nth(index),task.fields[index].answers[0]);
    }
  }else{
    await typeLikeLearner(practice.locator('.extended-practice-input input'),task.answers[0]);
  }
  const check=practice.locator('.extended-practice-check');
  await expect(check,`Practice check must enable after answering ${task.id}`).toBeEnabled();
  await check.click();
  await expect(practice.locator('.extended-practice-feedback.is-correct')).toBeVisible();
  await practice.locator('.extended-practice-next').click();
}

export async function ensureCatMentorOpen(page:Page){
  const actions=page.locator('.cat-mentor-actions');
  if(await actions.isVisible())return actions;
  const collapsed=page.getByRole('button',{name:'Открыть наставника Пифагора'});
  await expect(collapsed).toBeVisible();
  await collapsed.click();
  await expect(actions).toBeVisible();
  return actions;
}

export async function clickCatMentorAction(page:Page,name:RegExp|string){
  const actions=await ensureCatMentorOpen(page);
  await actions.getByRole('button',{name}).click();
}
