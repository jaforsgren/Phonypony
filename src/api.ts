/**
 * PhonyPony Public API
 * 
 * This module provides a unified API layer for all PhonyPony functionality.
 */

import { generateMockData, generateAndSaveMockData } from './lib/mock-data-service';
import { analyzeFunctionAndGenerateMock, FunctionAnalysisResult } from './lib/function-analyzer';
import { 
  mockFromFunction, 
  analyzeFunction, 
  withSourceContext, 
  mockFromFunctionEnhanced,
  mockFromFunctionAuto,
  mockFromFunctionSmart,
  RuntimeAnalysisOptions,
  AutoDiscoveryOptions
} from './lib/runtime-function-analyzer';
import { parseTypeScriptDefinitions } from './lib/typescript-parser';
import { DEFAULT_OPTIONS } from './lib/mock-generator';
import { GenerationOptions, GeneratedData, ParsedDefinitions } from './types';
import * as fs from 'fs';
import * as path from 'path';

// Re-export types for external use
export { 
  GenerationOptions, 
  GeneratedData, 
  ParsedDefinitions, 
  FunctionAnalysisResult, 
  RuntimeAnalysisOptions,
  AutoDiscoveryOptions 
} from './types';
export { FunctionAnalysisResult } from './lib/function-analyzer';
export { RuntimeAnalysisOptions, AutoDiscoveryOptions } from './lib/runtime-function-analyzer';

/**
 * API Options that extend GenerationOptions with file I/O options
 */
export interface APIOptions extends GenerationOptions {
  /**
   * Optional file path to save the generated data as JSON
   */
  outputPath?: string;
  
  /**
   * Base directory for resolving relative imports (for function analysis)
   */
  baseDir?: string;
}

/**
 * Function Analysis API Options
 */
export interface FunctionAPIOptions extends APIOptions {
  /**
   * Source context for runtime function analysis
   */
  sourceContext?: string;
  
  /**
   * Search directory for auto-discovery
   */
  searchDir?: string;
  
  /**
   * File patterns to search for auto-discovery
   */
  filePatterns?: string[];
  
  /**
   * Whether to search recursively
   */
  recursive?: boolean;
  
  /**
   * Maximum depth for recursive search
   */
  maxDepth?: number;
}

/**
 * Main API class that provides all PhonyPony functionality
 */
export class PhonyPonyAPI {
  private options: GenerationOptions;

  constructor(options: Partial<GenerationOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Generate mock data from TypeScript source code or file
   * @param sourceOrPath - TypeScript source code string or file path
   * @param options - Generation options
   * @returns Generated mock data
   */
  async generateFromSource(
    sourceOrPath: string, 
    options: Partial<APIOptions> = {}
  ): Promise<GeneratedData[]> {
    const mergedOptions = { ...this.options, ...options };
    
    let source: string;
    
    // Determine if input is a file path or source code
    if (fs.existsSync(sourceOrPath)) {
      source = fs.readFileSync(sourceOrPath, 'utf-8');
    } else {
      source = sourceOrPath;
    }
    
    if (options.outputPath) {
      return await generateAndSaveMockData(source, mergedOptions, options.outputPath);
    } else {
      return await generateMockData(source, mergedOptions);
    }
  }

  /**
   * Analyze a function and generate mock data for its return type
   * @param functionSourceOrPath - Function source code or file path
   * @param functionName - Name of the function to analyze (optional)
   * @param options - Analysis options
   * @returns Function analysis result with mock data
   */
  async analyzeFunction(
    functionSourceOrPath: string,
    functionName?: string,
    options: Partial<FunctionAPIOptions> = {}
  ): Promise<FunctionAnalysisResult> {
    const mergedOptions = { ...this.options, ...options };
    
    return await analyzeFunctionAndGenerateMock(
      functionSourceOrPath,
      functionName,
      mergedOptions,
      options.baseDir
    );
  }

  /**
   * Generate mock data from a runtime function reference
   * @param func - The function reference
   * @param options - Generation options
   * @returns Generated mock data
   */
  async generateFromFunction(
    func: Function,
    options: Partial<FunctionAPIOptions> = {}
  ): Promise<any> {
    const mergedOptions: RuntimeAnalysisOptions = {
      ...this.options,
      ...options,
      sourceContext: options.sourceContext,
      baseDir: options.baseDir || process.cwd()
    };
    
    return await mockFromFunction(func, mergedOptions);
  }

  /**
   * Generate mock data from a function with source context
   * @param func - The function reference with source context
   * @param options - Generation options
   * @returns Generated mock data
   */
  async generateFromFunctionEnhanced(
    func: Function & { __sourceContext?: string; __baseDir?: string },
    options: Partial<FunctionAPIOptions> = {}
  ): Promise<any> {
    const mergedOptions = { ...this.options, ...options };
    
    return await mockFromFunctionEnhanced(func, mergedOptions);
  }

  /**
   * Generate mock data from a function using auto-discovery
   * @param func - The function reference
   * @param options - Auto-discovery options
   * @returns Generated mock data
   */
  async generateFromFunctionAuto(
    func: Function,
    options: Partial<FunctionAPIOptions> = {}
  ): Promise<any> {
    const mergedOptions: AutoDiscoveryOptions = {
      ...this.options,
      ...options,
      searchDir: options.searchDir || process.cwd(),
      filePatterns: options.filePatterns || ['**/*.ts', '**/*.tsx'],
      recursive: options.recursive !== false,
      maxDepth: options.maxDepth || 10
    };
    
    return await mockFromFunctionAuto(func, mergedOptions);
  }

  /**
   * Smart function analysis that tries auto-discovery first, then falls back to source context
   * @param func - The function reference
   * @param options - Generation options
   * @returns Generated mock data
   */
  async generateFromFunctionSmart(
    func: Function & { __sourceContext?: string; __baseDir?: string },
    options: Partial<FunctionAPIOptions> = {}
  ): Promise<any> {
    const mergedOptions: AutoDiscoveryOptions = {
      ...this.options,
      ...options,
      searchDir: options.searchDir || process.cwd(),
      filePatterns: options.filePatterns || ['**/*.ts', '**/*.tsx'],
      recursive: options.recursive !== false,
      maxDepth: options.maxDepth || 10
    };
    
    return await mockFromFunctionSmart(func, mergedOptions);
  }

  /**
   * Parse TypeScript definitions from source code
   * @param source - TypeScript source code
   * @returns Parsed type definitions
   */
  async parseDefinitions(source: string): Promise<ParsedDefinitions> {
    return await parseTypeScriptDefinitions(source);
  }

  /**
   * Create a function wrapper with source context
   * @param func - The function to wrap
   * @param sourceContext - TypeScript source context
   * @param baseDir - Base directory for imports
   * @returns Wrapped function with source context
   */
  withSourceContext<T extends Function>(
    func: T,
    sourceContext: string,
    baseDir?: string
  ): T & { __sourceContext?: string; __baseDir?: string } {
    return withSourceContext(func, sourceContext, baseDir);
  }

  /**
   * Update the default options for this API instance
   * @param options - New options to merge with current options
   */
  setOptions(options: Partial<GenerationOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * Get the current options for this API instance
   * @returns Current generation options
   */
  getOptions(): GenerationOptions {
    return { ...this.options };
  }
}

/**
 * Default API instance for convenience
 */
export const api = new PhonyPonyAPI();

/**
 * Convenience functions that use the default API instance
 */

/**
 * Generate mock data from TypeScript source code or file
 * @param sourceOrPath - TypeScript source code string or file path
 * @param options - Generation options
 * @returns Generated mock data
 */
export async function generateFromSource(
  sourceOrPath: string, 
  options: Partial<APIOptions> = {}
): Promise<GeneratedData[]> {
  return await api.generateFromSource(sourceOrPath, options);
}

/**
 * Analyze a function and generate mock data for its return type
 * @param functionSourceOrPath - Function source code or file path
 * @param functionName - Name of the function to analyze (optional)
 * @param options - Analysis options
 * @returns Function analysis result with mock data
 */
export async function analyzeFunction(
  functionSourceOrPath: string,
  functionName?: string,
  options: Partial<FunctionAPIOptions> = {}
): Promise<FunctionAnalysisResult> {
  return await api.analyzeFunction(functionSourceOrPath, functionName, options);
}

/**
 * Generate mock data from a runtime function reference
 * @param func - The function reference
 * @param options - Generation options
 * @returns Generated mock data
 */
export async function generateFromFunction(
  func: Function,
  options: Partial<FunctionAPIOptions> = {}
): Promise<any> {
  return await api.generateFromFunction(func, options);
}

/**
 * Generate mock data from a function with source context
 * @param func - The function reference with source context
 * @param options - Generation options
 * @returns Generated mock data
 */
export async function generateFromFunctionEnhanced(
  func: Function & { __sourceContext?: string; __baseDir?: string },
  options: Partial<FunctionAPIOptions> = {}
): Promise<any> {
  return await api.generateFromFunctionEnhanced(func, options);
}

/**
 * Generate mock data from a function using auto-discovery
 * @param func - The function reference
 * @param options - Auto-discovery options
 * @returns Generated mock data
 */
export async function generateFromFunctionAuto(
  func: Function,
  options: Partial<FunctionAPIOptions> = {}
): Promise<any> {
  return await api.generateFromFunctionAuto(func, options);
}

/**
 * Smart function analysis that tries auto-discovery first, then falls back to source context
 * @param func - The function reference
 * @param options - Generation options
 * @returns Generated mock data
 */
export async function generateFromFunctionSmart(
  func: Function & { __sourceContext?: string; __baseDir?: string },
  options: Partial<FunctionAPIOptions> = {}
): Promise<any> {
  return await api.generateFromFunctionSmart(func, options);
}

/**
 * Parse TypeScript definitions from source code
 * @param source - TypeScript source code
 * @returns Parsed type definitions
 */
export async function parseDefinitions(source: string): Promise<ParsedDefinitions> {
  return await api.parseDefinitions(source);
}

/**
 * Create a function wrapper with source context
 * @param func - The function to wrap
 * @param sourceContext - TypeScript source context
 * @param baseDir - Base directory for imports
 * @returns Wrapped function with source context
 */
export function createWithSourceContext<T extends Function>(
  func: T,
  sourceContext: string,
  baseDir?: string
): T & { __sourceContext?: string; __baseDir?: string } {
  return api.withSourceContext(func, sourceContext, baseDir);
}

/**
 * Legacy compatibility - re-export original functions
 */
export { 
  generateMockData, 
  generateAndSaveMockData 
} from './lib/mock-data-service';

export { 
  analyzeFunctionAndGenerateMock 
} from './lib/function-analyzer';

export { 
  mockFromFunction, 
  analyzeFunction as analyzeRuntimeFunction, 
  withSourceContext, 
  mockFromFunctionEnhanced,
  mockFromFunctionAuto,
  mockFromFunctionSmart 
} from './lib/runtime-function-analyzer';

export { 
  parseTypeScriptDefinitions 
} from './lib/typescript-parser';

export { 
  DEFAULT_OPTIONS 
} from './lib/mock-generator';
