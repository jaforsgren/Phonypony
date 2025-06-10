import { Project, ScriptTarget } from 'ts-morph';
import { InterfaceDefinition } from '../types';

/**
 * Parses TypeScript source code and extracts interface definitions
 * @param fileText - TypeScript source code
 * @returns Array of interface definitions
 */
export async function parseTypeScriptInterfaces(fileText: string): Promise<InterfaceDefinition[]> {
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
  
  return sourceFile.getInterfaces().map((i) => ({
    name: i.getName(),
    members: i.getMembers().map((m) => ({
      name: m.compilerNode.name?.getText() || '',
      type: m.compilerNode.type?.getText() || 'unknown',
    })),
  }));
}
