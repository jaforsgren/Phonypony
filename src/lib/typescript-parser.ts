import { Project, ScriptTarget, Node, SyntaxKind, ObjectLiteralExpression, TypeNode, UnionTypeNode } from 'ts-morph';
import { InterfaceDefinition, TypeDefinition, EnumDefinition, ParsedDefinitions, EnumMember } from '../types';

/**
 * Parses TypeScript source code and extracts interface, type, and enum definitions
 * @param fileText - TypeScript source code
 * @returns Object containing arrays of interface, type, and enum definitions
 */
export function parseTypeScriptDefinitions(fileText: string): ParsedDefinitions {
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
    // Robustly extract the right-hand side of the alias as text
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

  return {
    interfaces,
    types: [...types, ...interfaceTypes, ...enumTypes],
    enums: [...enums, ...Object.values(constObjectEnumMap), ...aliasDerivedEnums],
  };
}
