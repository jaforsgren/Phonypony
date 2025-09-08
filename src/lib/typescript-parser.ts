import { Project, ScriptTarget, Node, SyntaxKind, ObjectLiteralExpression, TypeNode, UnionTypeNode } from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';
import { InterfaceDefinition, TypeDefinition, EnumDefinition, ParsedDefinitions, EnumMember } from '../types';

/**
 * Parses TypeScript source code and extracts interface, type, and enum definitions
 * @param fileText - TypeScript source code
 * @returns Object containing arrays of interface, type, and enum definitions
 */
export function parseTypeScriptDefinitions(fileText: string, baseDir?: string): ParsedDefinitions {
  const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: {
      lib: ["DOM", "ESNext"],
      allowJs: false,
      noEmit: true,
      skipLibCheck: true,
      noImplicitAny: false,
      baseUrl: ".",
      target: ScriptTarget.ES2018,
    },
  });

  const sourceFile = project.createSourceFile("temp.ts", fileText);
  
  const interfaces: InterfaceDefinition[] = sourceFile.getInterfaces().map((i) => ({
    name: i.getName(),
    members: i.getMembers().map((m) => ({
      name: m.compilerNode.name?.getText() || '',
      type: m.compilerNode.type?.getText() || 'unknown',
    })),
  }));

  const types: TypeDefinition[] = sourceFile.getTypeAliases().map((t) => {
    // extract the right-hand side of the alias as text
    const raw = t.getText();
    const idx = raw.indexOf('=');
    let rhs = t.getTypeNode()?.getText() || 'unknown';
    if (idx !== -1) {
      rhs = raw.slice(idx + 1).trim().replace(/;$/, '');
    }
    return {
      name: t.getName(),
      type: rhs,
      kind: 'type' as const,
    };
  });

  const enums: EnumDefinition[] = sourceFile.getEnums().map((e) => ({
    name: e.getName(),
    members: e.getMembers().map((m) => ({
      name: m.getName(),
      value: m.getValue() ?? m.getName(),
    })),
  }));

  // Synthetic enums derived from `as const` object literals
  const constObjectEnumMap: Record<string, EnumDefinition> = {};
  for (const varDecl of sourceFile.getVariableDeclarations()) {
    const name = varDecl.getName();
    const initializer = varDecl.getInitializer();
    if (!initializer) continue;

    // Detect `as const` object literal
    const initializerText = initializer.getText();
    if (!initializerText.includes('as const')) continue;

    // Ensure it's an object literal expression (possibly wrapped in an `as const` assertion)
    let objLiteral: ObjectLiteralExpression | undefined;
    if (Node.isObjectLiteralExpression(initializer)) {
      objLiteral = initializer as ObjectLiteralExpression;
    } else if (Node.isAsExpression(initializer)) {
      const expr = initializer.getExpression();
      if (Node.isObjectLiteralExpression(expr)) {
        objLiteral = expr as ObjectLiteralExpression;
      }
    }
    if (!objLiteral) continue;

    const members = objLiteral.getProperties().flatMap((prop: any) => {
      if (Node.isPropertyAssignment(prop)) {
        const keyName = prop.getName ? prop.getName() : undefined;
        const initializer = prop.getInitializer();
        if (!keyName || !initializer) return [];
        // Support string/number/bool literals; fallback to raw text
        let value: any;
        if (initializer.getKind() === SyntaxKind.StringLiteral) {
          value = initializer.getText().slice(1, -1);
        } else if (initializer.getKind() === SyntaxKind.NumericLiteral) {
          value = Number(initializer.getText());
        } else if (initializer.getKind() === SyntaxKind.TrueKeyword) {
          value = 'true';
        } else if (initializer.getKind() === SyntaxKind.FalseKeyword) {
          value = 'false';
        } else {
          value = initializer.getText();
        }
        return [{ name: keyName, value }];
      }
      return [];
    });

    if (members.length > 0) {
      constObjectEnumMap[name] = { name, members };
    }
  }

  // enum-like definitions from union type aliases and keyof typeof patterns
  const aliasDerivedEnums: EnumDefinition[] = [];
  for (const t of sourceFile.getTypeAliases()) {
    const aliasName = t.getName();
    const typeNode: TypeNode | undefined = t.getTypeNode();
    if (!typeNode) continue;

    const typeText = typeNode.getText();

    // Union of literal types -> make enum from literals
    if (Node.isUnionTypeNode(typeNode)) {
      const union = typeNode as UnionTypeNode;
      const members: EnumMember[] = [];
      union.getTypeNodes().forEach((n) => {
        const k = n.getKind();
        if (k === SyntaxKind.StringLiteral) {
          const raw = n.getText();
          const val = raw.slice(1, -1);
          members.push({ name: val, value: val });
          return;
        }
        if (k === SyntaxKind.NumericLiteral) {
          const val = Number(n.getText());
          members.push({ name: String(val), value: val });
          return;
        }
        if (k === SyntaxKind.TrueKeyword) {
          members.push({ name: 'true', value: 'true' });
          return;
        }
        if (k === SyntaxKind.FalseKeyword) {
          members.push({ name: 'false', value: 'false' });
          return;
        }
      });
      if (members.length > 0) {
        aliasDerivedEnums.push({ name: aliasName, members });
        continue;
      }
    }

    // keyof typeof X -> enum from keys of const object X
    const keyofMatch = /^keyof\s+typeof\s+(\w+)$/.exec(typeText);
    if (keyofMatch) {
      const target = keyofMatch[1];
      const objEnum = constObjectEnumMap[target];
      if (objEnum) {
        const members = objEnum.members.map((m) => ({ name: m.name, value: m.name }));
        aliasDerivedEnums.push({ name: aliasName, members });
        continue;
      }
    }

    // (typeof X)[keyof typeof X] -> enum from values of const object X
    const valuesMatch = /^\(typeof\s+(\w+)\)\[keyof\s+typeof\s+\1\]$/.exec(typeText);
    if (valuesMatch) {
      const target = valuesMatch[1];
      const objEnum = constObjectEnumMap[target];
      if (objEnum) {
        const members = objEnum.members.map((m) => ({ name: String(m.value), value: m.value }));
        aliasDerivedEnums.push({ name: aliasName, members });
        continue;
      }
    }
  }

  // interfaces and enums as TypeDefinition
  const interfaceTypes: TypeDefinition[] = interfaces.map((i) => ({
    name: i.name,
    type: `interface ${i.name}`,
    kind: 'interface' as const,
  }));

  const enumTypes: TypeDefinition[] = enums.map((e) => ({
    name: e.name,
    type: `enum ${e.name}`,
    kind: 'enum' as const,
  }));

  // Resolve relative imports recursively and include only explicitly imported symbols
  const importedDefs = resolveImportedDefinitions(sourceFile, baseDir || process.cwd());

  return {
    interfaces: [...interfaces, ...importedDefs.interfaces],
    types: [...types, ...interfaceTypes, ...enumTypes, ...importedDefs.types],
    enums: [...enums, ...Object.values(constObjectEnumMap), ...aliasDerivedEnums, ...importedDefs.enums],
  };
}

function resolveImportedDefinitions(sourceFile: any, baseDir: string): ParsedDefinitions {
  const visited = new Set<string>();
  const aggregate: ParsedDefinitions = { interfaces: [], types: [], enums: [] };

  const importDecls = sourceFile.getImportDeclarations?.() || [];
  for (const importDecl of importDecls) {
    const moduleSpecifier = importDecl.getModuleSpecifierValue();
    if (!moduleSpecifier || !(moduleSpecifier.startsWith('./') || moduleSpecifier.startsWith('../'))) continue;

    // Collect explicitly imported symbol names
    const importedNames = new Set<string>();
    importDecl.getNamedImports().forEach((ni: any) => importedNames.add(ni.getName()));
    // Skip default and namespace imports for now
    if (importedNames.size === 0) continue;

    const resolvedPath = resolveImportPathFS(moduleSpecifier, baseDir);
    if (!resolvedPath || visited.has(resolvedPath)) continue;
    visited.add(resolvedPath);

    try {
      const fileText = fs.readFileSync(resolvedPath, 'utf-8');
      const nested = parseTypeScriptDefinitions(fileText, path.dirname(resolvedPath));
      // Filter to only explicitly imported symbols
      aggregate.interfaces.push(...nested.interfaces.filter(i => importedNames.has(i.name)));
      aggregate.enums.push(...nested.enums.filter(e => importedNames.has(e.name)));
      aggregate.types.push(...nested.types.filter(t => importedNames.has(t.name)));
    } catch {
      // ignore read/parse errors
    }
  }

  return aggregate;
}

function resolveImportPathFS(importPath: string, baseDir: string): string | null {
  const candidates = [
    `${importPath}.ts`,
    `${importPath}.tsx`,
    `${importPath}.d.ts`,
    `${importPath}/index.ts`,
    `${importPath}/index.tsx`,
  ].map(p => path.resolve(baseDir, p));

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  const direct = path.resolve(baseDir, importPath);
  if (fs.existsSync(direct)) return direct;
  return null;
}
