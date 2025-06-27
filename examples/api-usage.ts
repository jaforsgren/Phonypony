/**
 * PhonyPony API Usage Examples
 * 
 * This file demonstrates how to use the new unified API for generating mock data.
 */

import { 
  PhonyPonyAPI, 
  generateFromSource, 
  analyzeFunction, 
  generateFromFunction,
  generateFromFunctionAuto,
  generateFromFunctionEnhanced,
  createWithSourceContext 
} from '../src/api';

async function demonstrateAPI() {
  console.log('🎭 PhonyPony Unified API Demo\n');

  // Example 1: Using the class-based API
  console.log('1️⃣  Class-based API:');
  const api = new PhonyPonyAPI({ count: 2, seed: 12345 });
  
  const interfaceSource = `
    interface User {
      id: number;
      name: string;
      email: string;
      active: boolean;
    }
    
    interface Product {
      id: number;
      name: string;
      price: number;
    }
  `;
  
  const result1 = await api.generateFromSource(interfaceSource);
  console.log('Generated from interfaces:', JSON.stringify(result1, null, 2));
  
  // Example 2: Using convenience functions
  console.log('\n2️⃣  Convenience functions:');
  const result2 = await generateFromSource(interfaceSource, { count: 1, seed: 42 });
  console.log('Generated with convenience function:', JSON.stringify(result2, null, 2));
  
  // Example 3: Function analysis
  console.log('\n3️⃣  Function analysis:');
  const functionSource = `
    interface ApiResponse {
      status: number;
      message: string;
      data: any;
    }
    
    function getApiResponse(): ApiResponse {
      return {
        status: 200,
        message: "OK",
        data: null
      };
    }
  `;
  
  const result3 = await analyzeFunction(functionSource, 'getApiResponse', { seed: 100 });
  console.log('Function analysis result:');
  console.log(`  Return type: ${result3.returnType}`);
  console.log(`  Mock data: ${JSON.stringify(result3.mockData, null, 2)}`);
  
  // Example 4: Runtime function with source context
  console.log('\n4️⃣  Runtime function with source context:');
  
  function getUserData() {
    return { id: 1, name: "test" };
  }
  
  const sourceContext = `
    interface UserData {
      id: number;
      name: string;
    }
    
    function getUserData(): UserData {
      return { id: 1, name: "test" };
    }
  `;
  
  const wrappedFunction = createWithSourceContext(getUserData, sourceContext);
  const result4 = await generateFromFunctionEnhanced(wrappedFunction);
  console.log('Runtime function result:', JSON.stringify(result4, null, 2));
  
  console.log('\n✅ API demonstration completed!');
}

// Example showing how to save to file
async function demonstrateFileOutput() {
  console.log('\n💾 File output demo:');
  
  const source = `
    interface DemoData {
      id: number;
      timestamp: Date;
      value: string;
    }
  `;
  
  // This would save to a file in a real scenario
  const result = await generateFromSource(source, {
    count: 3,
    seed: 999,
    // outputPath: './demo-output.json'  // Uncomment to actually save
  });
  
  console.log('Data that would be saved:', JSON.stringify(result, null, 2));
}

if (require.main === module) {
  demonstrateAPI()
    .then(() => demonstrateFileOutput())
    .catch(console.error);
}

export { demonstrateAPI, demonstrateFileOutput };
