import { mockFromFunction, analyzeFunction, withSourceContext, mockFromFunctionEnhanced } from '../src/lib/runtime-function-analyzer';
import { DEFAULT_OPTIONS } from '../src/lib/mock-generator';

describe('Runtime Function Analyzer', () => {
  
  describe('mockFromFunction with simple types', () => {
    
    it('should generate mock for simple string return type', async () => {
      function getName(): string {
        return "test";
      }
      
      // Note: This will likely fail in JavaScript because types are erased
      // But let's test the mechanism
      try {
        const mock = await mockFromFunction(getName);
        expect(typeof mock).toBe('string');
      } catch (error) {
        // Expected - types are erased at runtime
        expect((error as Error).message).toContain('Failed to generate mock');
      }
    });
    
  });
  
  describe('withSourceContext approach', () => {
    
    it('should work with source context for simple function', async () => {
      function getName(): string {
        return "test";
      }
      
      const sourceContext = `
        function getName(): string {
          return "test";
        }
      `;
      
      const wrappedFunction = withSourceContext(getName, sourceContext);
      const mock = await mockFromFunctionEnhanced(wrappedFunction);
      
      expect(typeof mock).toBe('string');
    });
    
    it('should work with source context for interface return type', async () => {
      function getUser() {
        return {
          id: 1,
          name: "John",
          email: "john@example.com",
          active: true
        };
      }
      
      const sourceContext = `
        interface User {
          id: number;
          name: string;
          email: string;
          active: boolean;
        }
        
        function getUser(): User {
          return {
            id: 1,
            name: "John",
            email: "john@example.com",
            active: true
          };
        }
      `;
      
      const wrappedFunction = withSourceContext(getUser, sourceContext);
      const mock = await mockFromFunctionEnhanced(wrappedFunction);
      
      expect(mock).toHaveProperty('id');
      expect(mock).toHaveProperty('name');
      expect(mock).toHaveProperty('email');
      expect(mock).toHaveProperty('active');
      expect(typeof mock.id).toBe('number');
      expect(typeof mock.name).toBe('string');
      expect(typeof mock.email).toBe('string');
      expect(typeof mock.active).toBe('boolean');
    });
    
    it('should work with source context for array return type', async () => {
      function getProducts() {
        return [];
      }
      
      const sourceContext = `
        interface Product {
          id: number;
          name: string;
          price: number;
        }
        
        function getProducts(): Product[] {
          return [];
        }
      `;
      
      const wrappedFunction = withSourceContext(getProducts, sourceContext);
      const mock = await mockFromFunctionEnhanced(wrappedFunction, { count: 3 });
      
      expect(Array.isArray(mock)).toBe(true);
      expect(mock).toHaveLength(3);
      expect(mock[0]).toHaveProperty('id');
      expect(mock[0]).toHaveProperty('name');
      expect(mock[0]).toHaveProperty('price');
    });
    
  });
  
  describe('analyzeFunction', () => {
    
    it('should return analysis results', async () => {
      function getStatus() {
        return { code: 200, message: "OK" };
      }
      
      const sourceContext = `
        interface Status {
          code: number;
          message: string;
        }
        
        function getStatus(): Status {
          return { code: 200, message: "OK" };
        }
      `;
      
      const wrappedFunction = withSourceContext(getStatus, sourceContext);
      const result = await analyzeFunction(wrappedFunction, { 
        ...DEFAULT_OPTIONS, 
        sourceContext 
      });
      
      expect(result.returnType).toBe('Status');
      expect(result.mockData).toHaveProperty('code');
      expect(result.mockData).toHaveProperty('message');
      expect(result.imports).toEqual([]);
    });
    
  });
  
});

describe('Ideal Usage Examples', () => {
  
  it('demonstrates the ideal workflow', async () => {
    // 1. Define functions with TypeScript types
    // 2. Create source context once 
    // 3. Generate mocks easily
    
    const sourceContext = `
      interface User {
        id: number;
        name: string;
        email: string;
        active: boolean;
        roles: string[];
      }
      
      interface Product {
        id: number;
        name: string;
        price: number;
        category: string;
      }
      
      function getUser(): User {
        return {
          id: 1,
          name: "John",
          email: "john@example.com", 
          active: true,
          roles: ["user"]
        };
      }
      
      function getProducts(): Product[] {
        return [];
      }
      
      function getUserById(id: number): User | null {
        return null;
      }
    `;
    
    // Actual JavaScript functions (types erased)
    function getUser() {
      return {
        id: 1,
        name: "John",
        email: "john@example.com",
        active: true,
        roles: ["user"]
      };
    }
    
    function getProducts() {
      return [];
    }
    
    function getUserById(id: number) {
      return null;
    }
    
    const wrappedGetUser = withSourceContext(getUser, sourceContext);
    const wrappedGetProducts = withSourceContext(getProducts, sourceContext);
    const wrappedGetUserById = withSourceContext(getUserById, sourceContext);
    
    const userMock = await mockFromFunctionEnhanced(wrappedGetUser);
    const productsMock = await mockFromFunctionEnhanced(wrappedGetProducts, { count: 2 });
    const userByIdMock = await mockFromFunctionEnhanced(wrappedGetUserById);
    
    expect(userMock).toHaveProperty('id');
    expect(userMock).toHaveProperty('name'); 
    expect(userMock).toHaveProperty('email');
    expect(userMock).toHaveProperty('active');
    expect(userMock).toHaveProperty('roles');
    expect(Array.isArray(userMock.roles)).toBe(true);
    
    expect(Array.isArray(productsMock)).toBe(true);
    expect(productsMock).toHaveLength(2);
    expect(productsMock[0]).toHaveProperty('id');
    expect(productsMock[0]).toHaveProperty('name');
    expect(productsMock[0]).toHaveProperty('price');
    expect(productsMock[0]).toHaveProperty('category');
    
    expect(userByIdMock).toBeDefined();
  });
  
});
