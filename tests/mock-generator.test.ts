import { generatePrimitiveValue, generateArrayValue, generateInterfaceObject, generateEnumValue, DEFAULT_OPTIONS } from '../src/lib/mock-generator';
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
      const result = generateArrayValue('string', {}, {}, DEFAULT_OPTIONS, 1, 0);
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
      const result = generateArrayValue('TestInterface', interfaceMap, {}, DEFAULT_OPTIONS, 1, 0);
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
      
      const result = generateInterfaceObject('Pony', interfaceMap, {}, DEFAULT_OPTIONS, 1, 0);
      
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
      
      const result = generateInterfaceObject('Pony', interfaceMap, {}, DEFAULT_OPTIONS, 1, 0);
      
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
      
      const result = generateInterfaceObject('Pony', interfaceMap, {}, DEFAULT_OPTIONS, 1, 0);
      
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
      
      const result1 = generateInterfaceObject('Pony', interfaceMap, {}, DEFAULT_OPTIONS, 42, 0);
      const result2 = generateInterfaceObject('Pony', interfaceMap, {}, DEFAULT_OPTIONS, 42, 0);
      
      expect(result1).toEqual(result2);
    });
  });

  describe('generateEnumValue', () => {
    it('should generate value from string enum', () => {
      const enumDef = {
        name: 'Status',
        members: [
          { name: 'ACTIVE', value: 'active' },
          { name: 'INACTIVE', value: 'inactive' },
          { name: 'PENDING', value: 'pending' }
        ]
      };
      
      const result = generateEnumValue(enumDef, 42);
      expect(['active', 'inactive', 'pending']).toContain(result);
    });

    it('should generate value from numeric enum', () => {
      const enumDef = {
        name: 'Priority',
        members: [
          { name: 'LOW', value: 1 },
          { name: 'MEDIUM', value: 2 },
          { name: 'HIGH', value: 3 }
        ]
      };
      
      const result = generateEnumValue(enumDef, 42);
      expect([1, 2, 3]).toContain(result);
    });

    it('should generate deterministic values with same seed', () => {
      const enumDef = {
        name: 'Status',
        members: [
          { name: 'ACTIVE', value: 'active' },
          { name: 'INACTIVE', value: 'inactive' },
          { name: 'PENDING', value: 'pending' }
        ]
      };
      
      const result1 = generateEnumValue(enumDef, 42);
      const result2 = generateEnumValue(enumDef, 42);
      expect(result1).toBe(result2);
    });

    it('should handle empty enum', () => {
      const enumDef = {
        name: 'EmptyEnum',
        members: []
      };
      
      const result = generateEnumValue(enumDef, 42);
      expect(result).toBeNull();
    });

    it('should generate different values without seed', () => {
      const enumDef = {
        name: 'Status',
        members: [
          { name: 'ACTIVE', value: 'active' },
          { name: 'INACTIVE', value: 'inactive' },
          { name: 'PENDING', value: 'pending' }
        ]
      };
      
      const results = new Set();
      for (let i = 0; i < 20; i++) {
        results.add(generateEnumValue(enumDef));
      }
      
      // Should generate at least 2 different values in 20 attempts
      expect(results.size).toBeGreaterThan(1);
      results.forEach(result => {
        expect(['active', 'inactive', 'pending']).toContain(result);
      });
    });
  });

  describe('Enum Integration Tests', () => {
    it('should generate interface with enum properties', () => {
      const interfaceMap = {
        Task: [
          { name: 'id', type: 'number' },
          { name: 'status', type: 'Status' },
          { name: 'priority', type: 'Priority' }
        ]
      };
      
      const enumMap = {
        Status: {
          name: 'Status',
          members: [
            { name: 'ACTIVE', value: 'active' },
            { name: 'INACTIVE', value: 'inactive' }
          ]
        },
        Priority: {
          name: 'Priority',
          members: [
            { name: 'LOW', value: 1 },
            { name: 'HIGH', value: 2 }
          ]
        }
      };
      
      const result = generateInterfaceObject('Task', interfaceMap, enumMap, DEFAULT_OPTIONS, 42, 0);
      
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('priority');
      expect(typeof result.id).toBe('number');
      expect(['active', 'inactive']).toContain(result.status);
      expect([1, 2]).toContain(result.priority);
    });

    it('should generate array of enum values', () => {
      const enumMap = {
        Status: {
          name: 'Status',
          members: [
            { name: 'ACTIVE', value: 'active' },
            { name: 'INACTIVE', value: 'inactive' },
            { name: 'PENDING', value: 'pending' }
          ]
        }
      };
      
      const result = generateArrayValue('Status', {}, enumMap, DEFAULT_OPTIONS, 42, 0);
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      result.forEach(item => {
        expect(['active', 'inactive', 'pending']).toContain(item);
      });
    });

    it('should generate nested interface with enum arrays', () => {
      const interfaceMap = {
        Project: [
          { name: 'name', type: 'string' },
          { name: 'statuses', type: 'Status[]' },
          { name: 'currentStatus', type: 'Status' }
        ]
      };
      
      const enumMap = {
        Status: {
          name: 'Status',
          members: [
            { name: 'DRAFT', value: 'draft' },
            { name: 'PUBLISHED', value: 'published' }
          ]
        }
      };
      
      const result = generateInterfaceObject('Project', interfaceMap, enumMap, DEFAULT_OPTIONS, 42, 0);
      
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('statuses');
      expect(result).toHaveProperty('currentStatus');
      expect(typeof result.name).toBe('string');
      expect(Array.isArray(result.statuses)).toBe(true);
      expect(['draft', 'published']).toContain(result.currentStatus);
      
      result.statuses.forEach((status: any) => {
        expect(['draft', 'published']).toContain(status);
      });
    });
  });
});
