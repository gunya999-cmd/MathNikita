import fs from 'node:fs';
function replaceOne(text,from,to,label){if(!text.includes(from))throw new Error(`Missing ${label}`);return text.replace(from,to)}

const planPath='tests/course-plan.spec.ts';
let plan=fs.readFileSync(planPath,'utf8');
plan=replaceOne(plan,"plan through lesson 88","plan through lesson 89",'course plan title');
plan=replaceOne(plan,"toHaveCount(84);","toHaveCount(85);",'interactive count');
plan=replaceOne(plan,"toHaveCount(88);","toHaveCount(89);",'available count');
plan=replaceOne(plan,"await expect(lessons.nth(88)).toContainText('Повторение и систематизация');await expect(lessons.nth(88)).toBeDisabled();","await expect(lessons.nth(88)).toContainText('Повторение главы 3: коррекция перед контрольной');await expect(lessons.nth(88)).toBeEnabled();await expect(lessons.nth(88)).toHaveClass(/is-interactive/);",'lesson 89 boundary');
plan=replaceOne(plan,"Полностью готовы 88 уроков.","Полностью готовы 89 уроков.",'ready count text');
fs.writeFileSync(planPath,plan);

const focusedOld='.github/workflows/course-1-88-certification.yml';
const focusedNew='.github/workflows/course-1-89-certification.yml';
const focused=`# Delta release gate for lesson 89. Keep PR checks focused on the changed lesson;\n# cumulative course hard-certification is triggered once for the exact release SHA.\nname: Course 1-89 certification\n\non:\n  workflow_dispatch:\n  push:\n    branches: [main]\n  pull_request:\n    branches: [main]\n    types: [opened, synchronize, reopened, ready_for_review]\n\npermissions:\n  contents: read\n\nconcurrency:\n  group: course-1-89-certification-\${{ github.workflow }}-\${{ github.head_ref || github.ref_name }}\n  cancel-in-progress: true\n\njobs:\n  chromium-89:\n    name: Chromium · contract, practice, runtime and Sulafat 89\n    runs-on: ubuntu-latest\n    timeout-minutes: 35\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: {node-version: 24}\n      - run: npm install\n      - run: npx playwright install --with-deps chromium\n      - name: Verify course boundary, pedagogy and lesson 89 source contract\n        run: >-\n          npx playwright test\n          tests/course-plan.spec.ts\n          tests/pedagogical-practice-quality.spec.ts\n          tests/extended-practice-count.spec.ts\n          tests/lesson-eighty-nine-source.spec.ts\n          --config=playwright.desktop.config.ts --workers=1\n      - name: Complete lesson 89 Chromium runtime\n        run: npx playwright test tests/lesson-eighty-nine-full-flow.spec.ts tests/lesson-eighty-nine-ipad.spec.ts --config=playwright.desktop.config.ts --workers=1\n      - name: Complete all 20 mandatory practice tasks / 50 responses\n        run: npx playwright test tests/lesson-eighty-nine-practice.spec.ts --config=playwright.desktop.config.ts --workers=1\n      - name: Verify Sulafat sequencing and interruption\n        run: npx playwright test tests/lesson-eighty-nine-voice.spec.ts --config=playwright.desktop.config.ts --workers=1\n\n  webkit-89:\n    name: iPad WebKit runtime 89\n    runs-on: ubuntu-latest\n    timeout-minutes: 20\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: {node-version: 24}\n      - run: npm install\n      - run: npx playwright install --with-deps webkit\n      - run: npx playwright test tests/lesson-eighty-nine-full-flow.spec.ts tests/lesson-eighty-nine-ipad.spec.ts --workers=1\n\n  certified:\n    name: COURSE 1-89 DELTA CERTIFIED\n    if: always()\n    needs: [chromium-89, webkit-89]\n    runs-on: ubuntu-latest\n    steps:\n      - name: Fail unless both focused lesson 89 lanes passed\n        env:\n          CHROMIUM_89: \${{ needs.chromium-89.result }}\n          WEBKIT_89: \${{ needs.webkit-89.result }}\n        run: |\n          test \"$CHROMIUM_89\" = success\n          test \"$WEBKIT_89\" = success\n          echo \"Lesson 89 delta is certified.\"\n`;
fs.writeFileSync(focusedNew,focused);if(fs.existsSync(focusedOld))fs.rmSync(focusedOld);

const hardOld='.github/workflows/course-62-88-hard-certification.yml';
const hardNew='.github/workflows/course-62-89-hard-certification.yml';
let hard=fs.readFileSync(hardOld,'utf8');
hard=hard.replaceAll('Course 62-88 hard certification','Course 62-89 hard certification')
  .replaceAll('course-62-88-hard','course-62-89-hard')
  .replaceAll('course contract 1-88','course contract 1-89')
  .replaceAll('Chromium hard runtime 65-88','Chromium hard runtime 65-89')
  .replaceAll('iPad WebKit hard runtime 65-88','iPad WebKit hard runtime 65-89')
  .replaceAll('practice-62-88','practice-62-89')
  .replaceAll('voice-62-88','voice-62-89')
  .replaceAll('Complete 520 tasks / 1300 responses 62-88 excluding control 73','Complete 540 tasks / 1350 responses 62-89 excluding control 73')
  .replaceAll('Sulafat sequencing + interruption 62-88 Chromium and WebKit','Sulafat sequencing + interruption 62-89 Chromium and WebKit')
  .replaceAll('COURSE 1-88 HARD CERTIFIED','COURSE 1-89 HARD CERTIFIED')
  .replaceAll('chromium-65-88','chromium-65-89')
  .replaceAll('webkit-65-88','webkit-65-89')
  .replaceAll('Lessons 1-88 are cumulatively hard-certified; ordinary lessons 62-72 and 74-88 complete 520 tasks / 1300 responses.','Lessons 1-89 are cumulatively hard-certified; ordinary lessons 62-72 and 74-89 complete 540 tasks / 1350 responses.');
hard=replaceOne(hard,'          tests/lesson-eighty-eight-source.spec.ts\n','          tests/lesson-eighty-eight-source.spec.ts\n          tests/lesson-eighty-nine-source.spec.ts\n','hard source list');
hard=hard.replaceAll('          tests/lesson-eighty-eight-full-flow.spec.ts tests/lesson-eighty-eight-ipad.spec.ts\n          --','          tests/lesson-eighty-eight-full-flow.spec.ts tests/lesson-eighty-eight-ipad.spec.ts\n          tests/lesson-eighty-nine-full-flow.spec.ts tests/lesson-eighty-nine-ipad.spec.ts\n          --');
hard=replaceOne(hard,'      - name: Solve lesson 88 practice\n        run: npx playwright test tests/lesson-eighty-eight-practice.spec.ts --config=playwright.desktop.config.ts --workers=1\n','      - name: Solve lesson 88 practice\n        run: npx playwright test tests/lesson-eighty-eight-practice.spec.ts --config=playwright.desktop.config.ts --workers=1\n      - name: Solve lesson 89 practice\n        run: npx playwright test tests/lesson-eighty-nine-practice.spec.ts --config=playwright.desktop.config.ts --workers=1\n','hard practice list');
hard=hard.replaceAll('tests/lesson-eighty-seven-voice.spec.ts tests/lesson-eighty-eight-voice.spec.ts','tests/lesson-eighty-seven-voice.spec.ts tests/lesson-eighty-eight-voice.spec.ts tests/lesson-eighty-nine-voice.spec.ts');
fs.writeFileSync(hardNew,hard);fs.rmSync(hardOld);

fs.rmSync('scripts/lesson-89-release-integrate-once.mjs');
fs.rmSync('.github/workflows/lesson-89-release-integrate-once.yml');
