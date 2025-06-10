import { MemberType, GenerationOptions, InterfaceDefinition, GeneratedData } from '../types';
import { fakerUtil, setFakerSeed, resetFakerSeed } from './faker-util';

export const DEFAULT_OPTIONS: GenerationOptions = {
  count: 1,
  numberMax: 100,
  seed: 12345, // Default fixed seed for reproducible results
};

/**
 * Generates mock data for a primitive type with optional seeding
 * @param type - The primitive type
 * @param options - Generation options
 * @param seed - Optional seed for this specific value
 * @returns Mock data value
 */
export function generatePrimitiveValue(type: string, options: GenerationOptions, seed?: number): any {
  if (seed !== undefined) {
    setFakerSeed(seed);
  }
  
  switch (type) {
    case MemberType.STRING:
      return fakerUtil.text();
    case MemberType.NUMBER:
      return fakerUtil.number({ max: options.numberMax });
    case MemberType.BOOLEAN:
      return fakerUtil.boolean();
    case MemberType.DATE:
      return fakerUtil.datetime();
    default:
      return fakerUtil.string();
  }
}

/**
 * Generates mock data for an array type with seeding and depth limiting
 * @param arrayType - The type of array elements
 * @param interfaceMap - Map of interface definitions
 * @param options - Generation options
 * @param baseSeed - Base seed for array generation
 * @param depth - Current recursion depth to prevent infinite loops
 * @returns Mock array data
 */
export function generateArrayValue(
  arrayType: string,
  interfaceMap: Record<string, InterfaceDefinition['members']>,
  options: GenerationOptions,
  baseSeed?: number,
  depth: number = 0
): any[] {
  // Limit recursion depth to prevent infinite loops with self-referencing interfaces
  if (depth > 3) {
    return [];
  }

  // Use seeded random for array length if baseSeed is provided
  let arrayLength: number;
  if (baseSeed !== undefined) {
    setFakerSeed(baseSeed);
    arrayLength = Math.floor(fakerUtil.number({ max: 2 })) + 1; // 1-3 items
  } else {
    arrayLength = Math.floor(Math.random() * 3) + 1;
  }
  
  const result: any[] = [];
  
  for (let i = 0; i < arrayLength; i++) {
    const itemSeed = baseSeed !== undefined ? baseSeed + i + 100 : undefined;
    
    if (interfaceMap[arrayType]) {
      result.push(generateInterfaceObject(arrayType, interfaceMap, options, itemSeed, depth + 1));
    } else {
      result.push(generatePrimitiveValue(arrayType, options, itemSeed));
    }
  }
  return result;
}

/**
 * Generates mock data for an interface object with seeding and depth limiting
 * @param interfaceName - Name of the interface
 * @param interfaceMap - Map of interface definitions
 * @param options - Generation options
 * @param baseSeed - Base seed for object generation
 * @param depth - Current recursion depth to prevent infinite loops
 * @returns Mock interface object
 */
export function generateInterfaceObject(
  interfaceName: string,
  interfaceMap: Record<string, InterfaceDefinition['members']>,
  options: GenerationOptions,
  baseSeed?: number,
  depth: number = 0
): any {
  const members = interfaceMap[interfaceName];
  if (!members) return null;
  
  // Limit recursion depth to prevent infinite loops with self-referencing interfaces
  if (depth > 3) {
    return {};
  }

  const result: any = {};
  for (let i = 0; i < members.length; i++) {
    const member = members[i];
    const memberType = member.type;
    const memberSeed = baseSeed !== undefined ? baseSeed + i + 10 : undefined;
    
    if (memberType.endsWith('[]')) {
      const arrayType = memberType.slice(0, -2);
      result[member.name] = generateArrayValue(arrayType, interfaceMap, options, memberSeed, depth + 1);
    } else if (interfaceMap[memberType]) {
      result[member.name] = generateInterfaceObject(memberType, interfaceMap, options, memberSeed, depth + 1);
    } else {
      result[member.name] = generatePrimitiveValue(memberType, options, memberSeed);
    }
  }
  return result;
}
