import { expect,test } from '@playwright/test';
import { extendedPracticeByLesson } from '../src/data/extendedPracticeData';
import { flexiblePracticeAnswerMatch } from '../src/extendedPracticeEngine';

function declaredAnswers(){
  const rows:{lesson:number;taskId:string;answer:string}[]=[];
  for(const [lessonKey,practice] of Object.entries(extendedPracticeByLesson)){
    const lesson=Number(lessonKey);
    for(const task of practice.tasks){
      if(task.type==='input'){
        for(const answer of task.answers)rows.push({lesson,taskId:task.id,answer});
      }else if(task.type==='multi-input'){
        for(const field of task.fields){
          if(field.validation&&field.validation!=='loose')continue;
          for(const answer of field.answers)rows.push({lesson,taskId:`${task.id}:${field.id}`,answer});
        }
      }
    }
  }
  return rows;
}

const rows=declaredAnswers();

test('every declared loose/input answer still matches itself',()=>{
  for(const row of rows){
    expect(flexiblePracticeAnswerMatch(row.answer,row.answer),`lesson ${row.lesson} ${row.taskId}: ${row.answer}`).toBe(true);
  }
});

test('integer sequences accept harmless separators without accepting glued or reordered values',()=>{
  for(const row of rows){
    const tokens=row.answer.trim().split(/\s*[,;]\s*/).filter(Boolean);
    if(tokens.length<3||!tokens.every(token=>/^[+-]?\d+$/.test(token)))continue;
    expect(flexiblePracticeAnswerMatch(tokens.join(' '),row.answer),`space variant: lesson ${row.lesson} ${row.taskId}`).toBe(true);
    expect(flexiblePracticeAnswerMatch(tokens.join('; '),row.answer),`semicolon variant: lesson ${row.lesson} ${row.taskId}`).toBe(true);
    expect(flexiblePracticeAnswerMatch(tokens.join(''),row.answer),`glued variant: lesson ${row.lesson} ${row.taskId}`).toBe(false);
    if(new Set(tokens).size>1){
      const swapped=[...tokens];
      [swapped[0],swapped[1]]=[swapped[1],swapped[0]];
      expect(flexiblePracticeAnswerMatch(swapped.join(','),row.answer),`reordered variant: lesson ${row.lesson} ${row.taskId}`).toBe(false);
    }
  }
});

test('decimal comma remains a decimal and cannot collapse into an integer',()=>{
  for(const row of rows){
    const match=row.answer.trim().match(/^([+-]?\d+),(\d+)$/);
    if(!match)continue;
    const dot=`${match[1]}.${match[2]}`;
    const glued=`${match[1]}${match[2]}`;
    expect(flexiblePracticeAnswerMatch(dot,row.answer),`decimal dot: lesson ${row.lesson} ${row.taskId}`).toBe(true);
    if(Number(glued)!==Number(dot)){
      expect(flexiblePracticeAnswerMatch(glued,row.answer),`decimal glued: lesson ${row.lesson} ${row.taskId}`).toBe(false);
    }
  }
});

test('ratios and fractions keep their mathematical separators',()=>{
  for(const row of rows){
    const ratio=row.answer.trim().match(/^([+-]?\d+)\s*:\s*([+-]?\d+)$/);
    if(ratio){
      expect(flexiblePracticeAnswerMatch(`${ratio[1]} : ${ratio[2]}`,row.answer),`ratio spacing: lesson ${row.lesson} ${row.taskId}`).toBe(true);
      expect(flexiblePracticeAnswerMatch(`${ratio[1]}${ratio[2]}`,row.answer),`ratio glued: lesson ${row.lesson} ${row.taskId}`).toBe(false);
    }
    const fraction=row.answer.trim().match(/^([+-]?\d+)\s*\/\s*([+-]?\d+)$/);
    if(fraction){
      expect(flexiblePracticeAnswerMatch(`${fraction[1]} / ${fraction[2]}`,row.answer),`fraction spacing: lesson ${row.lesson} ${row.taskId}`).toBe(true);
      expect(flexiblePracticeAnswerMatch(`${fraction[1]}${fraction[2]}`,row.answer),`fraction glued: lesson ${row.lesson} ${row.taskId}`).toBe(false);
    }
  }
});
