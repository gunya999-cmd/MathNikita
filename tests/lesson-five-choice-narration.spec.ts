import { expect,test } from '@playwright/test';

test('lesson 5 narrator reads choice options and feedback in mandatory practice',async({page})=>{
  await page.addInitScript(()=>{
    const log:string[]=[];
    const voice={name:'Milena Enhanced',lang:'ru-RU',voiceURI:'ru-enhanced',localService:true,default:true};
    class MockUtterance{
      text:string;lang='';voice:typeof voice|null=null;rate=1;pitch=1;volume=1;onend:(()=>void)|null=null;onerror:(()=>void)|null=null;
      constructor(text=''){this.text=text}
    }
    const synthesis={
      getVoices:()=>[voice],speak:(utterance:MockUtterance)=>log.push(utterance.text),cancel:()=>undefined,pause:()=>undefined,resume:()=>undefined,
      addEventListener:()=>undefined,removeEventListener:()=>undefined,get speaking(){return false},get pending(){return false},get paused(){return false},
    };
    Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,writable:true,value:MockUtterance});
    Object.defineProperty(window,'speechSynthesis',{configurable:true,value:synthesis});
    (window as unknown as {__speech:string[]}).__speech=log;
    localStorage.setItem('mathnikita-selected-lesson','5');
    localStorage.setItem('mathnikita-voice-settings-v3',JSON.stringify({engine:'system',voiceURI:'ru-enhanced',rate:.94}));
    localStorage.setItem('mathnikita-lesson-5-progress-v1',JSON.stringify({
      version:1,stageIndex:23,responses:{},orders:{},checked:{},
      results:{'l5-p1':true,'l5-p2':true,'l5-p3':true,'l5-p4':true,'l5-p5':true,'l5-p6':true,'l5-q1':true,'l5-q2':true,'l5-q3':true,'l5-q4':true,'l5-q5':true},
      completedAt:new Date().toISOString(),
    }));
    localStorage.setItem('mathnikita:extended-practice:5:v2','0');
  });

  await page.goto('/');
  await page.getByRole('button',{name:/Открыть урок 5:/}).click();
  await page.locator('.lesson-opening-start').click();
  const task=page.locator('[data-practice-task="l5-p1"]');
  await expect(task).toBeVisible();

  const narrator=page.locator('.voice-narrator > button').first();
  await narrator.click();
  let spoken=await page.evaluate(()=>(window as unknown as {__speech:string[]}).__speech.join(' '));
  expect(spoken).toContain('Какое разложение верно');
  expect(spoken).toContain('500 000 000 плюс 40 000 000 плюс 7 000 плюс 20');
  await narrator.click();

  await task.getByRole('button',{name:'500 000 000 + 4 000 000 + 7 000 + 20',exact:true}).click();
  await task.getByRole('button',{name:'Проверить'}).click();
  await expect(task.locator('.extended-practice-feedback.is-wrong')).toBeVisible();
  await narrator.click();
  spoken=await page.evaluate(()=>(window as unknown as {__speech:string[]}).__speech.join(' '));
  expect(spoken).toContain('Пока неверно');
  expect(spoken).toContain('Проверь значение каждой ненулевой цифры');
});
