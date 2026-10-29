import { API } from 'typescript/sync';
import * as tsAst from 'typescript/ast';
import MagicString from 'magic-string';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectDir = path.dirname(fileURLToPath(import.meta.url));

const sourceDir = path.resolve(
  process.env.MH_SOURCE_DIR || path.join(projectDir, 'src')
);

const compiledDir = path.resolve(
  process.env.MH_COMPILED_DIR || path.join(projectDir, 'build')
);

const outputDir = path.resolve(
  process.env.MH_OUTPUT_DIR || path.join(projectDir, 'build-mh')
);

function getMhPath(filePath, symbolName) {
  const relativePath = path.relative(sourceDir, filePath);
  const directory = path.dirname(relativePath);
  const segments = directory === '.' ? [] : directory.split(path.sep);

  return ['mh', ...segments, symbolName].join('.');
}

function getCompiledFilePath(sourceFilePath) {
  return path.join(
    compiledDir,
    path.relative(sourceDir, sourceFilePath).replace(/\.ts$/i, '.js')
  );
}

function getSourceFilePath(compiledFilePath) {
  return path.join(
    sourceDir,
    path.relative(compiledDir, compiledFilePath).replace(/\.js$/i, '.ts')
  );
}

function collectTsFiles(directory, result = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      collectTsFiles(fullPath, result);
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      result.push(fullPath);
    }
  }

  return result;
}

function createSemanticContext(compiledFiles) {
  const api = new API();

  const program = api.createProgram(compiledFiles, {
    target: 9,
    module: 99,
    moduleResolution: 100,
    allowJs: true,
    checkJs: true,
    strict: true,
    skipLibCheck: true
  });

  return {
    program,
    checker: program.getProject().checker
  };
}

function getImportedMhPath(checker, compiledFilePath, position, node) {
  let symbol = checker.getSymbolAtPosition(compiledFilePath, position);

  if (!symbol) return undefined;

  if (node.parent && tsAst.isShorthandPropertyAssignment(node.parent)) {
    symbol = checker.getShorthandAssignmentValueSymbol(node.parent);
  }

  if (!symbol) return undefined;

  const isImported = symbol.declarations?.some((declaration) =>
    tsAst.isImportSpecifier(declaration)
  );

  if (!isImported) return undefined;

  const resolved = checker.getAliasedSymbol(symbol);

  const declaration = resolved?.declarations?.find((node) =>
    tsAst.isClassDeclaration(node)
  );

  if (!declaration?.path) {
    throw new Error(
      `Imported symbol "${symbol.name}" does not resolve to a class: ` +
        `${compiledFilePath}:${position}`
    );
  }

  const sourceFilePath = getSourceFilePath(declaration.path);

  return getMhPath(sourceFilePath, resolved.name);
}

function isDeclarationIdentifier(node) {
  const parent = node.parent;

  if (!parent) return false;

  if (
    tsAst.isImportSpecifier(parent) ||
    tsAst.isVariableDeclaration(parent) ||
    tsAst.isParameterDeclaration(parent) ||
    tsAst.isBindingElement(parent) ||
    tsAst.isFunctionDeclaration(parent) ||
    tsAst.isClassDeclaration(parent) ||
    tsAst.isMethodDeclaration(parent) ||
    tsAst.isPropertyDeclaration(parent)
  ) {
    return parent.name === node || parent.propertyName === node;
  }

  return false;
}

function transformFile(compiledFilePath, sourceFilePath, checker, program) {
  const code = fs.readFileSync(compiledFilePath, 'utf8');
  const sourceFile = program.getSourceFile(compiledFilePath);

  if (!sourceFile) {
    throw new Error(`TypeScript SourceFile not found: ${compiledFilePath}`);
  }

  const magic = new MagicString(code);
  const imports = [];
  const rewrittenRanges = new Set();

  for (const statement of sourceFile.statements) {
    if (!tsAst.isImportDeclaration(statement)) continue;

    const clause = statement.importClause;
    const bindings = clause?.namedBindings;

    if (clause?.name || (bindings && !tsAst.isNamedImports(bindings))) {
      throw new Error(
        `Only named imports are supported for now: ${compiledFilePath}`
      );
    }

    imports.push(statement);
  }

  function walk(node) {
    if (tsAst.isClassDeclaration(node) && node.name) {
      const exportModifier = node.modifiers?.find(
        (modifier) => modifier.kind === tsAst.SyntaxKind.ExportKeyword
      );

      if (exportModifier) {
        const targetPath = getMhPath(sourceFilePath, node.name.text);

        magic.overwrite(
          exportModifier.getStart(sourceFile),
          exportModifier.getEnd(),
          `${targetPath} =`
        );
      }
    }

    if (tsAst.isIdentifier(node) && !isDeclarationIdentifier(node)) {
      const start = node.getStart(sourceFile);
      const end = node.getEnd();
      const rangeKey = `${start}:${end}`;

      if (!rewrittenRanges.has(rangeKey)) {
        rewrittenRanges.add(rangeKey);

        const replacement = getImportedMhPath(
          checker,
          compiledFilePath,
          start,
          node
        );

        if (replacement) {
          const parent = node.parent;

          if (
            parent &&
            tsAst.isShorthandPropertyAssignment(parent) &&
            parent.name === node
          ) {
            magic.overwrite(
              parent.getStart(sourceFile),
              parent.getEnd(),
              `${node.text}: ${replacement}`
            );
          } else {
            magic.overwrite(start, end, replacement);
          }
        }
      }
    }

    for (const child of node.getChildren(sourceFile)) {
      walk(child);
    }
  }

  walk(sourceFile);

  for (const statement of imports) {
    magic.remove(statement.getStart(sourceFile), statement.getEnd());
  }

  return magic.toString();
}

function main() {
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Source directory not found: ${sourceDir}`);
  }

  if (!fs.existsSync(compiledDir)) {
    throw new Error(`Compiled directory not found: ${compiledDir}`);
  }

  const sourceFiles = collectTsFiles(sourceDir);

  if (sourceFiles.length === 0) {
    throw new Error(`No TypeScript files found: ${sourceDir}`);
  }

  const compiledFiles = sourceFiles.map(getCompiledFilePath);

  for (const compiledFilePath of compiledFiles) {
    if (!fs.existsSync(compiledFilePath)) {
      throw new Error(
        `Compiled JS not found: ${compiledFilePath}\n` +
          'Run tsc before running build-mh.mjs.'
      );
    }
  }

  const { program, checker } = createSemanticContext(compiledFiles);

  fs.rmSync(outputDir, {
    recursive: true,
    force: true
  });

  for (const sourceFilePath of sourceFiles) {
    const compiledFilePath = getCompiledFilePath(sourceFilePath);

    const outputPath = path.join(
      outputDir,
      path.relative(sourceDir, sourceFilePath).replace(/\.ts$/i, '.js')
    );

    fs.mkdirSync(path.dirname(outputPath), {
      recursive: true
    });

    fs.writeFileSync(
      outputPath,
      transformFile(compiledFilePath, sourceFilePath, checker, program),
      'utf8'
    );

    console.log(
      `${path.relative(sourceDir, sourceFilePath)} -> ` +
        `${path.relative(outputDir, outputPath)}`
    );
  }
}

main();
