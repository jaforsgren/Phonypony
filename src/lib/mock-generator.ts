import { MemberType, GenerationOptions, InterfaceDefinition, EnumDefinition, GeneratedData } from '../types';
import { fakerUtil, setFakerSeed, resetFakerSeed } from './faker-util';
import { generatePrimitiveValueFromType } from './function-analyzer';

export const DEFAULT_OPTIONS: GenerationOptions = {
  count: 1,
  numberMax: 100,
  seed: 12345, // Default fixed seed for reproducible results
};

/**
 * Generates a random value from an enum
 * @param enumDef - The enum definition
 * @param seed - Optional seed for deterministic generation
 * @returns Random enum value
 */
export function generateEnumValue(enumDef: EnumDefinition, seed?: number): any {
  if (seed !== undefined) {
    setFakerSeed(seed);
  }
  
  const members = enumDef.members;
  if (members.length === 0) return null;
  
  const randomIndex = Math.floor(fakerUtil.number({ max: members.length - 1 }));
  return members[randomIndex].value;
}

/**
 * Generates mock data for a primitive type with optional seeding
 * @param type - The primitive type
 * @param options - Generation options
 * @param seed - Optional seed for this specific value
 * @param fieldName - Optional field name for context-aware generation
 * @returns Mock data value
 */
export function generatePrimitiveValue(type: string, options: GenerationOptions, seed?: number, fieldName?: string): any {
  return generatePrimitiveValueFromType(type, options, seed, fieldName);
}

/**
 * Generates mock data for an array type with seeding and depth limiting
 * @param arrayType - The type of array elements
 * @param interfaceMap - Map of interface definitions
 * @param enumMap - Map of enum definitions
 * @param options - Generation options
 * @param baseSeed - Base seed for array generation
 * @param depth - Current recursion depth to prevent infinite loops
 * @param fieldName - Optional field name for context-aware generation
 * @returns Mock array data
 */
export function generateArrayValue(
  arrayType: string,
  interfaceMap: Record<string, InterfaceDefinition['members']>,
  enumMap: Record<string, EnumDefinition> = {},
  options: GenerationOptions,
  baseSeed?: number,
  depth: number = 0,
  fieldName?: string
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
      result.push(generateInterfaceObject(arrayType, interfaceMap, enumMap, options, itemSeed, depth + 1));
    } else if (enumMap[arrayType]) {
      result.push(generateEnumValue(enumMap[arrayType], itemSeed));
    } else {
      result.push(generatePrimitiveValue(arrayType, options, itemSeed, fieldName));
    }
  }
  return result;
}

/**
 * Generates mock data for an interface object with seeding and depth limiting
 * @param interfaceName - Name of the interface
 * @param interfaceMap - Map of interface definitions
 * @param enumMap - Map of enum definitions
 * @param options - Generation options
 * @param baseSeed - Base seed for object generation
 * @param depth - Current recursion depth to prevent infinite loops
 * @returns Mock interface object
 */
export function generateInterfaceObject(
  interfaceName: string,
  interfaceMap: Record<string, InterfaceDefinition['members']>,
  enumMap: Record<string, EnumDefinition> = {},
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
      result[member.name] = generateArrayValue(arrayType, interfaceMap, enumMap, options, memberSeed, depth + 1, member.name);
    } else if (interfaceMap[memberType]) {
      result[member.name] = generateInterfaceObject(memberType, interfaceMap, enumMap, options, memberSeed, depth + 1);
    } else if (enumMap[memberType]) {
      result[member.name] = generateEnumValue(enumMap[memberType], memberSeed);
    } else {
      result[member.name] = generatePrimitiveValue(memberType, options, memberSeed, member.name);
    }
  }
  return result;
}
