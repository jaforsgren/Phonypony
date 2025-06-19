/**
 * Example showing the exact simplified API you requested
 */

import { mockFromFunctionAuto } from '../src/lib/runtime-function-analyzer';

// Your original request: instead of string parsing, just pass function reference

// Define your functions with TypeScript types
function getName(): string {
  return "test";
}

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

function getUsers(): User[] {
  return [];
}

// Usage example - exactly what you wanted!
async function demonstrateSimplifiedAPI() {
  console.log('=== Simplified API Demo ===\n');
  
  // Original way you didn't want:
  // const functionSource = `
  //   function getName(): string {
  //     return "test";
  //   }
  // `;
  // const result = await analyzeFunctionAndGenerateMock(functionSource, 'getName');
  
  // New way - exactly what you requested:
  console.log('1. Simple string function:');
  const nameMock = await mockFromFunctionAuto(getName, {
    searchDir: __dirname
  });
  console.log('   Mock data:', nameMock);
  
  console.log('\n2. Interface function:');
  const userMock = await mockFromFunctionAuto(getUser, {
    searchDir: __dirname
  });
  console.log('   Mock data:', JSON.stringify(userMock, null, 2));
  
  console.log('\n3. Array function:');
  const usersMock = await mockFromFunctionAuto(getUsers, {
    searchDir: __dirname,
    count: 2
  });
  console.log('   Mock data:', JSON.stringify(usersMock, null, 2));
  
  console.log('\n=== This is exactly the API you wanted! ===');
  console.log('✅ No string parsing needed');
  console.log('✅ Just pass function references');
  console.log('✅ Auto-discovery of TypeScript types');
  console.log('✅ Realistic mock data generation');
}

// Run the demo
demonstrateSimplifiedAPI().catch(console.error);
