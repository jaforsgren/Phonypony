#!/usr/bin/env node

/**
 * PhonyPony Function Analyzer Usage Examples
 * 
 * This file demonstrates how to use the new analyzeFunctionAndGenerateMock API
 * to automatically generate mock data for function return types.
 */

import { analyzeFunctionAndGenerateMock } from '../../src/lib/function-analyzer';

async function exampleUsage() {
  console.log('🎯 Function Analyzer Usage Examples\n');

  // Example 1: Basic function analysis
  console.log('1. Basic Function Analysis:');
  const basicFunction = `
    function getProductId(): number {
      return 1;
    }
  `;
  
  const result1 = await analyzeFunctionAndGenerateMock(basicFunction, 'getProductId');
  console.log(`   Return Type: ${result1.returnType}`);
  console.log(`   Mock Data: ${result1.mockData}\n`);

  // Example 2: Function with interface return type
  console.log('2. Interface Return Type:');
  const interfaceFunction = `
    interface Customer {
      id: number;
      name: string;
      email: string;
      subscribed: boolean;
    }
    
    function getCustomer(): Customer {
      return {
        id: 1,
        name: "John",
        email: "john@example.com", 
        subscribed: true
      };
    }
  `;
  
  const result2 = await analyzeFunctionAndGenerateMock(interfaceFunction, 'getCustomer');
  console.log(`   Return Type: ${result2.returnType}`);
  console.log(`   Mock Data: ${JSON.stringify(result2.mockData, null, 4)}\n`);

  // Example 3: Array return type
  console.log('3. Array Return Type:');
  const arrayFunction = `
    function getTags(): string[] {
      return ["tech", "programming"];
    }
  `;
  
  const result3 = await analyzeFunctionAndGenerateMock(
    arrayFunction, 
    'getTags', 
    { count: 4, numberMax: 100 }
  );
  console.log(`   Return Type: ${result3.returnType}`);
  console.log(`   Mock Data: ${JSON.stringify(result3.mockData)}\n`);

  // Example 4: Function with enum
  console.log('4. Function with Enum:');
  const enumFunction = `
    enum OrderStatus {
      PENDING = "pending",
      PROCESSING = "processing", 
      SHIPPED = "shipped",
      DELIVERED = "delivered"
    }
    
    interface Order {
      id: number;
      amount: number;
      status: OrderStatus;
    }
    
    function getOrder(): Order {
      return {
        id: 1,
        amount: 99.99,
        status: OrderStatus.PENDING
      };
    }
  `;
  
  const result4 = await analyzeFunctionAndGenerateMock(enumFunction, 'getOrder');
  console.log(`   Return Type: ${result4.returnType}`);
  console.log(`   Mock Data: ${JSON.stringify(result4.mockData, null, 4)}\n`);

  // Example 5: Arrow function
  console.log('5. Arrow Function:');
  const arrowFunction = `
    interface ApiResult {
      success: boolean;
      message: string;
      data: any;
    }
    
    const processData = (): ApiResult => {
      return {
        success: true,
        message: "OK",
        data: null
      };
    };
  `;
  
  const result5 = await analyzeFunctionAndGenerateMock(arrowFunction, 'processData');
  console.log(`   Return Type: ${result5.returnType}`);
  console.log(`   Mock Data: ${JSON.stringify(result5.mockData, null, 4)}\n`);

  // Example 6: Class method
  console.log('6. Class Method:');
  const classMethod = `
    interface UserProfile {
      userId: number;
      username: string;
      lastLogin: Date;
    }
    
    class UserService {
      getUserProfile(id: number): UserProfile {
        return {
          userId: id,
          username: "testuser",
          lastLogin: new Date()
        };
      }
    }
  `;
  
  const result6 = await analyzeFunctionAndGenerateMock(classMethod, 'getUserProfile');
  console.log(`   Return Type: ${result6.returnType}`);
  console.log(`   Mock Data: ${JSON.stringify(result6.mockData, null, 4)}\n`);

  // Example 7: Auto-detect single function
  console.log('7. Auto-detect Function (no name needed):');
  const singleFunction = `
    function calculateTotal(): number {
      return 100;
    }
  `;
  
  const result7 = await analyzeFunctionAndGenerateMock(singleFunction); // No function name!
  console.log(`   Return Type: ${result7.returnType}`);
  console.log(`   Mock Data: ${result7.mockData}\n`);

  console.log('🎉 All examples completed successfully!');
}

// Run examples if this file is executed directly
if (require.main === module) {
  exampleUsage().catch(console.error);
}

export { exampleUsage };
