import {expect,test} from '@playwright/test';
import {readFileSync} from 'node:fs';
const player=readFileSync(new URL('../src/ControlWorkNinePlayer.tsx',import.meta.url),'utf8');
const guard=readFileSync(new URL('../src/ControlWorkNineGuard.tsx',import.meta.url),'utf8');

test('lesson 156 freezes primary attempt, uses strict decimal matching and correct grade thresholds',()=>{
 expect(player).toContain('submittedResponses');
 expect(player).toContain('baselineResponses=submittedResponses');
 expect(player).toContain('setSubmittedResponses(snapshot)');
 expect(player).toContain('correctionFieldIds');
 expect(player).toContain('correctionCompletedAt');
 expect(player).toContain("score===6?'5':score===5?'4':score>=3?'3':'нужно повторить'");
 expect(player).toContain('Первичный результат не изменён');
 expect(player).toContain('canonicalDecimal');
 expect(player).not.toContain('Math.abs');
 expect(player).not.toContain('toFixed');
 expect(player).toContain('data-control-work="9"');
 expect(guard).toContain('.cat-mentor');
 expect(guard).toContain('.progressive-hint-coach');
 expect(guard).toContain('.lesson-reflection');
});
