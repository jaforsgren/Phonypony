#!/usr/bin/env node

/**
 * PhonyPony CLI
 * 
 * Command-line interface for PhonyPony mock data generation.
 * Uses the unified API layer.
 */

import * as fs from 'fs';
import * as path from 'path';
import { generateFromSource, analyzeFunction } from './api';
import { DEFAULT_OPTIONS } from './lib/mock-generator';

interface CLIOptions {
  filePath: string;
  count: number;
  numberMax: number;
  seed?: number;
  outputPath?: string;
  functionName?: string;
  mode: 'generate' | 'analyze';
  help: boolean;
}

function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  let filePath = '';
  let count = DEFAULT_OPTIONS.count;
  let numberMax = DEFAULT_OPTIONS.numberMax;
  let seed = DEFAULT_OPTIONS.seed;
  let outputPath: string | undefined;
  let functionName: string | undefined;
  let mode: 'generate' | 'analyze' = 'generate';
  let help = false;
  let countSet = false;
  let numberMaxSet = false;
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--output':
      case '-o':
        outputPath = args[++i];
        break;
      case '--seed':
      case '-s':
        seed = parseInt(args[++i]);
        break;
      case '--function':
      case '-f':
        functionName = args[++i];
        mode = 'analyze';
        break;
      case '--analyze':
      case '-a':
        mode = 'analyze';
        break;
      case '--help':
      case '-h':
        help = true;
        break;
      default:
        if (!filePath) {
          filePath = arg;
        } else if (!isNaN(parseInt(arg))) {
          if (!countSet) {
            count = parseInt(arg);
            countSet = true;
          } else if (!numberMaxSet) {
            numberMax = parseInt(arg);
            numberMaxSet = true;
          }
        }
        break;
    }
  }
  
  return { filePath, count, numberMax, seed, outputPath, functionName, mode, help };
}

function showHelp(): void {
  console.log(`
🎭 PhonyPony - TypeScript Mock Data Generator

Usage: phonypony <typescript-file> [count] [numberMax] [options]

Modes:
  Default mode: Generate mock data from TypeScript interfaces
  Analyze mode: Generate mock data from function return types

Arguments:
  typescript-file    Path to the TypeScript file containing interfaces or functions
  count             Number of instances to generate per interface/function (default: 1)
  numberMax         Maximum value for generated numbers (default: 100)

Options:
  -o, --output <file>     Save output to a JSON file instead of printing to console
  -s, --seed <number>     Set a custom seed for deterministic generation (default: 12345)
  -f, --function <name>   Analyze a specific function and generate mock for its return type
  -a, --analyze           Analyze mode - generate mocks from function return types
  -h, --help              Show this help message

Examples:
  # Generate mock data from interfaces
  phonypony ./types.ts                        # Generate 1 instance per interface
  phonypony ./types.ts 5                      # Generate 5 instances per interface
  phonypony ./types.ts 10 50                  # Generate 10 instances, max number = 50
  phonypony ./types.ts 5 100 -o data.json     # Save to file instead of console
  phonypony ./types.ts 3 50 --seed 42         # Use custom seed for reproducible results
  
  # Analyze functions and generate mocks from return types
  phonypony ./functions.ts -a                 # Auto-detect and analyze functions
  phonypony ./functions.ts -f getUser         # Analyze specific function 'getUser'
  phonypony ./functions.ts -f getUsers 3      # Generate 3 instances from getUsers return type
  phonypony ./functions.ts -f getProduct -o data.json  # Save function analysis to file

🌟 Features:
  • Generate realistic mock data from TypeScript interfaces
  • Analyze functions and mock their return types  
  • Support for nested interfaces, arrays, enums
  • Deterministic generation with custom seeds
  • Export to JSON files
  • Context-aware field generation (email, name, etc.)
  `);
}

export async function runCLI(): Promise<void> {
  const options = parseArgs();
  
  if (options.help) {
    showHelp();
    process.exit(0);
  }
  
  if (!options.filePath) {
    console.error('❌ Error: TypeScript file path is required');
    showHelp();
    process.exit(1);
  }

  if (!fs.existsSync(options.filePath)) {
    console.error(`❌ File not found: ${options.filePath}`);
    process.exit(1);
  }

  try {
    const resolvedPath = path.resolve(options.filePath);
    const generationOptions = { 
      count: options.count, 
      numberMax: options.numberMax, 
      seed: options.seed 
    };
    
    if (options.mode === 'analyze') {
      await runAnalyzeMode(resolvedPath, options.functionName, generationOptions, options.outputPath);
    } else {
      await runGenerateMode(resolvedPath, generationOptions, options.outputPath);
    }
    
  } catch (error) {
    console.error('❌ Error:', (error as Error).message);
    process.exit(1);
  }
}

async function runGenerateMode(
  filePath: string, 
  generationOptions: any, 
  outputPath?: string
): Promise<void> {
  console.log(`🎭 Generating mock data from: ${filePath}`);
  console.log(`📊 Options: ${generationOptions.count} instances per interface, max numbers: ${generationOptions.numberMax}, seed: ${generationOptions.seed}`);
  
  const result = await generateFromSource(filePath, {
    ...generationOptions,
    outputPath
  });
  
  if (outputPath) {
    console.log(`✅ Mock data saved to: ${path.resolve(outputPath)}`);
  } else {
    console.log(''); // Empty line before output
    
    if (result.length === 0) {
      console.log('ℹ️  No interfaces found in the file.');
      return;
    }

    result.forEach((generatedType) => {
      console.log(`\n🏷️  === ${generatedType.name} ===`);
      console.log(JSON.stringify(generatedType.data, null, 2));
    });
  }
}

async function runAnalyzeMode(
  filePath: string, 
  functionName: string | undefined, 
  generationOptions: any,
  outputPath?: string
): Promise<void> {
  console.log(`🔍 Analyzing functions in: ${filePath}`);
  console.log(`📊 Options: ${generationOptions.count} instances per function, max numbers: ${generationOptions.numberMax}, seed: ${generationOptions.seed}`);
  
  if (functionName) {
    console.log(`🎯 Target function: ${functionName}`);
  } else {
    console.log(`🎯 Auto-detecting functions...`);
  }
  
  const result = await analyzeFunction(filePath, functionName, generationOptions);
  
  if (outputPath) {
    const outputData = {
      function: functionName || 'auto-detected',
      returnType: result.returnType,
      sourceFile: result.sourceFile,
      imports: result.imports,
      mockData: result.mockData
    };
    
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');
    console.log(`✅ Function analysis saved to: ${path.resolve(outputPath)}`);
  } else {
    console.log(''); // Empty line before output
    console.log(`🏷️  Function: ${functionName || 'auto-detected'}`);
    console.log(`📋 Return Type: ${result.returnType}`);
    
    if (result.imports.length > 0) {
      console.log(`📦 Imports: ${result.imports.length} found`);
      result.imports.forEach(imp => {
        console.log(`   ${imp.importPath} (${imp.importedTypes.join(', ')})`);
      });
    }
    
    console.log(`\n🎭 Generated Mock Data:`);
    console.log(JSON.stringify(result.mockData, null, 2));
  }
}

if (require.main === module) {
  runCLI().catch(console.error);
}
