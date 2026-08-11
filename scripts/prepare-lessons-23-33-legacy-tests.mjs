import fs from 'node:fs';

const files=[
  'tests/lesson-twenty-three-ipad.spec.ts',
  'tests/lesson-twenty-four-ipad.spec.ts',
  'tests/lesson-twenty-five-ipad.spec.ts',
  'tests/lesson-twenty-six-ipad.spec.ts',
  'tests/lesson-twenty-seven-ipad.spec.ts',
  'tests/lesson-twenty-eight-ipad.spec.ts',
  'tests/lesson-twenty-nine-ipad.spec.ts',
  'tests/lesson-thirty-ipad.spec.ts',
  'tests/lesson-thirty-one-ipad.spec.ts',
  'tests/lesson-thirty-two-ipad.spec.ts',
];

for(const file of files){
  let source=fs.readFileSync(file,'utf8');
  const original=source;

  source=source.replace(
    /(\.course-lesson-grid > button\.is-interactive'\)\)\.toHaveCount\()\d+(\);)/g,
    '$131$2',
  );
  source=source.replace(
    /(\.course-lesson-grid > button\.is-control-ready'\)\)\.toHaveCount\()\d+(\);)/g,
    '$12$2',
  );
  source=source.replace(
    /(\.course-lesson-grid > button:not\(\[disabled\]\)'\)\)\.toHaveCount\()\d+(\);)/g,
    '$133$2',
  );

  // Historical dedicated tests were written when the lesson immediately after the
  // subject under test was still locked. In the current certified catalog lessons
  // 1-33 are intentionally enabled and lesson 34 is the first locked lesson.
  source=source.replace(
    /(await expect\(lesson\w+\)\.to)BeDisabled(\(\);)/g,
    '$1BeEnabled$2',
  );

  if(source!==original){
    fs.writeFileSync(file,source);
    console.log(`Updated current-catalog assumptions: ${file}`);
  }else{
    console.log(`No legacy catalog assumptions found: ${file}`);
  }
}
