#!/usr/bin/env node

import { analyzeFunctionAndGenerateMock } from '../../src/lib/function-analyzer';
import * as fs from 'fs';

// Demo script showing the new function analysis feature

async function runDemo() {
  console.log('🎭 PhonyPony Function Analyzer Demo\n');

  // Example 1: Primitive return type
  console.log('📝 Example 1: Function with primitive return type');
  const primitiveFunction = `
    function getUserName(): string {
      return "John Doe";
    }
  `;
  
  const result1 = await analyzeFunctionAndGenerateMock(primitiveFunction, 'getUserName');
  console.log(`Return type: ${result1.returnType}`);
  console.log(`Mock data: ${JSON.stringify(result1.mockData)}`);
  console.log('');

  // Example 2: Array return type
  console.log('📋 Example 2: Function with array return type');
  const arrayFunction = `
    function getScores(): number[] {
      return [85, 92, 78];
    }
  `;
  
  const result2 = await analyzeFunctionAndGenerateMock(arrayFunction, 'getScores', { count: 5, numberMax: 100 });
  console.log(`Return type: ${result2.returnType}`);
  console.log(`Mock data: ${JSON.stringify(result2.mockData)}`);
  console.log('');

  // Example 3: Interface return type
  console.log('🏗️  Example 3: Function with interface return type');
  const interfaceFunction = `
    interface User {
      id: number;
      name: string;
      email: string;
      isActive: boolean;
      createdAt: Date;
    }
    
    function getUser(id: number): User {
      return {
        id,
        name: "John Doe",
        email: "john@example.com",
        isActive: true,
        createdAt: new Date()
      };
    }
  `;
  
  const result3 = await analyzeFunctionAndGenerateMock(interfaceFunction, 'getUser');
  console.log(`Return type: ${result3.returnType}`);
  console.log(`Mock data: ${JSON.stringify(result3.mockData, null, 2)}`);
  console.log('');

  // Example 4: Array of interfaces
  console.log('📚 Example 4: Function with array of interfaces');
  const arrayInterfaceFunction = `
    interface Product {
      id: number;
      name: string;
      price: number;
      inStock: boolean;
    }
    
    function getProducts(): Product[] {
      return [];
    }
  `;
  
  const result4 = await analyzeFunctionAndGenerateMock(arrayInterfaceFunction, 'getProducts', { count: 3, numberMax: 1000 });
  console.log(`Return type: ${result4.returnType}`);
  console.log(`Mock data: ${JSON.stringify(result4.mockData, null, 2)}`);
  console.log('');

  // Example 5: Enum in interface
  console.log('🏷️  Example 5: Function with enum in interface');
  const enumFunction = `
    enum Status {
      PENDING = "pending",
      APPROVED = "approved",
      REJECTED = "rejected"
    }
    
    interface Task {
      id: number;
      title: string;
      status: Status;
      priority: number;
    }
    
    function getTask(): Task {
      return {
        id: 1,
        title: "Sample task",
        status: Status.PENDING,
        priority: 1
      };
    }
  `;
  
  const result5 = await analyzeFunctionAndGenerateMock(enumFunction, 'getTask');
  console.log(`Return type: ${result5.returnType}`);
  console.log(`Mock data: ${JSON.stringify(result5.mockData, null, 2)}`);
  console.log('');

  // Example 6: Analyzing from a file
  console.log('📁 Example 6: Analyzing function from file');
  try {
    const fileResult = await analyzeFunctionAndGenerateMock('./example-functions.ts', 'getUser');
    console.log(`Return type: ${fileResult.returnType}`);
    console.log(`Source file: ${fileResult.sourceFile}`);
    console.log(`Imports found: ${fileResult.imports.length}`);
    console.log(`Mock data: ${JSON.stringify(fileResult.mockData, null, 2)}`);
  } catch (error) {
    console.log(`File analysis failed: ${(error as Error).message}`);
  }
  
  console.log('\n✨ Demo completed!');
}

// Run the demo
if (require.main === module) {
  runDemo().catch(console.error);
}

export { runDemo };
