import { generateMockData } from '../src/lib/mock-data-service';

describe('Deterministic Generation', () => {
  describe('Complex Interface Structures', () => {
    it('should generate identical nested objects with same seed', async () => {
      const source = `
        interface Address {
          street: string;
          city: string;
          zipCode: number;
        }
        
        interface Pony {
          id: number;
          name: string;
          email: string;
          address: Address;
          isActive: boolean;
        }
      `;
      
      const options = { count: 3, numberMax: 1000, seed: 42 };
      
      const result1 = await generateMockData(source, options);
      const result2 = await generateMockData(source, options);
      
      expect(result1).toEqual(result2);
      
      // Verify structure is preserved
      const ponyResults1 = result1.find(r => r.name === 'Pony')!;
      const ponyResults2 = result2.find(r => r.name === 'Pony')!;
      
      expect(ponyResults1.data).toHaveLength(3);
      expect(ponyResults2.data).toHaveLength(3);
      
      // Check that nested objects are identical
      for (let i = 0; i < 3; i++) {
        expect(ponyResults1.data[i]).toEqual(ponyResults2.data[i]);
        expect(ponyResults1.data[i].address).toEqual(ponyResults2.data[i].address);
      }
    });

    it('should generate identical arrays of primitives with same seed', async () => {
      const source = `
        interface PonyProfile {
          id: number;
          tags: string[];
          scores: number[];
          flags: boolean[];
        }
      `;
      
      const options = { count: 2, numberMax: 100, seed: 12345 };
      
      const result1 = await generateMockData(source, options);
      const result2 = await generateMockData(source, options);
      
      expect(result1).toEqual(result2);
      
      const profileResults1 = result1.find(r => r.name === 'PonyProfile')!;
      const profileResults2 = result2.find(r => r.name === 'PonyProfile')!;
      
      // Verify arrays are identical
      for (let i = 0; i < 2; i++) {
        expect(profileResults1.data[i].tags).toEqual(profileResults2.data[i].tags);
        expect(profileResults1.data[i].scores).toEqual(profileResults2.data[i].scores);
        expect(profileResults1.data[i].flags).toEqual(profileResults2.data[i].flags);
      }
    });

    it('should generate identical arrays of objects with same seed', async () => {
      const source = `
        interface Product {
          id: number;
          name: string;
          price: number;
        }
        
        interface Order {
          orderId: string;
          items: Product[];
          total: number;
        }
      `;
      
      const options = { count: 2, numberMax: 500, seed: 999 };
      
      const result1 = await generateMockData(source, options);
      const result2 = await generateMockData(source, options);
      
      expect(result1).toEqual(result2);
      
      const orderResults1 = result1.find(r => r.name === 'Order')!;
      const orderResults2 = result2.find(r => r.name === 'Order')!;
      
      // Verify arrays of objects are identical
      for (let i = 0; i < 2; i++) {
        expect(orderResults1.data[i].items).toEqual(orderResults2.data[i].items);
        expect(orderResults1.data[i].items.length).toBeGreaterThan(0);
        
        // Check each item in the array
        for (let j = 0; j < orderResults1.data[i].items.length; j++) {
          expect(orderResults1.data[i].items[j]).toEqual(orderResults2.data[i].items[j]);
        }
      }
    });

    it('should generate different data with different seeds', async () => {
      const source = `
        interface SimplePony {
          id: number;
          name: string;
        }
      `;
      
      const options1 = { count: 2, numberMax: 100, seed: 111 };
      const options2 = { count: 2, numberMax: 100, seed: 222 };
      
      const result1 = await generateMockData(source, options1);
      const result2 = await generateMockData(source, options2);
      
      expect(result1).not.toEqual(result2);
      
      const pony1 = result1.find(r => r.name === 'SimplePony')!;
      const pony2 = result2.find(r => r.name === 'SimplePony')!;
      
      // At least one instance should be different
      let hasDifference = false;
      for (let i = 0; i < 2; i++) {
        if (pony1.data[i].id !== pony2.data[i].id || pony1.data[i].name !== pony2.data[i].name) {
          hasDifference = true;
          break;
        }
      }
      expect(hasDifference).toBe(true);
    });

    it('should maintain determinism across multiple interfaces with same seed', async () => {
      const source = `
        interface Person {
          firstName: string;
          lastName: string;
          age: number;
        }
        
        interface Company {
          name: string;
          employees: number;
          founded: number;
        }
        
        interface Contract {
          id: string;
          value: number;
          active: boolean;
        }
      `;
      
      const options = { count: 3, numberMax: 2000, seed: 5555 };
      
      const result1 = await generateMockData(source, options);
      const result2 = await generateMockData(source, options);
      
      expect(result1).toEqual(result2);
      expect(result1).toHaveLength(3); // Person, Company, Contract
      
      // Verify each interface generates identical data
      ['Person', 'Company', 'Contract'].forEach(interfaceName => {
        const interface1 = result1.find(r => r.name === interfaceName)!;
        const interface2 = result2.find(r => r.name === interfaceName)!;
        
        expect(interface1).toBeDefined();
        expect(interface2).toBeDefined();
        expect(interface1.data).toEqual(interface2.data);
        expect(interface1.data).toHaveLength(3);
      });
    });

    it('should generate consistent data for deeply nested structures', async () => {
      const source = `
        interface ContactInfo {
          email: string;
          phone: string;
        }
        
        interface Address {
          street: string;
          city: string;
          country: string;
        }
        
        interface PersonalDetails {
          contact: ContactInfo;
          address: Address;
          emergencyContacts: ContactInfo[];
        }
        
        interface Employee {
          id: number;
          name: string;
          details: PersonalDetails;
          skills: string[];
          certifications: string[];
        }
      `;
      
      const options = { count: 2, numberMax: 1000, seed: 7777 };
      
      const result1 = await generateMockData(source, options);
      const result2 = await generateMockData(source, options);
      
      expect(result1).toEqual(result2);
      
      const employeeResults1 = result1.find(r => r.name === 'Employee')!;
      const employeeResults2 = result2.find(r => r.name === 'Employee')!;
      
      // Deep equality check for complex nested structure
      for (let i = 0; i < 2; i++) {
        const emp1 = employeeResults1.data[i];
        const emp2 = employeeResults2.data[i];
        
        expect(emp1).toEqual(emp2);
        expect(emp1.details.contact).toEqual(emp2.details.contact);
        expect(emp1.details.address).toEqual(emp2.details.address);
        expect(emp1.details.emergencyContacts).toEqual(emp2.details.emergencyContacts);
        expect(emp1.skills).toEqual(emp2.skills);
        expect(emp1.certifications).toEqual(emp2.certifications);
      }
    });

    it('should maintain determinism with varying count values', async () => {
      const source = `
        interface TestItem {
          id: number;
          value: string;
        }
      `;
      
      const seed = 1234;
      
      const result1 = await generateMockData(source, { count: 1, numberMax: 100, seed });
      const result1Again = await generateMockData(source, { count: 1, numberMax: 100, seed });
      expect(result1).toEqual(result1Again);
      
      const result3 = await generateMockData(source, { count: 3, numberMax: 100, seed });
      const result3Again = await generateMockData(source, { count: 3, numberMax: 100, seed });
      expect(result3).toEqual(result3Again);
      
      // Verify that the first item is the same regardless of count
      const item1 = result1.find(r => r.name === 'TestItem')!.data[0];
      const item3First = result3.find(r => r.name === 'TestItem')!.data[0];
      expect(item1).toEqual(item3First);
    });

    it('should generate consistent optional properties', async () => {
      const source = `
        interface PonyWithOptionals {
          id: number;
          name: string;
          email?: string;
          age?: number;
          metadata?: string[];
        }
      `;
      
      const options = { count: 5, numberMax: 100, seed: 9999 };
      
      const result1 = await generateMockData(source, options);
      const result2 = await generateMockData(source, options);
      
      expect(result1).toEqual(result2);
      
      const ponyResults1 = result1.find(r => r.name === 'PonyWithOptionals')!;
      const ponyResults2 = result2.find(r => r.name === 'PonyWithOptionals')!;
      
      for (let i = 0; i < 5; i++) {
        expect(ponyResults1.data[i]).toEqual(ponyResults2.data[i]);
        
        const pony1 = ponyResults1.data[i];
        const pony2 = ponyResults2.data[i];
        
        expect('email' in pony1).toBe('email' in pony2);
        expect('age' in pony1).toBe('age' in pony2);
        expect('metadata' in pony1).toBe('metadata' in pony2);
      }
    });

    it('should maintain seeding consistency with large data sets', async () => {
      const source = `
        interface LargeDataSet {
          id: number;
          items: string[];
          metadata: number[];
          flags: boolean[];
        }
      `;
      
      const options = { count: 50, numberMax: 10000, seed: 11111 };
      
      const result1 = await generateMockData(source, options);
      const result2 = await generateMockData(source, options);
      
      expect(result1).toEqual(result2);
      
      const dataResults1 = result1.find(r => r.name === 'LargeDataSet')!;
      const dataResults2 = result2.find(r => r.name === 'LargeDataSet')!;
      
      expect(dataResults1.data).toHaveLength(50);
      expect(dataResults2.data).toHaveLength(50);
      
      const indicesToCheck = [0, 10, 25, 35, 49];
      indicesToCheck.forEach(index => {
        expect(dataResults1.data[index]).toEqual(dataResults2.data[index]);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty interfaces deterministically', async () => {
      const source = `
        interface EmptyInterface {
        }
      `;
      
      const options = { count: 2, numberMax: 100, seed: 123 };
      
      const result1 = await generateMockData(source, options);
      const result2 = await generateMockData(source, options);
      
      expect(result1).toEqual(result2);
      
      const emptyResults1 = result1.find(r => r.name === 'EmptyInterface')!;
      expect(emptyResults1.data).toHaveLength(2);
      expect(emptyResults1.data[0]).toEqual({});
    });

    it('should handle single property interfaces deterministically', async () => {
      const source = `
        interface SingleProp {
          value: string;
        }
      `;
      
      const options = { count: 10, numberMax: 100, seed: 456 };
      
      const result1 = await generateMockData(source, options);
      const result2 = await generateMockData(source, options);
      
      expect(result1).toEqual(result2);
      
      const singleResults1 = result1.find(r => r.name === 'SingleProp')!;
      expect(singleResults1.data).toHaveLength(10);
      
      singleResults1.data.forEach(item => {
        expect(typeof item.value).toBe('string');
        expect(item.value.length).toBeGreaterThan(0);
      });
    });

    it('should handle self-referencing interfaces deterministically', async () => {
      const source = `
        interface TreeNode {
          id: number;
          value: string;
          children: TreeNode[];
        }
      `;
      
      const options = { count: 3, numberMax: 100, seed: 789 };
      
      const result1 = await generateMockData(source, options);
      const result2 = await generateMockData(source, options);
      
      expect(result1).toEqual(result2);
      
      const treeResults1 = result1.find(r => r.name === 'TreeNode')!;
      expect(treeResults1.data).toHaveLength(3);
      
      treeResults1.data.forEach(node => {
        expect(typeof node.id).toBe('number');
        expect(typeof node.value).toBe('string');
        expect(Array.isArray(node.children)).toBe(true);
      });
    });

    it('should prevent infinite recursion and still generate deterministic data', async () => {
      const source = `
        interface RecursiveTree {
          id: number;
          value: string;
          children: RecursiveTree[];
          parent?: RecursiveTree;
        }
      `;
      
      const options = { count: 2, numberMax: 100, seed: 4444 };
      
      const result1 = await generateMockData(source, options);
      const result2 = await generateMockData(source, options);
      
      expect(result1).toEqual(result2);
      
      const treeResults1 = result1.find(r => r.name === 'RecursiveTree')!;
      expect(treeResults1.data).toHaveLength(2);
      
      treeResults1.data.forEach(tree => {
        expect(typeof tree.id).toBe('number');
        expect(typeof tree.value).toBe('string');
        expect(Array.isArray(tree.children)).toBe(true);
        
        if (tree.children.length > 0) {
          tree.children.forEach((child: any)=> {
            expect(typeof child.id).toBe('number');
            expect(typeof child.value).toBe('string');
            expect(Array.isArray(child.children)).toBe(true);
          });
        }
      });
    });
  });
});
