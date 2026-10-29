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
  'shorthand-property'
);

test('shorthand-property fixture 的轉換結果符合預期', () => {
  const sourceDir = path.join(fixtureDir, 'src');
  const compiledDir = path.join(fixtureDir, 'build');
  const outputDir = path.join(fixtureDir, 'output');
  const expectedFile = path.join(fixtureDir, 'expected', 'Consumer.js');
  const actualFile = path.join(outputDir, 'Consumer.js');

  const tscCli = path.join(
    projectDir,
    'node_modules',
    'typescript',
    'bin',
    'tsc'
  );

  execFileSync(
    process.execPath,
    [tscCli, '-p', path.join(fixtureDir, 'tsconfig.json')],
    {
      cwd: projectDir,
      stdio: 'inherit'
    }
  );

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

  const actual = fs.readFileSync(actualFile, 'utf8');
  const expected = fs.readFileSync(expectedFile, 'utf8');

  assert.equal(actual, expected);

  assert.match(actual, /Base:\s*mh\.Base/, '簡寫屬性應展開為 Base: mh.Base');

  assert.doesNotMatch(actual, /import\s*\{/, '輸出不應殘留 named import');
});
