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
    
    it('should auto-discover and generate mock for simple function', async () => {
      const mock = await mockFromFunctionAuto(getTestUserName, {
        searchDir: __dirname // Start search from test directory
      });
      
      expect(typeof mock).toBe('string');
    });
    
    it('should auto-discover and generate mock for interface function', async () => {
      const mock = await mockFromFunctionAuto(getTestUser, {
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
    
    it('should auto-discover and generate mock for array function', async () => {
      const mock = await mockFromFunctionAuto(getTestProducts, {
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
    
    it('should throw error for anonymous function', async () => {
      const anonymousFunc = (() => function() { return "test"; })();
      
      await expect(mockFromFunctionAuto(anonymousFunc))
        .rejects.toThrow('Function must have a name for auto-discovery');
    });
    
  });
  
  describe('mockFromFunctionSmart', () => {
    
    it('should use auto-discovery when possible', async () => {
      const mock = await mockFromFunctionSmart(getTestUserName, {
        searchDir: __dirname
      });
      
      expect(typeof mock).toBe('string');
    });
    
    it('should fallback to source context when auto-discovery fails', async () => {
      function hiddenFunction(): string {
        return "hidden";
      }
      
      const sourceContext = `
        function hiddenFunction(): string {
          return "hidden";
        }
      `;
      
      (hiddenFunction as any).__sourceContext = sourceContext;
      
      const mock = await mockFromFunctionSmart(hiddenFunction as any);
      
      expect(typeof mock).toBe('string');
    });
    
  });
  
});

describe('Ideal Usage Demo', () => {
  
  it('demonstrates the simplest possible API', async () => {
    const userMock = await mockFromFunctionAuto(getTestUser, {
      searchDir: __dirname
    });
    
    const productsMock = await mockFromFunctionAuto(getTestProducts, {
      searchDir: __dirname,
      count: 3
    });
    
    const nameMock = await mockFromFunctionAuto(getTestUserName, {
      searchDir: __dirname
    });
    
    expect(userMock).toHaveProperty('id');
    expect(userMock).toHaveProperty('name');
    expect(userMock).toHaveProperty('email');
    expect(userMock).toHaveProperty('active');
    
    expect(Array.isArray(productsMock)).toBe(true);
    expect(productsMock).toHaveLength(3);
    
    expect(typeof nameMock).toBe('string');
    
    console.log('Auto-generated mocks:');
    console.log('User:', userMock);
    console.log('Products:', productsMock);
    console.log('Name:', nameMock);
  });
  
});
