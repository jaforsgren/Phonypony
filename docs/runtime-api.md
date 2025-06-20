# Runtime Function Analysis API

This document describes the new runtime function analysis feature that allows you to generate mock data directly from JavaScript function references instead of parsing string source code.

## Overview

The new API allows you to:
- Pass actual JavaScript function references instead of string source code
- Automatically extract and analyze TypeScript type information
- Generate realistic mock data based on function return types
- Handle complex nested interfaces, arrays, enums, and union types

## Basic Usage

```typescript
import { mockFromFunction, withSourceContext, mockFromFunctionEnhanced } from 'phonypony';

// Your TypeScript source context (contains type information)
const sourceContext = `
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
`;

// Your actual JavaScript function (types erased at runtime)
function getUser() {
  return {
    id: 1,
    name: "John",
    email: "john@example.com",
    active: true
  };
}

// Usage - exactly what you wanted!
const wrappedFunction = withSourceContext(getUser, sourceContext);
const mock = await mockFromFunctionEnhanced(wrappedFunction);

console.log(mock);
// {
//   id: 42,
//   name: "Generated Name", 
//   email: "generated@example.com",
//   active: true
// }
```

## API Reference

### `mockFromFunction(func, options)`

Generate mock data from a function reference.

```typescript
const mock = await mockFromFunction(wrappedFunction, {
  count: 3,        // For arrays
  numberMax: 100,  // Max number value
  seed: 12345     // For deterministic results
});
```

### `withSourceContext(func, sourceContext, baseDir?)`

Wrap a function with TypeScript source context for better type analysis.

```typescript
const wrappedFunction = withSourceContext(myFunction, sourceContext, './src');
```

### `mockFromFunctionEnhanced(func, options)`

Enhanced version that automatically uses source context metadata if available.

```typescript
const mock = await mockFromFunctionEnhanced(wrappedFunction, { count: 5 });
```

### `analyzeFunction(func, options)`

Get detailed analysis results including return type and metadata.

```typescript
const result = await analyzeFunction(wrappedFunction);
console.log(result.returnType); // "User"
console.log(result.mockData);   // Generated mock data
console.log(result.imports);    // Import information
```

## Advanced Examples

### Array Return Types

```typescript
const sourceContext = `
  interface Product {
    id: number;
    name: string;
    price: number;
  }
  
  function getProducts(): Product[] {
    return [];
  }
`;

function getProducts() {
  return [];
}

const wrappedFunction = withSourceContext(getProducts, sourceContext);
const mocks = await mockFromFunctionEnhanced(wrappedFunction, { count: 3 });
// Returns array of 3 Product objects
```

### Union Types

```typescript
const sourceContext = `
  interface User {
    id: number;
    name: string;
  }
  
  function getUserById(id: number): User | null {
    return null;
  }
`;

function getUserById(id: number) {
  return null;
}

const wrappedFunction = withSourceContext(getUserById, sourceContext);
const mock = await mockFromFunctionEnhanced(wrappedFunction);
// Returns either a User object or null
```

### Nested Interfaces

```typescript
const sourceContext = `
  interface Address {
    street: string;
    city: string;
    zipCode: string;
  }
  
  interface User {
    id: number;
    name: string;
    address: Address;
    tags: string[];
  }
  
  function getUser(): User {
    return { ... };
  }
`;

// Generates realistic mock data for all nested properties
```

## How It Works

1. **Function Reference**: You pass an actual JavaScript function reference
2. **Source Context**: The TypeScript source code containing type definitions
3. **Type Extraction**: The system analyzes the source context to understand types
4. **Mock Generation**: Realistic mock data is generated based on the type information

## Limitations

- **Runtime Type Erasure**: TypeScript types are erased when compiled to JavaScript, so we need the source context to understand types
- **Source Context Required**: For complex types, you must provide the TypeScript source context
- **Function Names**: Function names must match between the JavaScript function and the source context

## Migration from String API

The new runtime API is compatible with the existing string-based API:

```typescript
// Old way (still supported)
const result = await analyzeFunctionAndGenerateMock(functionSource, 'functionName');

// New way 
const wrappedFunction = withSourceContext(actualFunction, functionSource);
const mock = await mockFromFunctionEnhanced(wrappedFunction);
```

Both approaches generate equivalent results, but the new API provides better ergonomics and type safety.
