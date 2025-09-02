# 🌟 PhonyPony 🐴✨

*A TypeScript tool for generating p(h)ony data from TypeScript interfaces using Faker.js.*

🎠 **The most mane-ificent mock data generator in the world** 🎠

## ✨ Features ✨

- 🎯 **Generate mock data directly from TypeScript interface definitions**
- 🔧 **Configurable data generation**  
- 💾 **Multiple output formats**
- 🎨 **Rich type support including enums**
- 🚀 **CLI interface and Programmatic API**
= 🌱 **Deterministic seeded generation**
- 🎪 **Self-referencing interface support**
- 🎯 **Full enum support (string, numeric, auto-increment)**

## 🏇 Installation 🏇

Ready to join the PhonyPony ranch?

```bash
# for adventurous cowboys and girls
npm install -g phonypony
```

Or wrangle it locally in your project:

```bash
# Local instable-llation
npm install phonypony
```

## 🌈 Usage 🌈

### 🎠 CLI Usage  🎠

```bash
# Generate mock data from a TypeScript file 
phonypony ./types.ts

# Generate 10 instances per interface with max number value of 50
phonypony ./types.ts 10 50

# Save output to a JSON file
phonypony ./types.ts 5 100 --output data.json
phonypony ./types.ts 5 100 -o data.json

# Use a custom seed for deterministic results
phonypony ./types.ts 3 50 --seed 42
phonypony ./types.ts 3 50 -s 42

# Combine options
phonypony ./types.ts 5 100 --seed 12345 --output reproducible-data.json

# When you need guidance from the wise stable master
phonypony --help
```

### 🎪 CLI Options 🎪

```text
Usage: phonypony <typescript-file> [count] [numberMax] [options]

Arguments:
  typescript-file    Path to the TypeScript file containing interfaces
  count             Number of instances to generate per interface (default: 1)
  numberMax         Maximum value for generated numbers (default: 100)

Options:
  -o, --output <file>  Save output to a JSON file instead of printing to console
  -s, --seed <number>  Set a custom seed for deterministic generation (default: 12345)
  -h, --help          Show help message
```

### 💻 Programmatic API (Types, Functions, Runtime) 💻

```typescript
import {
  // Source-based (types/interfaces)
  generateFromSource,
  mockFromSource, // name -> data[] map

  // Runtime function analysis
  mockFromFunction,
  generateFromFunctionEnhanced,
  generateFromFunctionAuto,
  generateFromFunctionSmart,
  createWithSourceContext,

  // Low-level
  analyzeFunctionAndGenerateMock,
  parseDefinitions,
  DEFAULT_OPTIONS
} from 'phonypony';

// 1) Generate from TypeScript source (interfaces/types)
const source = `
  interface Pony { id: number; name: string; email: string }
  interface Product { id: number; title: string; price: number }
`;

const list = await generateFromSource(source, { count: 2, seed: 42 });
// list: Array<{ name: string; data: any[] }>

const map = await mockFromSource(source, { count: 2, seed: 42 });
// map: { Pony: any[]; Product: any[] }

const examplePath = path.resolve(__dirname, 'examples/example-types.ts');
const map = await mockFromSource(examplePath, { count: 3, numberMax: 50, seed: 42 });
// map: { Pony: any[]; Product: any[] }

// 2) Runtime: generate from actual JS functions
function getUser() {
  return { id: 1, name: 'John', email: 'john@example.com' };
}

const withCtx = createWithSourceContext(
  getUser,
  `
    interface User { id: number; name: string; email: string }
    function getUser(): User { return { id: 1, name: 'John', email: 'john@example.com' } }
  `
);

const mock1 = await generateFromFunctionEnhanced(withCtx);

// Auto-discovery (finds function definition in your TS files by name)
const mock2 = await generateFromFunctionAuto(getUser, { searchDir: process.cwd(), count: 1 });

// Smart: try auto first, then fall back to provided source context
const mock3 = await generateFromFunctionSmart(withCtx, { searchDir: process.cwd(), count: 1 });

// 3) Low-level (analyze a function from source text or file path)
const res = await analyzeFunctionAndGenerateMock(source, 'getUser', DEFAULT_OPTIONS);
// res.returnType, res.mockData, res.imports

// 4) Parse only types
const defs = await parseDefinitions(source);
// defs.interfaces, defs.types, defs.enums

```

### 🌟 Supported Function Types 🌟

- ✅ Regular functions (`function getName(): string`)
- ✅ Arrow functions (`const getName = (): string => {}`)
- ✅ Class methods (`class User { getName(): string {} }`)
- ✅ Functions with primitive return types (`string`, `number`, `boolean`)
- ✅ Functions returning arrays (`string[]`, `User[]`)
- ✅ Functions returning interfaces and types
- ✅ Functions with enum return types
- ✅ Auto-detection when function name not specified
- ✅ Import resolution for external types (coming soon!)

## 🎭 Stable Commands 🎭

### ✨ `generateMockData(source, options?)` ✨

**Parameters:**

- `source` (string): TypeScript source code containing interface definitions
- `options` (object, optional): Generation options

  - `count` (number): Number of instances to generate per interface (default: 1)
  - `numberMax` (number): Maximum value for generated numbers (default: 100)
  - `seed` (number): Seed for deterministic generation (default: 12345)

**Returns:** Promise<GeneratedData[]>

### 🎪 `generateAndSaveMockData(source, options?, outputPath?)` 🎪

*Generate and corral your data into a cozy JSON stable*

**Parameters:**

- `source` (string): TypeScript source code containing interface definitions
- `options` (object, optional): Generation options (same as above)
- `outputPath` (string, optional): File path to save the generated data

**Returns:** Promise<GeneratedData[]>

### 🌟 Supported Types 🌟

*PhonyPony speaks fluent TypeScript and understands all these magnificent types:*

- 🔤 `string`
- 🔢 `number`
- ✅ `boolean`
- 🎯 `enum`
- 📋 Array types (e.g., `string[]`, `number[]`, `Status[]`)
- 🏗️ Nested interfaces
- 🔗 Custom interface references

### 🎯 Enum Support - Choose Your Destiny 🎯

```typescript
enum PonyRole {
  admin = "admin",
  pony = "pony", 
  moderator = "moderator"
}

enum Priority {
  low = 1,
  medium = 2,
  high = 3
}

enum Size {
  small,    // 0
  medium,   // 1
  large     // 2
}

interface Pony {
  id: number;
  name: string;
  role: PonyRole;      // Will generate: "admin", "pony", or "moderator"
  priority: Priority;  // Will generate: 1, 2, or 3
  size: Size;         // Will generate: 0, 1, or 2
}
```

*Example generated output:*

```json
{
  "Pony": [
    {
      "id": 42,
      "name": "John Doe",
      "role": "admin",
      "priority": 2,
      "size": 1
    }
  ]
}
```

### 🎯The Magic of Reproducible Ponies (Deterministic Generation) 🎯

*One of PhonyPony's most magical features is its ability to generate **exactly the same data** every time with seeded generation*

🌱 Every run uses seed `12345` by default, your data will be identical across runs
🎲 Use `--seed` flag or `seed` option for different but reproducible datasets
🧬 Each instance gets a unique seed based on interface index and instance index
🔄 Same seed + same options = identical output every single time
🏰 Even deeply nested objects and arrays maintain deterministic behavior
🌊 Handles circular references with smart recursion depth limiting

*This means you can:*

- ✅ **Share exact datasets** with your team
- ✅ **Create predictable test fixtures**
- ✅ **Debug with consistent data**
- ✅ **Version control your mock data scenarios**
- ✅ **Generate different datasets** by simply changing the seed

```typescript
// These will produce identical results
const data1 = await generateMockData(source, { count: 3, seed: 42 });
const data2 = await generateMockData(source, { count: 3, seed: 42 });
// data1 === data2

// Different seeds produce different data
const dataA = await generateMockData(source, { count: 3, seed: 100 });
const dataB = await generateMockData(source, { count: 3, seed: 200 });
// dataA !== dataB, but both are reproducible
```

---

*Made with 💖 and a whole lot of pony magic by the PhonyPony dreamteam*  
*Remember: In a world full of fake news, be someone's PhonyPony 🌈🐴✨*
