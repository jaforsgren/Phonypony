// Main library exports for programmatic use
export { generateMockData, generateAndSaveMockData } from './lib/mock-data-service';
export { parseTypeScriptDefinitions } from './lib/typescript-parser';
export { fakerUtil, setFakerSeed, resetFakerSeed } from './lib/faker-util';
export { generatePrimitiveValue, generateArrayValue, generateInterfaceObject, DEFAULT_OPTIONS } from './lib/mock-generator';
export { analyzeFunctionAndGenerateMock, FunctionAnalysisResult, ImportInfo } from './lib/function-analyzer';
export { 
  mockFromFunction, 
  analyzeFunction, 
  withSourceContext, 
  mockFromFunctionEnhanced,
  mockFromFunctionAuto,
  mockFromFunctionSmart,
  RuntimeAnalysisOptions,
  AutoDiscoveryOptions
} from './lib/runtime-function-analyzer';
export * from './types';
