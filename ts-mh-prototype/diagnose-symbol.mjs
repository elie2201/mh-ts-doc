import { API } from 'typescript/sync';

const api = new API();

const program = api.createProgram(
  ['src/AbstractBase.ts', 'src/dao/Provider.ts'],
  {
    target: 9,
    module: 99,
    moduleResolution: 100,
    strict: true
  }
);

const checker = program.getProject().checker;
const fileName = 'src/dao/Provider.ts';
const file = program.getSourceFile(fileName);

const positions = [...file.text.matchAll(/AbstractBase\.log/g)].map(
  (match) => match.index
);

const symbols = checker.getSymbolAtPosition(fileName, positions);

for (let i = 0; i < positions.length; i++) {
  const position = positions[i];
  const symbol = symbols[i];
  const declaration = symbol?.declarations?.[0];

  console.log({
    position,
    sourceText: file.text.slice(position, position + 'AbstractBase'.length),
    symbolName: symbol?.name,
    declarationKind: declaration?.kind,
    declarationIndex: declaration?.index,
    declarationPath: declaration?.path
  });
}
