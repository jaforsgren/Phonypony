import { parseTypeScriptInterfaces } from '../src/lib/typescript-parser';

describe('TypeScript Parser', () => {
  it('should parse simple interface', async () => {
    const source = `
      interface Pony {
        id: number;
        name: string;
        isActive: boolean;
      }
    `;
    
    const result = await parseTypeScriptInterfaces(source);
    
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Pony');
    expect(result[0].members).toHaveLength(3);
    expect(result[0].members[0]).toEqual({ name: 'id', type: 'number' });
    expect(result[0].members[1]).toEqual({ name: 'name', type: 'string' });
    expect(result[0].members[2]).toEqual({ name: 'isActive', type: 'boolean' });
  });

  it('should parse interface with array types', async () => {
    const source = `
      interface Pony {
        tags: string[];
        scores: number[];
      }
    `;
    
    const result = await parseTypeScriptInterfaces(source);
    
    expect(result[0].members[0]).toEqual({ name: 'tags', type: 'string[]' });
    expect(result[0].members[1]).toEqual({ name: 'scores', type: 'number[]' });
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
    
    const result = await parseTypeScriptInterfaces(source);
    
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Pony');
    expect(result[1].name).toBe('Product');
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
    
    const result = await parseTypeScriptInterfaces(source);
    
    expect(result).toHaveLength(2);
    const ponyInterface = result.find(i => i.name === 'Pony');
    expect(ponyInterface?.members[1]).toEqual({ name: 'address', type: 'Address' });
  });
});
