import { expect,test } from '@playwright/test';
import { readdirSync,readFileSync,statSync } from 'node:fs';
import { join,relative } from 'node:path';

function sourceFiles(root:string):string[]{
  const result:string[]=[];
  for(const name of readdirSync(root)){
    const full=join(root,name);
    const stat=statSync(full);
    if(stat.isDirectory())result.push(...sourceFiles(full));
    else if(/\.(?:ts|tsx)$/.test(name))result.push(full);
  }
  return result;
}

test('answer checking does not bypass the shared semantic validator with local norm helpers',()=>{
  const root=join(process.cwd(),'src');
  const offenders=sourceFiles(root)
    .filter(path=>{
      if(path.endsWith('answerEquivalence.ts')||path.endsWith('extendedPracticeEngine.ts'))return false;
      const source=readFileSync(path,'utf8');
      const declaresLocalNormalizer=/(?:function\s+(?:norm|normalize)\s*\(|const\s+(?:norm|normalize)\s*=)/.test(source);
      const comparesNormalizedValues=/(?:norm|normalize)\([^\n;]{0,220}\)\s*===\s*(?:norm|normalize)\(/.test(source);
      const answerContext=/(?:answer|response|inputValue|activity\.answer|task\.answer)/.test(source);
      return declaresLocalNormalizer&&comparesNormalizedValues&&answerContext;
    })
    .map(path=>relative(process.cwd(),path))
    .sort();

  expect(offenders,'Local answer comparators must be migrated to answersEquivalent').toEqual([]);
});
