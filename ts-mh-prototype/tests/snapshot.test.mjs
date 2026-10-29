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

  assert.equal(
    result.status,
    0,
    [
      `Command failed: ${command} ${args.join(' ')}`,
      result.stdout,
      result.stderr
    ].join('\n')
  );
}

test('轉換輸出應與基準檔完全一致', async (t) => {
  run('npx', ['tsc', '-p', './tsconfig.json']);
  run('node', ['./build-mh.mjs']);

  const cases = [
    {
      actual: 'build-mh/dao/Provider.js',
      expected: 'tests/fixtures/expected/Provider.js'
    },
    {
      actual: 'build-mh/dao/ProviderConsumer.js',
      expected: 'tests/fixtures/expected/ProviderConsumer.js'
    },
    {
      actual: 'build-mh/service/Provider.js',
      expected: 'tests/fixtures/expected/ServiceProvider.js'
    }
  ];

  for (const item of cases) {
    await t.test(item.actual, () => {
      const actual = fs.readFileSync(
        path.join(projectDir, item.actual),
        'utf8'
      );

      const expected = fs.readFileSync(
        path.join(projectDir, item.expected),
        'utf8'
      );

      assert.equal(actual, expected);
    });
  }
});
