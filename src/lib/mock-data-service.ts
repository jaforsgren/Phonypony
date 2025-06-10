import { parseTypeScriptDefinitions } from './typescript-parser';
import { generateInterfaceObject, DEFAULT_OPTIONS } from './mock-generator';
import { setFakerSeed, resetFakerSeed } from './faker-util';
import { GenerationOptions, GeneratedData } from '../types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Generates mock data for all interfaces in the TypeScript source
 * @param source - TypeScript source code
 * @param options - Generation options
 * @returns Array of generated mock data
 */
export async function generateMockData(
  source: string,
  options: GenerationOptions = DEFAULT_OPTIONS
): Promise<GeneratedData[]> {
  const result = await parseTypeScriptDefinitions(source);
  const interfaces = result.interfaces;
  const interfaceMap: Record<string, any> = {};
  
  interfaces.forEach(item => {
    interfaceMap[item.name] = item.members;
  });

  const baseSeed = options.seed ?? DEFAULT_OPTIONS.seed ?? 12345;

  return interfaces.map((interfaceDef, interfaceIndex) => ({
    name: interfaceDef.name,
    data: Array.from({ length: options.count }).map((_, instanceIndex) => {
      // Create a unique seed for each instance: baseSeed + interfaceIndex * 1000 + instanceIndex
      const instanceSeed = baseSeed + interfaceIndex * 1000 + instanceIndex;
      setFakerSeed(instanceSeed);
      
      const result = generateInterfaceObject(interfaceDef.name, interfaceMap, options, instanceSeed, 0);
      
      resetFakerSeed();
      
      return result;
    })
  }));
}

/**
 * Generates mock data and optionally saves it to a file
 * @param source - TypeScript source code
 * @param options - Generation options
 * @param outputPath - Optional file path to save the generated data
 * @returns Array of generated mock data
 */
export async function generateAndSaveMockData(
  source: string,
  options: GenerationOptions = DEFAULT_OPTIONS,
  outputPath?: string
): Promise<GeneratedData[]> {
  const mockData = await generateMockData(source, options);
  
  if (outputPath) {
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const jsonOutput = JSON.stringify(mockData, null, 2);
    fs.writeFileSync(outputPath, jsonOutput, 'utf-8');
    console.log(`Mock data saved to: ${path.resolve(outputPath)}`);
  }
  
  return mockData;
}
