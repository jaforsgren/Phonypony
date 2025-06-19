/**
 * Simple example showing the exact API you requested
 */

import { mockFromFunction, withSourceContext, mockFromFunctionEnhanced } from '../src/lib/runtime-function-analyzer';

// Define your source context once (this contains the TypeScript type information)
const sourceContext = `
  interface User {
    id: number;
    name: string;
    email: string;
    active: boolean;
  }
  
  function getName(): string {
    return "test";
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

// Your actual JavaScript functions (types are erased at runtime)
function getName(): string {
  return "test";
}

function getUser() {
  return {
    id: 1,
    name: "John", 
    email: "john@example.com",
    active: true
  };
}

// Usage example - exactly what you wanted!
async function example() {
  // Wrap your functions with the source context
  const wrappedGetName = withSourceContext(getName, sourceContext);
  const wrappedGetUser = withSourceContext(getUser, sourceContext);
  
  // Now you can call mockFromFunction with the function reference!
  const nameMock = await mockFromFunctionEnhanced(wrappedGetName);
  const userMock = await mockFromFunctionEnhanced(wrappedGetUser);
  
  console.log('String mock:', nameMock);
  console.log('User mock:', userMock);
  
  // This is exactly the API you wanted:
  // const mock = mockFromFunction(getName)
  // But with source context for TypeScript type information
}

example().catch(console.error);
