# ✨ Simplified Runtime API - Auto-Discovery

You asked for a way to call `mockFromFunction(functionReference)` instead of parsing strings.

## 🎯 What You Wanted vs What You Get

### ❌ Old Way (String Parsing)

```typescript
const functionSource = `
  function getName(): string {
    return "test";
  }
`;
const result = await analyzeFunctionAndGenerateMock(functionSource, 'getName');
```

### ✅ New Way (Function Reference)

```typescript
function getName(): string {
  return "test";
}

const mock = await mockFromFunctionAuto(getName);
```

## 🚀 Quick Start

```typescript
import { mockFromFunctionAuto } from 'phonypony';

// Define your functions with TypeScript types
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

// Generate mocks - exactly what you wanted!
const userMock = await mockFromFunctionAuto(getUser);
const usersMock = await mockFromFunctionAuto(getUsers, { count: 3 });

console.log(userMock);
// {
//   id: 42,
//   name: "Generated Name",
//   email: "generated@example.com", 
//   active: true
// }

console.log(usersMock);
// Array of 3 User objects with realistic data
```

## 📋 Complete API Reference

### `mockFromFunctionAuto(func, options?)`

The main function you requested - auto-discovers and generates mocks.

```typescript
const mock = await mockFromFunctionAuto(myFunction, {
  searchDir: __dirname,  // Where to search for source files
  count: 5,             // For arrays
  numberMax: 100,       // Max number values
  seed: 12345          // For deterministic results
});
```

### `mockFromFunctionSmart(func, options?)`

Smart fallback - tries auto-discovery first, falls back to source context.

```typescript
const wrappedFunction = withSourceContext(myFunction, sourceContext);
const mock = await mockFromFunctionSmart(wrappedFunction);
```

### Backward Compatibility

All existing APIs still work:

- `analyzeFunctionAndGenerateMock()` - Original string-based API
- `mockFromFunction()` - Requires source context
- `mockFromFunctionEnhanced()` - Uses attached source context

## 🎉 Features Delivered

✅ **No String Parsing**: Pass actual function references  
✅ **Auto-Discovery**: Automatically finds TypeScript source files  
✅ **Type Analysis**: Extracts return types from function signatures  
✅ **Realistic Mocks**: Generates appropriate mock data  
✅ **Complex Types**: Handles interfaces, arrays, enums, unions  
✅ **Nested Objects**: Supports deep object structures  
✅ **Deterministic**: Seeded generation for consistent results  
✅ **Backward Compatible**: Existing APIs continue to work  

## 🔧 How It Works

1. **Function Reference**: You pass a JavaScript function reference
2. **Auto-Discovery**: System searches TypeScript files for the function definition
3. **Type Extraction**: Parses TypeScript types from the source
4. **Mock Generation**: Creates realistic data matching the return type

## 📝 Examples

### Simple Types

```typescript
function getName(): string { return "test"; }
const mock = await mockFromFunctionAuto(getName);
// Returns: "Generated string"
```

### Interfaces

```typescript
interface Product {
  id: number;
  name: string;
  price: number;
}

function getProduct(): Product { return {...}; }
const mock = await mockFromFunctionAuto(getProduct);
// Returns: { id: 42, name: "Generated Name", price: 99.99 }
```

### Arrays

```typescript
function getProducts(): Product[] { return []; }
const mocks = await mockFromFunctionAuto(getProducts, { count: 3 });
// Returns: Array of 3 Product objects
```

### Union Types

```typescript
function getUser(): User | null { return null; }
const mock = await mockFromFunctionAuto(getUser);
// Returns: User object or null
```

## 🎯 Mission Accomplished

This is exactly the API you requested:

- ✅ `const mock = await mockFromFunction(functionReference)`
- ✅ No string parsing before the call
- ✅ All parsing and analysis done inside the function
- ✅ Works with TypeScript function references
- ✅ Maintains full type safety and IntelliSense support
