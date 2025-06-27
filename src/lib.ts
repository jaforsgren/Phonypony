// Main library exports for programmatic use
// This file exports the main API along with all underlying functionality

// Export the main API
export * from './api';

// Legacy exports for backward compatibility
export { generateMockData, generateAndSaveMockData } from './lib/mock-data-service';
export { parseTypeScriptDefinitions } from './lib/typescript-parser';
export { fakerUtil, setFakerSeed, resetFakerSeed } from './lib/faker-util';
export { generatePrimitiveValue, generateArrayValue, generateInterfaceObject, DEFAULT_OPTIONS } from './lib/mock-generator';
export { analyzeFunctionAndGenerateMock, FunctionAnalysisResult, ImportInfo } from './lib/function-analyzer';
export { 
  mockFromFunction, 
  analyzeFunction as analyzeRuntimeFunction, 
  withSourceContext, 
  mockFromFunctionEnhanced,
  mockFromFunctionAuto,
  mockFromFunctionSmart,
  RuntimeAnalysisOptions,
  AutoDiscoveryOptions
} from './lib/runtime-function-analyzer';
export * from './types';
