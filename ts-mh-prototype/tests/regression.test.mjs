import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: projectDir,
    encoding: 'utf8',
    shell: process.platform === 'win32'
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      [
        `Command failed: ${command} ${args.join(' ')}`,
        result.stdout,
        result.stderr
      ].join('\n')
    );
  }

  return result.stdout;
}

// 每次測試前重新編譯及轉換，避免使用舊的輸出檔。
run('npx', ['tsc', '-p', './tsconfig.json']);
run('node', ['./build-mh.mjs']);

function readOutput(relativePath) {
  const filePath = path.join(projectDir, 'build-mh', relativePath);

  assert.ok(fs.existsSync(filePath), `輸出檔不存在：${relativePath}`);

  return fs.readFileSync(filePath, 'utf8');
}

test('不同目錄的同名 Provider 應解析至正確 namespace', () => {
  const code = readOutput('dao/ProviderConsumer.js');

  assert.match(code, /mh\.dao\.Provider\.source\(\)/);

  assert.match(code, /mh\.service\.Provider\.source\(\)/);
});

test('extends 的 import alias 應轉換為正確的 mh 路徑', () => {
  const code = readOutput('dao/Provider.js');

  assert.match(
    code,
    /mh\.dao\.Provider\s*=\s*class Provider extends mh\.AbstractBase\s*\{/
  );

  assert.doesNotMatch(code, /extends Base\b/);
});

test('多個 import 應各自轉換為正確的 mh 路徑', () => {
  const code = readOutput('dao/ProviderConsumer.js');

  assert.match(
    code,
    /return \[mh\.AbstractBase,\s*mh\.dao\.Provider,\s*mh\.service\.Provider\]/
  );
});

test('object shorthand 應保留原始 key 並轉換 value', () => {
  const code = readOutput('dao/ProviderConsumer.js');

  assert.match(code, /Base:\s*mh\.AbstractBase/);
});

test('一般 object property 應只轉換 value', () => {
  const code = readOutput('dao/ProviderConsumer.js');

  assert.match(code, /BaseClass:\s*mh\.AbstractBase/);
});

test('字串中的 class 名稱不應被改寫', () => {
  const code = readOutput('dao/ProviderConsumer.js');

  assert.match(code, /BaseName:\s*'Base'/);
});

test('import class 作為回傳值時應轉換', () => {
  const code = readOutput('dao/Provider.js');

  assert.match(code, /return mh\.AbstractBase/);
});

test('區域變數遮蔽 import 時應保留區域變數', () => {
  const code = readOutput('dao/Provider.js');

  assert.match(code, /const Base = \{/);

  assert.match(code, /Base\.log\('local'\)/);
});

test('參數遮蔽 import 時應保留參數 reference', () => {
  const code = readOutput('dao/Provider.js');

  assert.match(
    code,
    /testParameterShadowing\(Base\)\s*\{\s*Base\.log\('parameter'\)/
  );
});

test('解構宣告產生的區域變數不應被改寫', () => {
  const code = readOutput('dao/Provider.js');

  assert.match(code, /const \{ Base \} = \{/);

  assert.match(code, /Base\.log\('destructured local'\)/);
});

test('轉換後不應保留原始 import 宣告', () => {
  for (const relativePath of [
    'dao/Provider.js',
    'dao/ProviderConsumer.js',
    'service/Provider.js'
  ]) {
    const code = readOutput(relativePath);

    assert.doesNotMatch(
      code,
      /^\s*import\s/m,
      `${relativePath} 仍包含 import 宣告`
    );
  }
});
