import { generatePrimitiveValue, generateArrayValue, generateInterfaceObject, DEFAULT_OPTIONS } from '../src/lib/mock-generator';
import { MemberType } from '../src/types';

describe('Mock Generator', () => {
  describe('generatePrimitiveValue', () => {
    it('should generate string values', () => {
      const result = generatePrimitiveValue(MemberType.STRING, DEFAULT_OPTIONS, 1);
      expect(typeof result).toBe('string');
    });

    it('should generate number values within max range', () => {
      const options = { count: 1, numberMax: 50, seed: 12345 };
      const result = generatePrimitiveValue(MemberType.NUMBER, options, 1);
      expect(typeof result).toBe('number');
      expect(result).toBeLessThanOrEqual(50);
    });

    it('should generate boolean values', () => {
      const result = generatePrimitiveValue(MemberType.BOOLEAN, DEFAULT_OPTIONS, 1);
      expect(typeof result).toBe('boolean');
    });

    it('should generate date values', () => {
      const result = generatePrimitiveValue(MemberType.DATE, DEFAULT_OPTIONS, 1);
      expect(result instanceof Date).toBe(true);
    });

    it('should generate deterministic values with same seed', () => {
      const result1 = generatePrimitiveValue(MemberType.STRING, DEFAULT_OPTIONS, 42);
      const result2 = generatePrimitiveValue(MemberType.STRING, DEFAULT_OPTIONS, 42);
      expect(result1).toBe(result2);
    });
  });

  describe('generateArrayValue', () => {
    it('should generate array of primitive values', () => {
      const result = generateArrayValue('string', {}, DEFAULT_OPTIONS, 1, 0);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(typeof result[0]).toBe('string');
    });

    it('should generate array of interface objects', () => {
      const interfaceMap = {
        TestInterface: [
          { name: 'id', type: 'number' },
          { name: 'name', type: 'string' }
        ]
      };
      const result = generateArrayValue('TestInterface', interfaceMap, DEFAULT_OPTIONS, 1, 0);
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
    });
  });

  describe('generateInterfaceObject', () => {
    it('should generate object from interface definition', () => {
      const interfaceMap = {
        Pony: [
          { name: 'id', type: 'number' },
          { name: 'email', type: 'string' },
          { name: 'isActive', type: 'boolean' }
        ]
      };
      
      const result = generateInterfaceObject('Pony', interfaceMap, DEFAULT_OPTIONS, 1, 0);
      
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('isActive');
      expect(typeof result.id).toBe('number');
      expect(typeof result.email).toBe('string');
      expect(typeof result.isActive).toBe('boolean');
    });

    it('should handle nested interfaces', () => {
      const interfaceMap = {
        Address: [
          { name: 'street', type: 'string' },
          { name: 'city', type: 'string' }
        ],
        Pony: [
          { name: 'name', type: 'string' },
          { name: 'address', type: 'Address' }
        ]
      };
      
      const result = generateInterfaceObject('Pony', interfaceMap, DEFAULT_OPTIONS, 1, 0);
      
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('address');
      expect(result.address).toHaveProperty('street');
      expect(result.address).toHaveProperty('city');
    });

    it('should handle array properties', () => {
      const interfaceMap = {
        Pony: [
          { name: 'name', type: 'string' },
          { name: 'tags', type: 'string[]' }
        ]
      };
      
      const result = generateInterfaceObject('Pony', interfaceMap, DEFAULT_OPTIONS, 1, 0);
      
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('tags');
      expect(Array.isArray(result.tags)).toBe(true);
    });

    it('should generate deterministic objects with same seed', () => {
      const interfaceMap = {
        Pony: [
          { name: 'id', type: 'number' },
          { name: 'name', type: 'string' }
        ]
      };
      
      const result1 = generateInterfaceObject('Pony', interfaceMap, DEFAULT_OPTIONS, 42, 0);
      const result2 = generateInterfaceObject('Pony', interfaceMap, DEFAULT_OPTIONS, 42, 0);
      
      expect(result1).toEqual(result2);
    });
  });
});
