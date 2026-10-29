import { API } from 'typescript/sync';
import * as tsAst from 'typescript/ast';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(projectDir, 'build', 'dao', 'ProviderConsumer.js');

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

const checker = program.getProject().checker;
const sourceFile = program.getSourceFile(filePath);

if (!sourceFile) {
  throw new Error(`SourceFile not found: ${filePath}`);
}

function walk(node) {
  if (tsAst.isShorthandPropertyAssignment(node) && node.name.text === 'Base') {
    const symbol = checker.getSymbolAtPosition(
      filePath,
      node.name.getStart(sourceFile)
    );

    console.log({
      syntax: tsAst.SyntaxKind[node.kind],
      name: node.name.text,

      nameSymbol: symbol?.name,
      declarations: symbol?.declarations?.map(
        (declaration) => tsAst.SyntaxKind[declaration.kind]
      ),

      checkerMethod: typeof checker.getShorthandAssignmentValueSymbol,

      valueSymbol: checker.getShorthandAssignmentValueSymbol
        ? (() => {
            const valueSymbol = checker.getShorthandAssignmentValueSymbol(node);

            return {
              name: valueSymbol?.name,
              declarations: valueSymbol?.declarations?.map(
                (declaration) => tsAst.SyntaxKind[declaration.kind]
              )
            };
          })()
        : 'API unavailable'
    });
  }

  for (const child of node.getChildren(sourceFile)) {
    walk(child);
  }
}

walk(sourceFile);
