import fs from 'node:fs';
import path from 'node:path';

const dir='tests';
const changed=[];
for(const name of fs.readdirSync(dir).filter(n=>n.endsWith('.spec.ts'))){
  const file=path.join(dir,name);
  let text=fs.readFileSync(file,'utf8');
  const before=text;

  const interactiveVars=[...text.matchAll(/const\s+(\w+)\s*=\s*page\.locator\(['"]\.course-lesson-grid > button\.is-interactive['"]\);/g)].map(m=>m[1]);
  for(const v of interactiveVars){
    const re=new RegExp(`(expect\\(${v}\\)\\.toHaveCount\\()25(\\))`,'g');
    text=text.replace(re,'$1'+'26'+'$2');
  }

  const enabledVars=[...text.matchAll(/const\s+(\w+)\s*=\s*page\.locator\(['"]\.course-lesson-grid > button:not\(\[disabled\]\)['"]\);/g)].map(m=>m[1]);
  for(const v of enabledVars){
    const re=new RegExp(`(expect\\(${v}\\)\\.toHaveCount\\()26(\\))`,'g');
    text=text.replace(re,'$1'+'27'+'$2');
  }

  text=text.replace(/(expect\(page\.locator\(['"]\.course-lesson-grid > button\.is-interactive['"]\)\)\.toHaveCount\()25(\))/g,'$1'+'26'+'$2');
  text=text.replace(/(expect\(page\.locator\(['"]\.course-lesson-grid > button:not\(\[disabled\]\)['"]\)\)\.toHaveCount\()26(\))/g,'$1'+'27'+'$2');

  if(text!==before){
    fs.writeFileSync(file,text);
    changed.push(file);
  }
}
if(!changed.length) throw new Error('No stale course counts found');
console.log(`Updated ${changed.length} test files:`);
for(const file of changed) console.log(`- ${file}`);
