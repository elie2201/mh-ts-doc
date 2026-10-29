import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);

const fixtureDir = path.join(
  projectDir,
  'tests',
  'fixtures',
  'import-shadowing'
);

test('import-shadowing：匯入符號與區域變數都能正確區分', () => {
  const sourceDir = path.join(fixtureDir, 'src');
  const compiledDir = path.join(fixtureDir, 'build');
  const outputDir = path.join(fixtureDir, 'output');

  const tscCli = path.join(
    projectDir,
    'node_modules',
    'typescript',
    'bin',
    'tsc'
  );

  // 編譯整個 fixture，保留並執行所有既有案例。
  execFileSync(
    process.execPath,
    [tscCli, '-p', path.join(fixtureDir, 'tsconfig.json')],
    {
      cwd: projectDir,
      stdio: 'inherit'
    }
  );

  // 轉換所有編譯結果。
  execFileSync(process.execPath, [path.join(projectDir, 'build-mh.mjs')], {
    cwd: projectDir,
    env: {
      ...process.env,
      MH_SOURCE_DIR: sourceDir,
      MH_COMPILED_DIR: compiledDir,
      MH_OUTPUT_DIR: outputDir
    },
    stdio: 'inherit'
  });

  const destructured = fs.readFileSync(
    path.join(outputDir, 'Consumer.js'),
    'utf8'
  );

  const ordinary = fs.readFileSync(
    path.join(outputDir, 'OrdinaryConsumer.js'),
    'utf8'
  );

  const catchConsumer = fs.readFileSync(
    path.join(outputDir, 'CatchConsumer.js'),
    'utf8'
  );

  const forConsumer = fs.readFileSync(
    path.join(outputDir, 'ForConsumer.js'),
    'utf8'
  );

  const forInConsumer = fs.readFileSync(
    path.join(outputDir, 'ForInConsumer.js'),
    'utf8'
  );

  const nestedConsumer = fs.readFileSync(
    path.join(outputDir, 'NestedConsumer.js'),
    'utf8'
  );

  const aliasConsumer = fs.readFileSync(
    path.join(outputDir, 'AliasConsumer.js'),
    'utf8'
  );

  // 案例一：解構參數遮蔽。
  assert.match(
    destructured,
    /const imported\s*=\s*mh\.Base/,
    '解構參數前的匯入引用應轉換為 mh.Base'
  );

  assert.match(
    destructured,
    /const callback\s*=\s*\(\{\s*Base\s*\}\)\s*=>/,
    '解構參數中的 Base 應保留'
  );

  assert.match(destructured, /=>\s*Base/, '解構參數函式本體中的 Base 應保留');

  assert.match(
    destructured,
    /const importedAfter\s*=\s*mh\.Base/,
    '解構參數後的匯入引用應轉換為 mh.Base'
  );

  // 案例二：普通箭頭函式參數遮蔽。
  assert.match(
    ordinary,
    /const importedBefore\s*=\s*mh\.Base/,
    '普通參數前的匯入引用應轉換為 mh.Base'
  );

  assert.match(
    ordinary,
    /const callback\s*=\s*\(Base\)\s*=>/,
    '普通箭頭函式的 Base 參數應保留'
  );

  assert.match(ordinary, /return Base/, '普通箭頭函式本體中的 Base 應保留');

  assert.match(
    ordinary,
    /const importedAfter\s*=\s*mh\.Base/,
    '普通參數後的匯入引用應轉換為 mh.Base'
  );

  // 案例三：catch 參數遮蔽。
  assert.match(
    catchConsumer,
    /const importedBefore\s*=\s*mh\.Base/,
    'catch 之前的匯入引用應轉換為 mh.Base'
  );

  assert.match(catchConsumer, /catch\s*\(Base\)/, 'catch 參數 Base 應保留');

  assert.match(
    catchConsumer,
    /const caught\s*=\s*Base/,
    'catch 區塊內的 Base 應保留'
  );

  assert.match(
    catchConsumer,
    /const importedAfter\s*=\s*mh\.Base/,
    'catch 之後的匯入引用應轉換為 mh.Base'
  );

  // 案例四：for 迴圈區域變數遮蔽。
  assert.match(
    forConsumer,
    /const importedBefore\s*=\s*mh\.Base/,
    'for 迴圈之前的匯入引用應轉換為 mh.Base'
  );

  assert.match(
    forConsumer,
    /for\s*\(const Base of values\)/,
    'for 迴圈的區域變數 Base 應保留'
  );

  assert.match(
    forConsumer,
    /console\.log\(Base\)/,
    'for 迴圈本體中的 Base 應保留'
  );

  assert.match(
    forConsumer,
    /const importedAfter\s*=\s*mh\.Base/,
    'for 迴圈之後的匯入引用應轉換為 mh.Base'
  );

  // 案例五：for...in 迴圈區域變數遮蔽。
  assert.match(
    forInConsumer,
    /const importedBefore\s*=\s*mh\.Base/,
    'for...in 之前的匯入引用應轉換為 mh.Base'
  );

  assert.match(
    forInConsumer,
    /for\s*\(const Base in values\)/,
    'for...in 的區域變數 Base 應保留'
  );

  assert.match(
    forInConsumer,
    /console\.log\(Base\)/,
    'for...in 迴圈本體中的 Base 應保留'
  );

  assert.match(
    forInConsumer,
    /const importedAfter\s*=\s*mh\.Base/,
    'for...in 之後的匯入引用應轉換為 mh.Base'
  );

  // 案例六：巢狀函式參數遮蔽。
  assert.match(
    nestedConsumer,
    /const outerBefore\s*=\s*mh\.Base/,
    '巢狀函式之前的匯入引用應轉換為 mh.Base'
  );

  assert.match(
    nestedConsumer,
    /const callback\s*=\s*\(Base\)\s*=>/,
    '外層函式的 Base 參數應保留'
  );

  assert.match(
    nestedConsumer,
    /const innerCallback\s*=\s*\(Base\)\s*=>\s*Base/,
    '內層函式的 Base 參數與引用應保留'
  );

  assert.match(
    nestedConsumer,
    /const outerAfter\s*=\s*mh\.Base/,
    '巢狀函式之後的匯入引用應轉換為 mh.Base'
  );

  // 案例六：import alias。
  assert.match(
    aliasConsumer,
    /const imported\s*=\s*mh\.Base/,
    'import alias 的引用應轉換成原始匯出符號對應的 mh.Base'
  );

  assert.doesNotMatch(
    aliasConsumer,
    /mh\.ImportedBase/,
    '轉換結果不應使用本地匯入別名建立 namespace 路徑'
  );

  // 四個輸出都不得殘留原始 named import。
  for (const [name, content] of [
    ['解構參數案例', destructured],
    ['普通參數案例', ordinary],
    ['catch 參數案例', catchConsumer],
    ['for 迴圈案例', forConsumer],
    ['for...in 迴圈案例', forInConsumer],
    ['巢狀函式案例', nestedConsumer],
    ['import alias 案例', aliasConsumer]
  ]) {
    assert.doesNotMatch(content, /import\s*\{/, `${name}不應殘留 named import`);
  }
});
