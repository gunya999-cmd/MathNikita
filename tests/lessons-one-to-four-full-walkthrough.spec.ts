import {expect,test,type Page} from '@playwright/test';

type Answer=
  |{type:'choice';value:string}
  |{type:'input';value:string}
  |{type:'order';values:string[]}
  |{type:'compare';value:'<'|'='|'>'}
  |{type:'numberline';value:string};

const answers:Record<number,Record<string,Answer>>={
  1:{
    'natural-check':{type:'choice',value:'1, 7, 24'},
    'previous-one':{type:'choice',value:'Такого натурального числа нет'},
    'counterexample':{type:'choice',value:'99 и 100'},
    'choice':{type:'choice',value:'40'},
    'compare':{type:'compare',value:'<'},
    'numberline':{type:'numberline',value:'6'},
    'order':{type:'order',values:['7','9','14','21']},
    'input':{type:'input',value:'499'},
    'bounds':{type:'choice',value:'5, 6, 7, 8'},
    'quiz1':{type:'choice',value:'0'},
    'quiz2':{type:'input',value:'1000'},
    'quiz3':{type:'choice',value:'99'},
    'quiz4':{type:'choice',value:'После каждого натурального числа есть следующее'},
    'quiz5':{type:'order',values:['98','99','100','101']},
    'challenge':{type:'choice',value:'Да, совпадение обязательно'},
  },
  2:{
    'l2-step-one':{type:'choice',value:'17, 18, 19, 20'},
    'l2-between-guided':{type:'choice',value:'5'},
    'l2-between-input':{type:'input',value:'9'},
    'l2-inclusive':{type:'choice',value:'11'},
    'l2-successor-crossing':{type:'input',value:'100000'},
    'l2-predecessor-crossing':{type:'input',value:'99999'},
    'l2-sequence-up':{type:'input',value:'17'},
    'l2-sequence-down':{type:'input',value:'20'},
    'l2-missing':{type:'input',value:'14'},
    'l2-natural-vs-sequence':{type:'choice',value:'37, 38, 39, 40'},
    'l2-counterexample':{type:'choice',value:'2, 4, 6, 8'},
    'l2-order':{type:'order',values:['18','19','20','21','22']},
    'l2-general-rule':{type:'choice',value:'6'},
    'l2-quiz1':{type:'input',value:'400'},
    'l2-quiz2':{type:'input',value:'4'},
    'l2-quiz3':{type:'choice',value:'12, 17, 22, 27'},
    'l2-quiz4':{type:'input',value:'999'},
    'l2-quiz5':{type:'input',value:'60'},
    'l2-challenge':{type:'input',value:'99'},
  },
  3:{
    'l3-digits':{type:'choice',value:'7'},
    'l3-length':{type:'choice',value:'пятизначным'},
    'l3-leading-zero':{type:'choice',value:'7'},
    'l3-split':{type:'input',value:'17 025 543 607'},
    'l3-class-names':{type:'choice',value:'миллионов'},
    'l3-read':{type:'choice',value:'восемь миллионов сорок пять'},
    'l3-write':{type:'input',value:'12005007'},
    'l3-zero-role':{type:'choice',value:'нет тысяч'},
    'l3-expand-practice':{type:'choice',value:'60 000 + 3 000 + 200 + 5'},
    'l3-compose':{type:'input',value:'420308'},
    'l3-place-name':{type:'choice',value:'десятки миллионов'},
    'l3-order':{type:'order',values:['Разбить справа по три цифры','Читать классы слева направо','Добавлять названия классов','Пропускать нулевые классы']},
    'l3-quiz1':{type:'choice',value:'10'},
    'l3-quiz2':{type:'input',value:'4'},
    'l3-quiz3':{type:'input',value:'9000042'},
    'l3-quiz4':{type:'choice',value:'6 десятков тысяч'},
    'l3-quiz5':{type:'input',value:'8050603'},
    'l3-challenge':{type:'input',value:'4'},
  },
  4:{
    'l4-ladder':{type:'choice',value:'в 10 раз'},
    'l4-same-digit':{type:'choice',value:'70 000'},
    'l4-zero':{type:'choice',value:'получится 45'},
    'l4-double-name':{type:'choice',value:'в десятках миллионов'},
    'l4-split':{type:'input',value:'50 803 100 407'},
    'l4-read':{type:'choice',value:'четыре миллиона шесть тысяч двадцать'},
    'l4-write':{type:'input',value:'302070005'},
    'l4-expand-practice':{type:'choice',value:'900 000 000 + 5 000 000 + 40 000 + 300'},
    'l4-compose':{type:'input',value:'600020009'},
    'l4-place-name':{type:'choice',value:'десятки миллионов'},
    'l4-total-ranks':{type:'input',value:'826'},
    'l4-order':{type:'order',values:['Разделить запись справа по три цифры','Подписать классы','Найти разряд внутри класса','Определить значение цифры']},
    'l4-quiz1':{type:'choice',value:'60 000'},
    'l4-quiz2':{type:'input',value:'4'},
    'l4-quiz3':{type:'input',value:'700300042'},
    'l4-quiz4':{type:'choice',value:'250 013'},
    'l4-quiz5':{type:'input',value:'473'},
    'l4-challenge':{type:'input',value:'6'},
  },
};

async function openLesson(page:Page,lessonNumber:number){
  await page.addInitScript(()=>{
    localStorage.setItem('mathnikita-voice-settings-v4',JSON.stringify({engine:'system',rate:.94}));
    localStorage.setItem('mathnikita-mentor-auto-guide','false');
  });
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:new RegExp(`Открыть урок ${lessonNumber}:`)}).click();
  await page.locator('.lesson-opening-start').click();
  await expect(page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]')).toBeVisible();
}

async function answerStage(stage:ReturnType<Page['locator']>,answer:Answer){
  if(answer.type==='input'){
    await stage.locator('.inline-answer input').fill(answer.value);
  }else if(answer.type==='choice'){
    await stage.locator('.choice-grid').getByRole('button',{name:answer.value,exact:true}).click();
  }else if(answer.type==='compare'){
    await stage.locator('.compare-board').getByRole('button',{name:answer.value,exact:true}).click();
  }else if(answer.type==='numberline'){
    await stage.locator('.number-line').getByRole('button',{name:answer.value,exact:true}).click();
  }else{
    for(const value of answer.values)await stage.locator('.order-bank').getByRole('button',{name:value,exact:true}).click();
  }
  await expect(stage.locator('.check-button')).toBeEnabled();
  await stage.locator('.check-button').click();
  await expect(stage.locator('.instant-feedback.good')).toBeVisible();
}

for(let lessonNumber=1;lessonNumber<=4;lessonNumber+=1){
  test(`lesson ${lessonNumber} completes every main exercise with correct scores and no iPad overflow`,async({page})=>{
    test.setTimeout(180_000);
    const pageErrors:string[]=[];
    page.on('pageerror',error=>pageErrors.push(error.message));
    await openLesson(page,lessonNumber);

    const counter=page.locator('.lesson-runtime:not([hidden]) .stage-counter');
    const counterText=await counter.innerText();
    const match=counterText.match(/Этап\s+\d+\s+из\s+(\d+)/i);
    expect(match,`Cannot read stage count for lesson ${lessonNumber}`).toBeTruthy();
    const total=Number(match![1]);
    const visited=new Set<string>();
    const lessonAnswers=answers[lessonNumber];

    for(let step=0;step<total;step+=1){
      const stage=page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]');
      await expect(stage).toBeVisible();
      const stageId=await stage.getAttribute('data-stage-id');
      expect(stageId,`Lesson ${lessonNumber}, stage ${step+1} has no id`).toBeTruthy();
      visited.add(stageId!);

      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
      expect(overflow,`Horizontal overflow in lesson ${lessonNumber}, stage ${stageId}`).toBeLessThanOrEqual(2);

      const answer=lessonAnswers[stageId!];
      if(await stage.locator('.activity-area').count()){
        expect(answer,`Missing automated answer for lesson ${lessonNumber}, stage ${stageId}`).toBeTruthy();
        await expect(page.locator('.lesson-controls .primary')).toBeDisabled();
        await answerStage(stage,answer);
        await expect(page.locator('.lesson-controls .primary')).toBeEnabled();
      }else{
        expect(answer,`Unexpected answer entry for non-interactive stage ${stageId}`).toBeFalsy();
      }

      if(step===total-1)break;
      const previousId=stageId!;
      await page.locator('.lesson-controls .primary').click();
      await expect(page.locator('.lesson-runtime:not([hidden]) .interactive-stage[data-stage-id]')).not.toHaveAttribute('data-stage-id',previousId,{timeout:5_000});
    }

    expect(visited.size).toBe(total);
    expect(Object.keys(lessonAnswers).every(id=>visited.has(id))).toBe(true);
    await expect(page.locator('.lesson-runtime:not([hidden]) .summary-card')).toBeVisible();
    await expect(page.locator('.lesson-runtime:not([hidden]) .summary-card')).toContainText('5/5');
    await expect(page.locator('.lesson-runtime:not([hidden]) .summary-card')).toContainText('6/6');
    if(lessonNumber===4)await expect(page.locator('.lesson-runtime:not([hidden]) .summary-card')).toContainText('Основная часть ✓');
    else await expect(page.locator('.lesson-runtime:not([hidden]) .summary-card')).toContainText('Завершён');
    expect(pageErrors,`Runtime errors in lesson ${lessonNumber}: ${pageErrors.join(' | ')}`).toEqual([]);
  });
}
