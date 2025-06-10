#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { generateMockData, generateAndSaveMockData } from './lib/mock-data-service';
import { DEFAULT_OPTIONS } from './lib/mock-generator';

function parseArgs() {
  const args = process.argv.slice(2);
  let filePath = '';
  let count = DEFAULT_OPTIONS.count;
  let numberMax = DEFAULT_OPTIONS.numberMax;
  let seed = DEFAULT_OPTIONS.seed;
  let outputPath: string | undefined;
  let countSet = false;
  let numberMaxSet = false;
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--output' || arg === '-o') {
      outputPath = args[++i];
    } else if (arg === '--seed' || arg === '-s') {
      seed = parseInt(args[++i]);
    } else if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    } else if (!filePath) {
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
  }
  
  return { filePath, count, numberMax, seed, outputPath };
}

function showHelp() {
  console.log(`
PhonyPony - TypeScript Mock Data Generator

Usage: phonypony <typescript-file> [count] [numberMax] [options]

Arguments:
  typescript-file    Path to the TypeScript file containing interfaces
  count             Number of instances to generate per interface (default: 1)
  numberMax         Maximum value for generated numbers (default: 100)

Options:
  -o, --output <file>  Save output to a JSON file instead of printing to console
  -s, --seed <number>  Set a custom seed for deterministic generation (default: 12345)
  -h, --help          Show this help message

Examples:
  phonypony ./types.ts                        # Generate 1 instance per interface
  phonypony ./types.ts 5                      # Generate 5 instances per interface
  phonypony ./types.ts 10 50                  # Generate 10 instances, max number = 50
  phonypony ./types.ts 5 100 -o data.json     # Save to file instead of console
  phonypony ./types.ts 3 50 --seed 42         # Use custom seed for reproducible results
  `);
}

/**
 * Handles CLI execution
 */
async function runCLI(): Promise<void> {
  const { filePath, count, numberMax, seed, outputPath } = parseArgs();
  
  if (!filePath) {
    console.error('Error: TypeScript file path is required');
    showHelp();
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const options = { count, numberMax, seed };
    
    console.log(`Generating mock data from: ${path.resolve(filePath)}`);
    console.log(`Count: ${count} instances per interface, Number max: ${numberMax}, Seed: ${seed}`);
    
    if (outputPath) {
      console.log(`Output file: ${path.resolve(outputPath)}\n`);
      await generateAndSaveMockData(fileContent, options, outputPath);
    } else {
      console.log(''); // Empty line before output
      const result = await generateMockData(fileContent, options);
      
      if (result.length === 0) {
        console.log('No interfaces found in the file.');
        return;
      }

      result.forEach((generatedType) => {
        console.log(`\n=== ${generatedType.name} ===`);
        console.log(JSON.stringify(generatedType.data, null, 2));
      });
    }
    
  } catch (error) {
    console.error('Error generating mock data:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runCLI().catch(console.error);
}
