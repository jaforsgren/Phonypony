import { parseTypeScriptDefinitions } from './typescript-parser';
import { generateInterfaceObject, DEFAULT_OPTIONS } from './mock-generator';
import { setFakerSeed, resetFakerSeed } from './faker-util';
import { GenerationOptions, GeneratedData } from '../types';
import { Project, ScriptTarget } from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Generates mock data for all interfaces in the TypeScript source
 * @param source - TypeScript source code
 * @param options - Generation options
 * @returns Array of generated mock data
 */
export function generateMockData(
  source: string,
  options: GenerationOptions = DEFAULT_OPTIONS
): GeneratedData[] {
  const result = parseTypeScriptDefinitions(source);
  const interfaces = result.interfaces;
  const enums = result.enums;
  const interfaceMap: Record<string, any> = {};
  const enumMap: Record<string, any> = {};
  
  interfaces.forEach(item => {
    interfaceMap[item.name] = item.members;
  });

  enums.forEach(item => {
    enumMap[item.name] = item;
  });

  const baseSeed = options.seed ?? DEFAULT_OPTIONS.seed ?? 12345;

  const interfaceResults = interfaces.map((interfaceDef, interfaceIndex) => ({
    name: interfaceDef.name,
    data: Array.from({ length: options.count }).map((_, instanceIndex) => {
      // Create a unique seed for each instance: baseSeed + interfaceIndex * 1000 + instanceIndex
      const instanceSeed = baseSeed + interfaceIndex * 1000 + instanceIndex;
      setFakerSeed(instanceSeed);
      
      const result = generateInterfaceObject(interfaceDef.name, interfaceMap, enumMap, options, instanceSeed, 0);
      
      resetFakerSeed();
      
      return result;
    })
  }));

  // Include primitive type aliases by resolving aliases using ts-morph
  const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: { lib: ["DOM", "ESNext"], target: ScriptTarget.ES2018 }
  });
  const sf = project.createSourceFile('aliases.ts', source, { overwrite: true });
  const primitiveAliases = sf.getTypeAliases().map(a => {
    const name = a.getName();
    const resolved = a.getType().getText();
    const nodeText = a.getTypeNode()?.getText() || '';
    const lowerResolved = resolved.toLowerCase();

    // Try direct resolved primitive
    let finalType: string | null = null;
    if (['string','number','boolean','date'].includes(lowerResolved)) {
      finalType = lowerResolved === 'date' ? 'date' : lowerResolved;
    }

    // Try to parse Unbox<...> patterns when checker is unhelpful
    if (!finalType) {
      const unboxMatch = /^Unbox<(.+)>$/i.exec(nodeText.replace(/\s+/g, ''));
      if (unboxMatch) {
        let inner = unboxMatch[1];
        // Normalize spaces removed earlier
        inner = inner;
        // If Box<primitive>
        const boxMatch = /^Box<(.+)>$/i.exec(inner);
        if (boxMatch) {
          inner = boxMatch[1];
        }
        const innerLower = inner.toLowerCase();
        if (['string','number','boolean','date','date'].includes(innerLower)) {
          finalType = innerLower === 'date' ? 'date' : innerLower;
        }
      }
    }

    return finalType ? { name, type: finalType } : null;
  }).filter((x): x is { name: string; type: string } => !!x);

  const aliasResults: GeneratedData[] = primitiveAliases.map((aliasDef, aliasIndex) => ({
    name: aliasDef.name,
    data: Array.from({ length: options.count }).map((_, instanceIndex) => {
      const instanceSeed = baseSeed + 10000 + aliasIndex * 1000 + instanceIndex;
      setFakerSeed(instanceSeed);
      let value: any;
      switch (aliasDef.type.toLowerCase()) {
        case 'string': value = require('./function-analyzer').generatePrimitiveValueFromType('string', options, instanceSeed); break;
        case 'number': value = require('./function-analyzer').generatePrimitiveValueFromType('number', options, instanceSeed); break;
        case 'boolean': value = require('./function-analyzer').generatePrimitiveValueFromType('boolean', options, instanceSeed); break;
        case 'date': value = require('./function-analyzer').generatePrimitiveValueFromType('date', options, instanceSeed); break;
        default: value = null;
      }
      resetFakerSeed();
      return value;
    })
  }));

  return [...interfaceResults, ...aliasResults];
}

/**
 * Generates mock data and optionally saves it to a file
 * @param source - TypeScript source code
 * @param options - Generation options
 * @param outputPath - Optional file path to save the generated data
 * @returns Array of generated mock data
 */
export function generateAndSaveMockData(
  source: string,
  options: GenerationOptions = DEFAULT_OPTIONS,
  outputPath?: string
): GeneratedData[] {
  const mockData = generateMockData(source, options);
  
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
