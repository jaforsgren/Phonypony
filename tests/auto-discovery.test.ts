import { mockFromFunctionAuto, mockFromFunctionSmart } from '../src/lib/runtime-function-analyzer';

interface TestUser {
  id: number;
  name: string;
  email: string;
  active: boolean;
}

interface TestProduct {
  id: number;
  name: string;
  price: number;
  category: string;
}

function getTestUser(): TestUser {
  return {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    active: true
  };
}

function getTestProducts(): TestProduct[] {
  return [];
}

function getTestUserName(): string {
  return "test";
}

describe('Auto-Discovery Function Analyzer', () => {
  
  describe('mockFromFunctionAuto', () => {
    
    it('should auto-discover and generate mock for simple function', () => {
      const mock = mockFromFunctionAuto(getTestUserName, {
        searchDir: __dirname // Start search from test directory
      });
      
      expect(typeof mock).toBe('string');
    });
    
    it('should auto-discover and generate mock for interface function', () => {
      const mock = mockFromFunctionAuto(getTestUser, {
        searchDir: __dirname
      });
      
      expect(mock).toHaveProperty('id');
      expect(mock).toHaveProperty('name');
      expect(mock).toHaveProperty('email');
      expect(mock).toHaveProperty('active');
      expect(typeof mock.id).toBe('number');
      expect(typeof mock.name).toBe('string');
      expect(typeof mock.email).toBe('string');
      expect(typeof mock.active).toBe('boolean');
    });
    
    it('should auto-discover and generate mock for array function', () => {
      const mock = mockFromFunctionAuto(getTestProducts, {
        searchDir: __dirname,
        count: 2
      });
      
      expect(Array.isArray(mock)).toBe(true);
      expect(mock).toHaveLength(2);
      expect(mock[0]).toHaveProperty('id');
      expect(mock[0]).toHaveProperty('name');
      expect(mock[0]).toHaveProperty('price');
      expect(mock[0]).toHaveProperty('category');
    });
    
    it('should throw error for anonymous function', () => {
      const anonymousFunc = (() => function() { return "test"; })();
      
      expect(() => mockFromFunctionAuto(anonymousFunc))
        .toThrow('Function must have a name for auto-discovery');
    });
    
  });
  
  describe('mockFromFunctionSmart', () => {
    
    it('should use auto-discovery when possible', () => {
      const mock = mockFromFunctionSmart(getTestUserName, {
        searchDir: __dirname
      });
      
      expect(typeof mock).toBe('string');
    });
    
    it('should fallback to source context when auto-discovery fails', () => {
      function hiddenFunction(): string {
        return "hidden";
      }
      
      const sourceContext = `
        function hiddenFunction(): string {
          return "hidden";
        }
      `;
      
      (hiddenFunction as any).__sourceContext = sourceContext;
      
      const mock = mockFromFunctionSmart(hiddenFunction as any);
      
      expect(typeof mock).toBe('string');
    });
    
  });
  
});

describe('Ideal Usage Demo', () => {
  
  it('demonstrates the simplest possible API', () => {
    const userMock = mockFromFunctionAuto(getTestUser, {
      searchDir: __dirname
    });
    
    const productsMock = mockFromFunctionAuto(getTestProducts, {
      searchDir: __dirname,
      count: 3
    });
    
    const nameMock = mockFromFunctionAuto(getTestUserName, {
      searchDir: __dirname
    });
    
    expect(userMock).toHaveProperty('id');
    expect(userMock).toHaveProperty('name');
    expect(userMock).toHaveProperty('email');
    expect(userMock).toHaveProperty('active');
    
    expect(Array.isArray(productsMock)).toBe(true);
    expect(productsMock).toHaveLength(3);
    
    expect(typeof nameMock).toBe('string');
  });
  
});
