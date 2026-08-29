import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const projectRoot = process.cwd();

function parseSource(relativePath) {
  const absolutePath = path.join(projectRoot, relativePath);
  const source = fs.readFileSync(absolutePath, 'utf8');
  return ts.createSourceFile(relativePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}

function propertyInitializer(objectNode, propertyName) {
  for (const property of objectNode.properties) {
    if (!ts.isPropertyAssignment(property)) continue;
    const name = property.name.getText().replace(/^['"]|['"]$/g, '');
    if (name === propertyName) return property.initializer;
  }
  return undefined;
}

function stringValue(node) {
  if (!node) return '';
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text.trim();
  return '';
}

function stringArray(node) {
  if (!node || !ts.isArrayLiteralExpression(node)) return [];
  return node.elements.map(stringValue).filter(Boolean);
}

function findVariableInitializer(sourceFile, variableName) {
  let found;
  function visit(node) {
    if (
      ts.isVariableDeclaration(node)
      && ts.isIdentifier(node.name)
      && node.name.text === variableName
      && node.initializer
    ) {
      found = node.initializer;
      return;
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return found;
}

function extractOpening(relativePath, variableName, id) {
  const sourceFile = parseSource(relativePath);
  const initializer = findVariableInitializer(sourceFile, variableName);
  if (!initializer || !ts.isObjectLiteralExpression(initializer)) {
    throw new Error(`Opening ${variableName} was not found in ${relativePath}`);
  }

  const title = stringValue(propertyInitializer(initializer, 'title'));
  const intro = stringValue(propertyInitializer(initializer, 'intro'));
  const question = stringValue(propertyInitializer(initializer, 'question'));
  const goals = stringArray(propertyInitializer(initializer, 'goals'));

  return {
    id,
    text: [title, intro, `Вопрос перед началом. ${question}`, ...goals].filter(Boolean).join('. '),
  };
}

function extractStages(relativePath, variableName, lessonNumber) {
  const sourceFile = parseSource(relativePath);
  const initializer = findVariableInitializer(sourceFile, variableName);
  if (!initializer || !ts.isArrayLiteralExpression(initializer)) {
    throw new Error(`Stage array ${variableName} was not found in ${relativePath}`);
  }

  return initializer.elements
    .filter(ts.isObjectLiteralExpression)
    .map((stage, index) => {
      const title = stringValue(propertyInitializer(stage, 'title'));
      const body = stringValue(propertyInitializer(stage, 'body'));
      const note = stringValue(propertyInitializer(stage, 'note'));
      const activityNode = propertyInitializer(stage, 'activity');
      const prompt = activityNode && ts.isObjectLiteralExpression(activityNode)
        ? stringValue(propertyInitializer(activityNode, 'prompt'))
        : '';
      const id = `lesson-${String(lessonNumber).padStart(2, '0')}-stage-${String(index + 1).padStart(2, '0')}`;
      const text = [title, body, note, prompt ? `Задание. ${prompt}` : ''].filter(Boolean).join('. ');
      return { id, text };
    });
}

function extractMentorScripts(relativePath) {
  const absolutePath = path.join(projectRoot, relativePath);
  const scripts = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
  const responseOrder = ['welcome', 'different', 'example', 'hint', 'why', 'success', 'retry'];
  const items = [];

  for (const [scriptKey, script] of Object.entries(scripts)) {
    for (const responseKey of responseOrder) {
      const text = script[responseKey];
      if (typeof text !== 'string' || !text.trim()) {
        throw new Error(`Mentor phrase ${scriptKey}.${responseKey} is missing`);
      }
      items.push({ id: `mentor-${scriptKey}-${responseKey}`, text: text.trim() });
    }
  }

  return items;
}

const items = [
  extractOpening('src/LessonOpening.tsx', 'lessonOneOpening', 'lesson-01-opening'),
  ...extractStages('src/LessonPlayer.tsx', 'lessonOneStages', 1),
  extractOpening('src/LessonOpening.tsx', 'lessonTwoOpening', 'lesson-02-opening'),
  ...extractStages('src/NaturalRowPracticePlayer.tsx', 'stages', 2),
  ...extractMentorScripts('src/data/mentorScripts.json'),
];

const outputDir = path.join(projectRoot, 'build');
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, 'narration-items.json'), `${JSON.stringify(items, null, 2)}\n`);
console.log(`Prepared ${items.length} narration clips.`);
