import { parseTypeScriptDefinitions } from '../src/lib/typescript-parser';

describe('TypeScript Parser', () => {
  it('should parse simple interface', async () => {
    const source = `
      interface Pony {
        id: number;
        name: string;
        isActive: boolean;
      }
    `;
    
    const result = await parseTypeScriptDefinitions(source);
    
    expect(result.interfaces).toHaveLength(1);
    expect(result.interfaces[0].name).toBe('Pony');
    expect(result.interfaces[0].members).toHaveLength(3);
    expect(result.interfaces[0].members[0]).toEqual({ name: 'id', type: 'number' });
    expect(result.interfaces[0].members[1]).toEqual({ name: 'name', type: 'string' });
    expect(result.interfaces[0].members[2]).toEqual({ name: 'isActive', type: 'boolean' });
  });

  it('should parse interface with array types', async () => {
    const source = `
      interface Pony {
        tags: string[];
        scores: number[];
      }
    `;
    
    const result = await parseTypeScriptDefinitions(source);
    
    expect(result.interfaces[0].members[0]).toEqual({ name: 'tags', type: 'string[]' });
    expect(result.interfaces[0].members[1]).toEqual({ name: 'scores', type: 'number[]' });
  });

  it('should parse multiple interfaces', async () => {
    const source = `
      interface Pony {
        name: string;
      }
      
      interface Product {
        title: string;
        price: number;
      }
    `;
    
    const result = await parseTypeScriptDefinitions(source);
    
    expect(result.interfaces).toHaveLength(2);
    expect(result.interfaces[0].name).toBe('Pony');
    expect(result.interfaces[1].name).toBe('Product');
  });

  it('should handle nested interface references', async () => {
    const source = `
      interface Address {
        street: string;
        city: string;
      }
      
      interface Pony {
        name: string;
        address: Address;
      }
    `;
    
    const result = await parseTypeScriptDefinitions(source);
    
    expect(result.interfaces).toHaveLength(2);
    const ponyInterface = result.interfaces.find(i => i.name === 'Pony');
    expect(ponyInterface?.members[1]).toEqual({ name: 'address', type: 'Address' });
  });

  // Type alias tests
  it('should parse simple type alias', async () => {
    const source = `
      type Status = 'active' | 'inactive';
    `;
    
    const result = await parseTypeScriptDefinitions(source);
    
    expect(result.types).toHaveLength(1);
    expect(result.types[0]).toEqual({
      name: 'Status',
      type: "'active' | 'inactive'",
      kind: 'type'
    });
  });

  it('should parse multiple type aliases', async () => {
    const source = `
      type Status = 'active' | 'inactive';
      type UserRole = 'admin' | 'user' | 'guest';
      type ID = string | number;
    `;
    
    const result = await parseTypeScriptDefinitions(source);
    
    expect(result.types).toHaveLength(3);
    expect(result.types[0]).toEqual({
      name: 'Status',
      type: "'active' | 'inactive'",
      kind: 'type'
    });
    expect(result.types[1]).toEqual({
      name: 'UserRole',
      type: "'admin' | 'user' | 'guest'",
      kind: 'type'
    });
    expect(result.types[2]).toEqual({
      name: 'ID',
      type: "string | number",
      kind: 'type'
    });
  });

  it('should parse mixed interfaces and types', async () => {
    const source = `
      interface User {
        id: number;
        name: string;
        status: Status;
      }
      
      type Status = 'active' | 'inactive';
      type UserRole = 'admin' | 'user';
    `;
    
    const result = await parseTypeScriptDefinitions(source);
    
    expect(result.interfaces).toHaveLength(1);
    expect(result.interfaces[0].name).toBe('User');
    expect(result.interfaces[0].members).toHaveLength(3);
    
    // Types array should contain both type aliases and interface representations
    expect(result.types).toHaveLength(3); // 2 type aliases + 1 interface representation
    
    const typeAliases = result.types.filter(t => t.kind === 'type');
    expect(typeAliases).toHaveLength(2);
    expect(typeAliases[0].name).toBe('Status');
    expect(typeAliases[1].name).toBe('UserRole');
    
    const interfaceTypes = result.types.filter(t => t.kind === 'interface');
    expect(interfaceTypes).toHaveLength(1);
    expect(interfaceTypes[0].name).toBe('User');
  });

  it('should handle complex type definitions', async () => {
    const source = `
      type ApiResponse<T> = {
        data: T;
        success: boolean;
        message?: string;
      };
      
      type EventHandler = (event: Event) => void;
      
      interface User {
        id: number;
        name: string;
      }
    `;
    
    const result = await parseTypeScriptDefinitions(source);
    
    expect(result.interfaces).toHaveLength(1);
    expect(result.interfaces[0].name).toBe('User');
    
    const typeAliases = result.types.filter(t => t.kind === 'type');
    expect(typeAliases).toHaveLength(2);
    expect(typeAliases[0].name).toBe('ApiResponse');
    expect(typeAliases[1].name).toBe('EventHandler');
    expect(typeAliases[1].type).toBe('(event: Event) => void');
  });

  it('should ignore classes and other constructs while parsing interfaces and types', async () => {
    const source = `
      class UserService {
        getUser() { return null; }
      }
      
      enum Status {
        ACTIVE = 'active',
        INACTIVE = 'inactive'
      }
      
      interface User {
        id: number;
        name: string;
      }
      
      type UserRole = 'admin' | 'user';
      
      function helper() { return true; }
    `;
    
    const result = await parseTypeScriptDefinitions(source);
    
    expect(result.interfaces).toHaveLength(1);
    expect(result.interfaces[0].name).toBe('User');
    
    const typeAliases = result.types.filter(t => t.kind === 'type');
    expect(typeAliases).toHaveLength(1);
    expect(typeAliases[0].name).toBe('UserRole');
  });
});
