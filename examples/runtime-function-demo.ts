/**
 * Demonstration of the new runtime function analyzer API
 * 
 * This shows how you can now call mockFromFunction with actual JavaScript function references
 * instead of passing string source code.
 */

import { mockFromFunction, withSourceContext, mockFromFunctionEnhanced } from '../src/lib/function-analyzer';

// Define some TypeScript interfaces and functions
const sourceContext = `
  interface User {
    id: number;
    name: string;
    email: string;
    active: boolean;
    roles: string[];
    profile?: UserProfile;
  }
  
  interface UserProfile {
    avatar: string;
    bio: string;
    location: string;
  }
  
  interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    inStock: boolean;
    tags: string[];
  }
  
  enum OrderStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed", 
    SHIPPED = "shipped",
    DELIVERED = "delivered",
    CANCELLED = "cancelled"
  }
  
  interface Order {
    id: number;
    userId: number;
    products: Product[];
    status: OrderStatus;
    total: number;
    createdAt: Date;
  }
  
  // Function definitions with TypeScript types
  function getUser(): User {
    return {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      active: true,
      roles: ["user"]
    };
  }
  
  function getUsers(): User[] {
    return [];
  }
  
  function getProduct(): Product {
    return {
      id: 1,
      name: "Sample Product",
      price: 99.99,
      category: "electronics",
      inStock: true,
      tags: ["featured"]
    };
  }
  
  function getProducts(): Product[] {
    return [];
  }
  
  function getOrder(): Order {
    return {
      id: 1,
      userId: 1,
      products: [],
      status: OrderStatus.PENDING,
      total: 0,
      createdAt: new Date()
    };
  }
  
  function getUserById(id: number): User | null {
    return null;
  }
`;

// Actual JavaScript functions (types are erased at runtime)
function getUser() {
  return {
    id: 1,
    name: "John Doe", 
    email: "john@example.com",
    active: true,
    roles: ["user"]
  };
}

function getUsers() {
  return [];
}

function getProduct() {
  return {
    id: 1,
    name: "Sample Product",
    price: 99.99,
    category: "electronics", 
    inStock: true,
    tags: ["featured"]
  };
}

function getProducts() {
  return [];
}

function getOrder() {
  return {
    id: 1,
    userId: 1,
    products: [],
    status: "pending",
    total: 0,
    createdAt: new Date()
  };
}

function getUserById(id: number) {
  return null;
}

// Demonstration of the new API
async function demonstrateNewAPI() {
  console.log('=== PhonyPony Runtime Function Analyzer Demo ===\n');
  
  // Approach 1: Wrap functions with source context
  console.log('1. Wrapping functions with source context:');
  
  const wrappedGetUser = withSourceContext(getUser, sourceContext);
  const wrappedGetUsers = withSourceContext(getUsers, sourceContext);
  const wrappedGetProduct = withSourceContext(getProduct, sourceContext);
  const wrappedGetProducts = withSourceContext(getProducts, sourceContext);
  const wrappedGetOrder = withSourceContext(getOrder, sourceContext);
  const wrappedGetUserById = withSourceContext(getUserById, sourceContext);
  
  // Generate single user mock
  console.log('   Single User:');
  const userMock = await mockFromFunctionEnhanced(wrappedGetUser);
  console.log('  ', JSON.stringify(userMock, null, 2));
  
  // Generate multiple users
  console.log('\n   Multiple Users (3):');
  const usersMock = await mockFromFunctionEnhanced(wrappedGetUsers, { count: 3 });
  console.log('  ', JSON.stringify(usersMock, null, 2));
  
  // Generate single product
  console.log('\n   Single Product:');
  const productMock = await mockFromFunctionEnhanced(wrappedGetProduct);
  console.log('  ', JSON.stringify(productMock, null, 2));
  
  // Generate multiple products
  console.log('\n   Multiple Products (2):');
  const productsMock = await mockFromFunctionEnhanced(wrappedGetProducts, { count: 2 });
  console.log('  ', JSON.stringify(productsMock, null, 2));
  
  // Generate order with nested data
  console.log('\n   Order with nested Product array:');
  const orderMock = await mockFromFunctionEnhanced(wrappedGetOrder);
  console.log('  ', JSON.stringify(orderMock, null, 2));
  
  // Generate union type (User | null)
  console.log('\n   Union Type (User | null):');
  const userByIdMock = await mockFromFunctionEnhanced(wrappedGetUserById);
  console.log('  ', JSON.stringify(userByIdMock, null, 2));
  
  console.log('\n=== Demo Complete ===');
  console.log('\nThis new API allows you to:');
  console.log('• Pass actual JavaScript function references instead of string source code');
  console.log('• Automatically extract and parse TypeScript type information');
  console.log('• Generate realistic mock data based on function return types');
  console.log('• Handle complex nested interfaces, arrays, enums, and union types');
  console.log('• Maintain type safety and get IntelliSense support');
}

// Export for use in tests or other modules
export {
  demonstrateNewAPI,
  sourceContext,
  getUser,
  getUsers,
  getProduct,
  getProducts,
  getOrder,
  getUserById
};

// Run demo if this file is executed directly
if (require.main === module) {
  demonstrateNewAPI().catch(console.error);
}
