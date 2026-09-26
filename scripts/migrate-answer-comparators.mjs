import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const srcDir=path.join(process.cwd(),'src');
const targets=fs.readdirSync(srcDir)
  .filter(name=>name.endsWith('.tsx'))
  .map(name=>path.join(srcDir,name));

let changedFiles=0;
let changedComparisons=0;

for(const file of targets){
  const original=fs.readFileSync(file,'utf8');
  if(!/(?:function\s+(?:norm|normalize)\s*\(|const\s+(?:norm|normalize)\s*=)/.test(original))continue;

  const sourceFile=ts.createSourceFile(file,original,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  const edits=[];

  function localNormalizerCall(node){
    return ts.isCallExpression(node)
      && ts.isIdentifier(node.expression)
      && (node.expression.text==='norm'||node.expression.text==='normalize')
      && node.arguments.length===1;
  }

  function visit(node){
    if(ts.isBinaryExpression(node)
      && node.operatorToken.kind===ts.SyntaxKind.EqualsEqualsEqualsToken
      && localNormalizerCall(node.left)
      && localNormalizerCall(node.right)
      && node.left.expression.text===node.right.expression.text){
      const left=node.left.arguments[0].getText(sourceFile);
      const right=node.right.arguments[0].getText(sourceFile);
      edits.push({
        start:node.getStart(sourceFile),
        end:node.getEnd(),
        replacement:`semanticAnswersEquivalent(String(${left}),String(${right}))`,
      });
    }
    ts.forEachChild(node,visit);
  }
  visit(sourceFile);

  if(!edits.length)continue;
  let next=original;
  for(const edit of edits.sort((a,b)=>b.start-a.start)){
    next=next.slice(0,edit.start)+edit.replacement+next.slice(edit.end);
  }
  if(!/answersEquivalent\s+as\s+semanticAnswersEquivalent/.test(next)){
    next=`import { answersEquivalent as semanticAnswersEquivalent } from './answerEquivalence';\n${next}`;
  }
  fs.writeFileSync(file,next);
  changedFiles+=1;
  changedComparisons+=edits.length;
  console.log(`${path.basename(file)}: migrated ${edits.length}`);
}

console.log(`Migrated ${changedComparisons} normalized answer comparisons across ${changedFiles} files.`);
