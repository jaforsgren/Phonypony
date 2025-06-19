import { analyzeFunctionAndGenerateMock, FunctionAnalysisResult } from './function-analyzer';
import { DEFAULT_OPTIONS } from './mock-generator';
import { GenerationOptions } from '../types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Auto-discovery options for finding function sources
 */
export interface AutoDiscoveryOptions extends Partial<GenerationOptions> {
  /**
   * Base directory to search for source files (defaults to process.cwd())
   */
  searchDir?: string;
  
  /**
   * File patterns to search (defaults to TypeScript files)
   */
  filePatterns?: string[];
  
  /**
   * Whether to search recursively in subdirectories
   */
  recursive?: boolean;
  
  /**
   * Maximum depth for recursive search
   */
  maxDepth?: number;
}

/**
 * Options for runtime function analysis
 */
export interface RuntimeAnalysisOptions extends GenerationOptions {
  /**
   * Optional source code context - if the function was extracted from a larger file,
   * provide the full source to get better type resolution
   */
  sourceContext?: string;
  
  /**
   * Base directory for resolving imports (defaults to process.cwd())
   */
  baseDir?: string;
}

/**
 * Extract mock data from a JavaScript function reference
 * 
 * Note: This works by extracting the source code of the function using toString()
 * and then analyzing it with the TypeScript parser. The function must have been
 * compiled from TypeScript with type annotations preserved in some form.
 * 
 * @param func - The function reference
 * @param options - Generation options
 * @returns Mock data based on the function's return type
 */
export async function mockFromFunction(
  func: Function,
  options: RuntimeAnalysisOptions = { ...DEFAULT_OPTIONS }
): Promise<any> {
  // Extract function source code
  const functionSource = func.toString();
  const functionName = func.name || 'anonymous';
  
  // If we have source context, use it; otherwise use just the function
  const sourceToAnalyze = options.sourceContext || functionSource;
  
  try {
    const result = await analyzeFunctionAndGenerateMock(
      sourceToAnalyze,
      functionName,
      options,
      options.baseDir
    );
    
    return result.mockData;
  } catch (error) {
    throw new Error(`Failed to generate mock for function '${functionName}': ${error}`);
  }
}

/**
 * Analyze a function and return detailed analysis results
 * 
 * @param func - The function reference
 * @param options - Generation options
 * @returns Full analysis result with mock data and metadata
 */
export async function analyzeFunction(
  func: Function,
  options: RuntimeAnalysisOptions = { ...DEFAULT_OPTIONS }
): Promise<FunctionAnalysisResult> {
  const functionSource = func.toString();
  const functionName = func.name || 'anonymous';
  
  const sourceToAnalyze = options.sourceContext || functionSource;
  
  return await analyzeFunctionAndGenerateMock(
    sourceToAnalyze,
    functionName,
    options,
    options.baseDir
  );
}

/**
 * Create a function wrapper that preserves source context for better analysis
 * 
 * Usage:
 * ```typescript
 * const sourceContext = `
 *   interface User { id: number; name: string; }
 *   function getUser(): User { return { id: 1, name: 'test' }; }
 * `;
 * 
 * const wrappedFunction = withSourceContext(getUser, sourceContext);
 * const mock = await mockFromFunction(wrappedFunction);
 * ```
 */
export function withSourceContext<T extends Function>(
  func: T,
  sourceContext: string,
  baseDir?: string
): T & { __sourceContext?: string; __baseDir?: string } {
  const wrapped = func as T & { __sourceContext?: string; __baseDir?: string };
  wrapped.__sourceContext = sourceContext;
  wrapped.__baseDir = baseDir;
  return wrapped;
}

/**
 * Enhanced mockFromFunction that checks for source context metadata
 */
export async function mockFromFunctionEnhanced(
  func: Function & { __sourceContext?: string; __baseDir?: string },
  options: Partial<RuntimeAnalysisOptions> = {}
): Promise<any> {
  const enhancedOptions: RuntimeAnalysisOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
    sourceContext: func.__sourceContext,
    baseDir: func.__baseDir || process.cwd()
  };
  
  return await mockFromFunction(func, enhancedOptions);
}

/**
 * Enhanced mockFromFunction that automatically discovers and parses function source
 * 
 * This function attempts to locate the TypeScript source file containing the function
 * definition and automatically extract the type information.
 * 
 * @param func - The function reference
 * @param options - Auto-discovery and generation options
 * @returns Mock data based on the function's return type
 */
export async function mockFromFunctionAuto(
  func: Function,
  options: AutoDiscoveryOptions = {}
): Promise<any> {
  const functionName = func.name;
  
  if (!functionName || functionName === '') {
    throw new Error('Function must have a name for auto-discovery');
  }
  
  // Get the call stack to find the source file
  const sourceFile = await findFunctionSource(func, options);
  
  if (!sourceFile) {
    throw new Error(`Could not locate source file for function '${functionName}'`);
  }
  
  const generationOptions: GenerationOptions = {
    ...DEFAULT_OPTIONS,
    ...options
  };
  
  try {
    const result = await analyzeFunctionAndGenerateMock(
      sourceFile,
      functionName,
      generationOptions,
      options.searchDir || path.dirname(sourceFile)
    );
    
    return result.mockData;
  } catch (error) {
    throw new Error(`Failed to generate mock for function '${functionName}': ${error}`);
  }
}

/**
 * Find the source file containing the function definition
 */
async function findFunctionSource(
  func: Function,
  options: AutoDiscoveryOptions
): Promise<string | null> {
  const functionName = func.name;
  const searchDir = options.searchDir || process.cwd();
  const filePatterns = options.filePatterns || ['**/*.ts', '**/*.tsx'];
  const recursive = options.recursive !== false;
  const maxDepth = options.maxDepth || 10;
  
  // Get all TypeScript files in the search directory
  const files = await findSourceFiles(searchDir, filePatterns, recursive, maxDepth);
  
  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      const patterns = [
        // function declaration: function functionName(
        new RegExp(`function\\s+${functionName}\\s*\\(`),
        // const/let assignment with arrow function: const functionName = (...) =>
        new RegExp(`(?:const|let|var)\\s+${functionName}\\s*=\\s*\\([^)]*\\)\\s*=>`),
        // arrow function in object: functionName: (...) =>
        new RegExp(`${functionName}\\s*:\\s*\\([^)]*\\)\\s*=>`),
        // method declaration in class: functionName(...) {
        new RegExp(`${functionName}\\s*\\([^)]*\\)\\s*[:{]`),
        // method signature: functionName(...): Type
        new RegExp(`${functionName}\\s*\\([^)]*\\)\\s*:`),
      ];
      
      const hasFunction = patterns.some(pattern => pattern.test(content));
      
      if (hasFunction) {
        return filePath;
      }
    } catch (error) {
      // Skip files that can't be read
      continue;
    }
  }
  
  return null;
}

/**
 * Find all source files matching the patterns
 */
async function findSourceFiles(
  searchDir: string,
  patterns: string[],
  recursive: boolean,
  maxDepth: number,
  currentDepth: number = 0
): Promise<string[]> {
  if (currentDepth > maxDepth) {
    return [];
  }
  
  const files: string[] = [];
  
  try {
    const entries = fs.readdirSync(searchDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(searchDir, entry.name);
      
      if (entry.isDirectory() && recursive) {
        // Skip node_modules and other common directories to avoid
        if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(entry.name)) {
          const subFiles = await findSourceFiles(
            fullPath,
            patterns,
            recursive,
            maxDepth,
            currentDepth + 1
          );
          files.push(...subFiles);
        }
      } else if (entry.isFile()) {
        if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    // Skip directories that can't be read
  }
  
  return files;
}

/**
 * Enhanced version that tries auto-discovery first, falls back to source context
 */
export async function mockFromFunctionSmart(
  func: Function & { __sourceContext?: string; __baseDir?: string },
  options: AutoDiscoveryOptions = {}
): Promise<any> {
  // Try auto-discovery first
  try {
    return await mockFromFunctionAuto(func, options);
  } catch (autoError) {
    // Fall back to source context if available
    if (func.__sourceContext) {
      const enhancedOptions: RuntimeAnalysisOptions = {
        ...DEFAULT_OPTIONS,
        ...options,
        sourceContext: func.__sourceContext,
        baseDir: func.__baseDir || options.searchDir || process.cwd()
      };
      
      return await mockFromFunction(func, enhancedOptions);
    }
    
    throw new Error(`Could not generate mock for function '${func.name}': ${(autoError as Error).message}`);
  }
}
