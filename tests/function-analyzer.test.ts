import { analyzeFunctionAndGenerateMock } from '../src/lib/function-analyzer';
import { DEFAULT_OPTIONS } from '../src/lib/mock-generator';

describe('Function Analyzer', () => {
  
  describe('analyzeFunctionAndGenerateMock', () => {
    
    it('should analyze a function with primitive return type', async () => {
      const functionSource = `
        function getName(): string {
          return "test";
        }
      `;
      
      const result = await analyzeFunctionAndGenerateMock(functionSource, 'getName');
      
      expect(result.returnType).toBe('string');
      expect(typeof result.mockData).toBe('string');
      expect(result.imports).toEqual([]);
    });
    
    it('should analyze a function with array return type', async () => {
      const functionSource = `
        function getNumbers(): number[] {
          return [1, 2, 3];
        }
      `;
      
      const result = await analyzeFunctionAndGenerateMock(functionSource, 'getNumbers', { count: 3, numberMax: 100 });
      
      expect(result.returnType).toBe('number[]');
      expect(Array.isArray(result.mockData)).toBe(true);
      expect(result.mockData).toHaveLength(3);
      expect(typeof result.mockData[0]).toBe('number');
    });
    
    it('should analyze a function with interface return type', async () => {
      const functionSource = `
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
      
      const result = await analyzeFunctionAndGenerateMock(functionSource, 'getUser');
      
      expect(result.returnType).toBe('User');
      expect(result.mockData).toHaveProperty('id');
      expect(result.mockData).toHaveProperty('name');
      expect(result.mockData).toHaveProperty('email');
      expect(result.mockData).toHaveProperty('active');
      expect(typeof result.mockData.id).toBe('number');
      expect(typeof result.mockData.name).toBe('string');
      expect(typeof result.mockData.email).toBe('string');
      expect(typeof result.mockData.active).toBe('boolean');
    });
    
    it('should analyze a function with array of interfaces return type', async () => {
      const functionSource = `
        interface Product {
          id: number;
          name: string;
          price: number;
        }
        
        function getProducts(): Product[] {
          return [];
        }
      `;
      
      const result = await analyzeFunctionAndGenerateMock(functionSource, 'getProducts', { count: 2, numberMax: 100 });
      
      expect(result.returnType).toBe('Product[]');
      expect(Array.isArray(result.mockData)).toBe(true);
      expect(result.mockData).toHaveLength(2);
      expect(result.mockData[0]).toHaveProperty('id');
      expect(result.mockData[0]).toHaveProperty('name');
      expect(result.mockData[0]).toHaveProperty('price');
    });
    
    it('should analyze arrow function', async () => {
      const functionSource = `
        interface Status {
          code: number;
          message: string;
        }
        
        const getStatus = (): Status => {
          return { code: 200, message: "OK" };
        };
      `;
      
      const result = await analyzeFunctionAndGenerateMock(functionSource, 'getStatus');
      
      expect(result.returnType).toBe('Status');
      expect(result.mockData).toHaveProperty('code');
      expect(result.mockData).toHaveProperty('message');
    });
    
    it('should analyze method declaration', async () => {
      const functionSource = `
        interface ApiResponse {
          data: string;
          timestamp: Date;
        }
        
        class ApiService {
          getData(): ApiResponse {
            return {
              data: "test",
              timestamp: new Date()
            };
          }
        }
      `;
      
      const result = await analyzeFunctionAndGenerateMock(functionSource, 'getData');
      
      expect(result.returnType).toBe('ApiResponse');
      expect(result.mockData).toHaveProperty('data');
      expect(result.mockData).toHaveProperty('timestamp');
    });
    
    it('should handle function with enum return type', async () => {
      const functionSource = `
        enum UserRole {
          ADMIN = "admin",
          USER = "user",
          GUEST = "guest"
        }
        
        interface UserInfo {
          name: string;
          role: UserRole;
        }
        
        function getUserInfo(): UserInfo {
          return {
            name: "test",
            role: UserRole.USER
          };
        }
      `;
      
      const result = await analyzeFunctionAndGenerateMock(functionSource, 'getUserInfo');
      
      expect(result.returnType).toBe('UserInfo');
      expect(result.mockData).toHaveProperty('name');
      expect(result.mockData).toHaveProperty('role');
      expect(['admin', 'user', 'guest']).toContain(result.mockData.role);
    });
    
    it('should auto-detect function when no name provided', async () => {
      const functionSource = `
        function getSingleFunction(): string {
          return "test";
        }
      `;
      
      const result = await analyzeFunctionAndGenerateMock(functionSource);
      
      expect(result.returnType).toBe('string');
      expect(typeof result.mockData).toBe('string');
    });
    
    it('should throw error when function not found', async () => {
      const functionSource = `
        function existingFunction(): string {
          return "test";
        }
      `;
      
      await expect(analyzeFunctionAndGenerateMock(functionSource, 'nonExistentFunction'))
        .rejects.toThrow('Function nonExistentFunction not found');
    });
    
    it('should handle functions with inferred return types', async () => {
      const functionSource = `
        interface SimpleData {
          value: number;
        }
        
        function getInferredData() {
          const data: SimpleData = { value: 42 };
          return data;
        }
      `;
      
      const result = await analyzeFunctionAndGenerateMock(functionSource, 'getInferredData');
      
      // The function should still work even with inferred return types
      expect(result.mockData).toBeDefined();
    });
  });
  
  describe('Import resolution', () => {
    it('should detect import statements', async () => {
      const functionSource = `
        import { UserType } from './types/user';
        import { ApiResponse } from '../api/response';
        
        function processUser(): UserType {
          return {} as UserType;
        }
      `;
      
      const result = await analyzeFunctionAndGenerateMock(functionSource, 'processUser');
      
      expect(result.imports).toHaveLength(2);
      expect(result.imports[0].importPath).toBe('./types/user');
      expect(result.imports[0].importedTypes).toContain('UserType');
      expect(result.imports[0].isRelative).toBe(true);
      expect(result.imports[1].importPath).toBe('../api/response');
      expect(result.imports[1].importedTypes).toContain('ApiResponse');
      expect(result.imports[1].isRelative).toBe(true);
    });
  });
});
