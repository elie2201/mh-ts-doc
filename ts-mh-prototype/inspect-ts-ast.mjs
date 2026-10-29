import { API } from 'typescript/sync';
import * as tsAst from 'typescript/ast';
import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('./build/dao/Provider.js');

const api = new API();

const program = api.createProgram([filePath], {
  target: 9,
  module: 99,
  moduleResolution: 100,
  allowJs: true,
  checkJs: true,
  strict: true,
  skipLibCheck: true
});

const sourceFile = program.getSourceFile(filePath);

if (!sourceFile) {
  throw new Error(`SourceFile not found: ${filePath}`);
}

const code = fs.readFileSync(filePath, 'utf8');

console.log('SourceFile:', sourceFile.fileName);
console.log('Is source file:', tsAst.isSourceFile(sourceFile));

function walk(node) {
  if (tsAst.isIdentifier(node) && node.text === 'Base') {
    console.log({
      kind: tsAst.SyntaxKind[node.kind],
      text: node.text,
      start: node.getStart(sourceFile),
      end: node.getEnd(),
      parentKind: tsAst.SyntaxKind[node.parent.kind],
      sourceText: code.slice(node.getStart(sourceFile), node.getEnd())
    });
  }

  for (const child of node.getChildren(sourceFile)) {
    walk(child);
  }
}

walk(sourceFile);
