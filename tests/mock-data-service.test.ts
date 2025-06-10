import { generateMockData } from '../src/lib/mock-data-service';

describe('Mock Data Service', () => {
  it('should generate mock data for interfaces', async () => {
    const source = `
      interface Pony {
        id: number;
        name: string;
        isActive: boolean;
      }
      
      interface Product {
        title: string;
        price: number;
      }
    `;
    
    const options = { count: 2, numberMax: 100, seed: 12345 };
    const result = await generateMockData(source, options);
    
    expect(result).toHaveLength(2);
    
    const ponyResult = result.find(r => r.name === 'Pony');
    const productResult = result.find(r => r.name === 'Product');
    
    expect(ponyResult).toBeDefined();
    expect(productResult).toBeDefined();
    
    expect(ponyResult!.data).toHaveLength(2);
    expect(productResult!.data).toHaveLength(2);
    
    // Check Pony structure
    expect(ponyResult!.data[0]).toHaveProperty('id');
    expect(ponyResult!.data[0]).toHaveProperty('name');
    expect(ponyResult!.data[0]).toHaveProperty('isActive');
    
    // Check Product structure
    expect(productResult!.data[0]).toHaveProperty('title');
    expect(productResult!.data[0]).toHaveProperty('price');
  });

  it('should generate deterministic data with same seed', async () => {
    const source = `
      interface Pony {
        id: number;
        name: string;
      }
    `;
    
    const options = { count: 2, numberMax: 50, seed: 42 };
    const result1 = await generateMockData(source, options);
    const result2 = await generateMockData(source, options);
    
    expect(result1).toEqual(result2);
  });

  it('should handle empty source', async () => {
    const source = '';
    const result = await generateMockData(source);
    
    expect(result).toHaveLength(0);
  });

  it('should use default options when none provided', async () => {
    const source = `
      interface Pony {
        id: number;
        name: string;
      }
    `;
    
    const result = await generateMockData(source);
    
    expect(result).toHaveLength(1);
    expect(result[0].data).toHaveLength(1); // Default count is 1
  });
});
