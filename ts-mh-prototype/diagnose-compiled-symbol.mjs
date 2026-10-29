import { API } from 'typescript/sync';
import * as ast from 'typescript/ast';

const api = new API();

const program = api.createProgram(
  ['build/AbstractBase.js', 'build/dao/Provider.js'],
  {
    target: 9,
    module: 99,
    moduleResolution: 100,
    allowJs: true,
    checkJs: true,
    strict: true,
    skipLibCheck: true
  }
);

const checker = program.getProject().checker;
const fileName = 'build/dao/Provider.js';
const file = program.getSourceFile(fileName);

for (const methodName of ['testReference', 'testReference1']) {
  const methodPosition = file.text.indexOf(`${methodName}()`);
  const callPosition = file.text.indexOf("AbstractBase.log('", methodPosition);

  if (methodPosition < 0 || callPosition < 0) {
    console.log(`Not found: ${methodName}`);
    continue;
  }

  // 查詢呼叫中的 AbstractBase，而不是整個呼叫表達式。
  const symbolPosition = callPosition;
  const symbol = checker.getSymbolAtPosition(fileName, symbolPosition);

  const declarations = symbol?.declarations ?? [];
  const isImport = declarations.some((declaration) =>
    ast.isImportSpecifier(declaration)
  );

  const resolved = isImport ? checker.getAliasedSymbol(symbol) : symbol;

  console.log(`--- ${methodName} ---`);
  console.log({
    sourceText: file.text.slice(
      symbolPosition,
      symbolPosition + 'AbstractBase'.length
    ),
    symbolName: symbol?.name,
    isImport,
    declarationKinds: declarations.map((declaration) => declaration.kind),
    resolvedDeclarationPaths: resolved?.declarations?.map(
      (declaration) => declaration.path
    )
  });
}
