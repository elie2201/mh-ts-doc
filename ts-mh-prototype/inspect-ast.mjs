import { parseSync } from 'oxc-parser';
import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('ts-mh-prototype', 'build', 'dao', 'Provider.js');

const source = fs.readFileSync(filePath, 'utf8');

const result = parseSync(filePath, source, {
  sourceType: 'module'
});

function summarize(node) {
  const item = {
    type: node.type,
    start: node.start,
    end: node.end
  };

  if (node.type === 'ImportDeclaration') {
    item.source = node.source?.value;
    item.specifiers = node.specifiers?.map((specifier) => ({
      type: specifier.type,
      imported: specifier.imported?.name,
      local: specifier.local?.name
    }));
  }

  if (node.type === 'ExportNamedDeclaration') {
    item.declaration = node.declaration ? summarize(node.declaration) : null;
  }

  if (node.type === 'ClassDeclaration') {
    item.id = node.id?.name;
    item.superClass = node.superClass?.name;
  }

  if (node.type === 'MethodDefinition') {
    item.key = node.key?.name;
  }

  return item;
}

console.log('Parser errors:', result.errors);

console.log(JSON.stringify(result.program.body.map(summarize), null, 2));

function inspectIdentifiers(node, parent = null) {
  if (!node || typeof node !== 'object') return;

  if (
    typeof node.type === 'string' &&
    (node.type.includes('Identifier') || node.name === 'AbstractBase')
  ) {
    console.log({
      type: node.type,
      name: node.name,
      start: node.start,
      end: node.end,
      parentType: parent?.type,
      parentStart: parent?.start,
      parentEnd: parent?.end,
      source: source.slice(node.start, node.end)
    });
  }

  for (const [key, value] of Object.entries(node)) {
    if (key === 'loc' || key === 'comments') continue;

    if (Array.isArray(value)) {
      for (const child of value) {
        inspectIdentifiers(child, node);
      }
    } else if (value && typeof value === 'object') {
      inspectIdentifiers(value, node);
    }
  }
}

console.log('\n--- Identifier nodes ---');
inspectIdentifiers(result.program);
