import { Project, ScriptTarget, Node, SyntaxKind, FunctionDeclaration, MethodDeclaration, ArrowFunction, FunctionExpression, TypeChecker, Type } from 'ts-morph';
import { parseTypeScriptDefinitions } from './typescript-parser';
import { generateInterfaceObject, DEFAULT_OPTIONS } from './mock-generator';
import { GenerationOptions } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export interface FunctionAnalysisResult {
  returnType: string;
  sourceFile?: string;
  imports: ImportInfo[];
  mockData: any;
}

export interface ImportInfo {
  importPath: string;
  importedTypes: string[];
  isRelative: boolean;
}

/**
 * Analyzes a function and generates mock data for its return type
 * @param functionSource - The function source code or file path containing the function
 * @param functionName - Name of the function to analyze (optional if source contains only one function)
 * @param options - Generation options
 * @param baseDir - Base directory for resolving relative imports (optional)
 * @returns Analysis result with mock data
 */
export async function analyzeFunctionAndGenerateMock(
  functionSource: string,
  functionName?: string,
  options: GenerationOptions = DEFAULT_OPTIONS,
  baseDir?: string
): Promise<FunctionAnalysisResult> {
  
  let sourceCode: string;
  let actualBaseDir: string;
  
  // Determine if input is a file path or source code
  if (fs.existsSync(functionSource)) {
    sourceCode = fs.readFileSync(functionSource, 'utf-8');
    actualBaseDir = baseDir || path.dirname(functionSource);
  } else {
    sourceCode = functionSource;
    actualBaseDir = baseDir || process.cwd();
  }

  // Store source for parsing inline types
  currentAnalysisSource = sourceCode;

  const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: {
      lib: ["DOM", "ESNext"],
      allowJs: false,
      noEmit: true,
      skipLibCheck: true,
      noImplicitAny: false,
      baseUrl: actualBaseDir,
      target: ScriptTarget.ES2018,
      moduleResolution: 2, // Node resolution
    },
  });

  const sourceFile = project.createSourceFile("analysis.ts", sourceCode);
  const typeChecker = project.getTypeChecker();

  // Find the target function
  const targetFunction = findTargetFunction(sourceFile, functionName);
  if (!targetFunction) {
    throw new Error(`Function ${functionName || 'target function'} not found`);
  }

  // Get return type information
  const returnTypeInfo = analyzeReturnType(targetFunction, typeChecker);
  
  // Extract import information
  const imports = extractImports(sourceFile);
  
  // Resolve types and generate mock data
  const mockData = await generateMockDataForReturnType(
    returnTypeInfo,
    imports,
    actualBaseDir,
    options
  );

  return {
    returnType: returnTypeInfo.typeText,
    sourceFile: fs.existsSync(functionSource) ? functionSource : undefined,
    imports,
    mockData
  };
}

interface ReturnTypeInfo {
  typeText: string;
  typeSymbol?: any;
  isArray: boolean;
  isPrimitive: boolean;
  isInterface: boolean;
  isUnion: boolean;
}

function findTargetFunction(sourceFile: any, functionName?: string): FunctionDeclaration | MethodDeclaration | ArrowFunction | FunctionExpression | null {
  // Get all function-like declarations
  const functions = sourceFile.getDescendantsOfKind(SyntaxKind.FunctionDeclaration);
  const methods = sourceFile.getDescendantsOfKind(SyntaxKind.MethodDeclaration);
  const arrowFunctions = sourceFile.getDescendantsOfKind(SyntaxKind.ArrowFunction);
  const functionExpressions = sourceFile.getDescendantsOfKind(SyntaxKind.FunctionExpression);
  
  const allFunctions = [...functions, ...methods, ...arrowFunctions, ...functionExpressions];
  
  if (!functionName) {
    // If no name specified, return the first function found
    return allFunctions[0] || null;
  }
  
  // Find function by name
  for (const func of functions) {
    if (func.getName() === functionName) {
      return func;
    }
  }
  
  for (const method of methods) {
    if (method.getName() === functionName) {
      return method;
    }
  }
  
  // For arrow functions and function expressions, check if they're assigned to a variable
  const variableDeclarations = sourceFile.getVariableDeclarations();
  for (const varDecl of variableDeclarations) {
    if (varDecl.getName() === functionName) {
      const initializer = varDecl.getInitializer();
      if (initializer && (Node.isArrowFunction(initializer) || Node.isFunctionExpression(initializer))) {
        return initializer;
      }
    }
  }
  
  return null;
}

function analyzeReturnType(targetFunction: any, typeChecker: TypeChecker): ReturnTypeInfo {
  const returnTypeNode = targetFunction.getReturnTypeNode();
  let typeText: string;
  
  if (returnTypeNode) {
    typeText = returnTypeNode.getText();
  } else {
    // Infer return type from type checker
    const signature = targetFunction.getSignature();
    const returnType = signature?.getReturnType();
    typeText = returnType?.getText() || 'any';
  }
  
  // Clean up the type text
  typeText = typeText.trim();
  
  // Analyze the type characteristics
  const isArray = typeText.endsWith('[]') || typeText.includes('Array<') || typeText.includes('Array<');
  const baseTypeName = extractBaseTypeName(typeText);
  const isPrimitive = ['string', 'number', 'boolean', 'date', 'any'].includes(baseTypeName.toLowerCase());
  const isInterface = !isPrimitive && !isArray && !typeText.includes('|') && !typeText.includes('&');
  const isUnion = typeText.includes('|');
  
  return {
    typeText,
    isArray,
    isPrimitive,
    isInterface,
    isUnion
  };
}

function extractImports(sourceFile: any): ImportInfo[] {
  const imports: ImportInfo[] = [];
  const importDeclarations = sourceFile.getImportDeclarations();
  
  for (const importDecl of importDeclarations) {
    const importPath = importDecl.getModuleSpecifierValue();
    const isRelative = importPath.startsWith('./') || importPath.startsWith('../');
    
    const namedImports = importDecl.getNamedImports();
    const defaultImport = importDecl.getDefaultImport();
    const namespaceImport = importDecl.getNamespaceImport();
    
    const importedTypes: string[] = [];
    
    if (namedImports.length > 0) {
      namedImports.forEach((namedImport: any) => {
        importedTypes.push(namedImport.getName());
      });
    }
    
    if (defaultImport) {
      importedTypes.push(defaultImport.getText());
    }
    
    if (namespaceImport) {
      importedTypes.push(namespaceImport.getText());
    }
    
    imports.push({
      importPath,
      importedTypes,
      isRelative
    });
  }
  
  return imports;
}

async function generateMockDataForReturnType(
  returnTypeInfo: ReturnTypeInfo,
  imports: ImportInfo[],
  baseDir: string,
  options: GenerationOptions
): Promise<any> {
  
  const baseTypeName = extractBaseTypeName(returnTypeInfo.typeText);
  
  // Handle primitive types
  if (returnTypeInfo.isPrimitive && !returnTypeInfo.isArray) {
    return generatePrimitiveValueFromType(baseTypeName);
  }
  
  // Handle arrays of primitives
  if (returnTypeInfo.isArray && isPrimitiveType(baseTypeName)) {
    return Array.from({ length: options.count }, () => generatePrimitiveValueFromType(baseTypeName));
  }
  
  // For complex types, we need to parse the type definitions from the same source
  // First, try to parse from the current source (inline interfaces)
  const currentSourceResult = await parseTypeScriptDefinitions(getCurrentSourceForParsing());
  
  // Check if the type is defined in the current source
  let typeDefinitions = currentSourceResult;
  let foundInCurrent = currentSourceResult.interfaces.some(i => i.name === baseTypeName) ||
                      currentSourceResult.types.some(t => t.name === baseTypeName);
  
  // If not found in current source, try to resolve from imports
  if (!foundInCurrent) {
    typeDefinitions = await resolveTypeDefinitions(returnTypeInfo, imports, baseDir);
  }
  
  if (typeDefinitions.interfaces.length > 0 || typeDefinitions.types.length > 0) {
    const interfaceMap: Record<string, any> = {};
    const enumMap: Record<string, any> = {};
    
    typeDefinitions.interfaces.forEach((item: any) => {
      interfaceMap[item.name] = item.members;
    });
    
    typeDefinitions.enums.forEach((item: any) => {
      enumMap[item.name] = item;
    });
    
    if (interfaceMap[baseTypeName]) {
      if (returnTypeInfo.isArray) {
        return Array.from({ length: options.count }, () => 
          generateInterfaceObject(baseTypeName, interfaceMap, enumMap, options, options.seed || 12345, 0)
        );
      } else {
        return generateInterfaceObject(baseTypeName, interfaceMap, enumMap, options, options.seed || 12345, 0);
      }
    }
  }
  
  // Fallback for unknown types
  return null;
}

// Helper function to store current source for parsing
let currentAnalysisSource = '';

function getCurrentSourceForParsing(): string {
  return currentAnalysisSource;
}

function isPrimitiveType(typeName: string): boolean {
  return ['string', 'number', 'boolean', 'date'].includes(typeName.toLowerCase());
}

function extractBaseTypeName(typeText: string): string {
  // Remove array notation
  let baseName = typeText.replace('[]', '').replace(/Array<(.+)>/, '$1');
  
  // Handle union types (take the first type for now)
  if (baseName.includes('|')) {
    baseName = baseName.split('|')[0].trim();
  }
  
  // Handle generic types - extract the main type name
  if (baseName.includes('<')) {
    baseName = baseName.split('<')[0];
  }
  
  // Handle Promise types
  if (baseName.startsWith('Promise<') && baseName.endsWith('>')) {
    baseName = baseName.slice(8, -1);
  }
  
  return baseName.trim();
}

async function resolveTypeDefinitions(
  returnTypeInfo: ReturnTypeInfo,
  imports: ImportInfo[],
  baseDir: string
): Promise<any> {
  
  const typeName = extractBaseTypeName(returnTypeInfo.typeText);
  
  // Check if the type might be imported
  for (const importInfo of imports) {
    if (importInfo.importedTypes.includes(typeName) && importInfo.isRelative) {
      // Resolve the import path
      const importFilePath = resolveImportPath(importInfo.importPath, baseDir);
      
      if (fs.existsSync(importFilePath)) {
        const importedSource = fs.readFileSync(importFilePath, 'utf-8');
        const parsedDefinitions = await parseTypeScriptDefinitions(importedSource);
        
        // Check if our target type is in this file
        const hasTargetInterface = parsedDefinitions.interfaces.some(i => i.name === typeName);
        const hasTargetType = parsedDefinitions.types.some(t => t.name === typeName);
        
        if (hasTargetInterface || hasTargetType) {
          return parsedDefinitions;
        }
      }
    }
  }
  
  // If not found in imports, return empty definitions
  return {
    interfaces: [],
    types: [],
    enums: []
  };
}

function resolveImportPath(importPath: string, baseDir: string): string {
  const extensions = ['.ts', '.tsx', '.d.ts', '/index.ts', '/index.tsx'];
  
  for (const ext of extensions) {
    const fullPath = path.resolve(baseDir, importPath + ext);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  
  // Try with the original path
  const originalPath = path.resolve(baseDir, importPath);
  if (fs.existsSync(originalPath)) {
    return originalPath;
  }
  
  return path.resolve(baseDir, importPath + '.ts');
}

function generatePrimitiveValueFromType(typeText: string): any {
  const { fakerUtil } = require('./faker-util');
  
  switch (typeText.toLowerCase()) {
    case 'string':
      return fakerUtil.string();
    case 'number':
      return fakerUtil.number({ max: 100 });
    case 'boolean':
      return fakerUtil.boolean();
    case 'date':
      return fakerUtil.datetime();
    default:
      return null;
  }
}
