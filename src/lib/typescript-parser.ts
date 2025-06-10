import { Project, ScriptTarget } from 'ts-morph';
import { InterfaceDefinition, TypeDefinition, ParsedDefinitions } from '../types';

/**
 * Parses TypeScript source code and extracts interface and type definitions
 * @param fileText - TypeScript source code
 * @returns Object containing arrays of interface and type definitions
 */
export async function parseTypeScriptDefinitions(fileText: string): Promise<ParsedDefinitions> {
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

  const types: TypeDefinition[] = sourceFile.getTypeAliases().map((t) => ({
    name: t.getName(),
    type: t.getTypeNode()?.getText() || 'unknown',
    kind: 'type' as const,
  }));

  // Also include interfaces as TypeDefinition for consistency
  const interfaceTypes: TypeDefinition[] = interfaces.map((i) => ({
    name: i.name,
    type: `interface ${i.name}`,
    kind: 'interface' as const,
  }));

  return {
    interfaces,
    types: [...types, ...interfaceTypes],
  };
}
