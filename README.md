# 🌟 PhonyPony 🐴✨

*A TypeScript tool for generating p(h)ony data from TypeScript interfaces using Faker.js.*

🎠 **Saddle up for the most mane-ificent mock data generator in the stable** 🎠

## ✨ Features ✨

- 🎯 **Generate mock data directly from TypeScript interface definitions**
- 🔧 **Configurable data generation**  
- 💾 **Multiple output formats**
- 🎨 **Rich type support including enums**
- 🚀 **CLI interface and Programmatic API**
- 🧪 **Comprehensive test coverage**
- 🌱 **Deterministic seeded generation**
- 🎪 **Self-referencing interface support**
- 🎯 **Full enum support (string, numeric, auto-increment)**

## 🏇 Installation 🏇

Ready to join the PhonyPony ranch?

```bash
# Global installation - for adventurous cowboys and cowgirls
npm install -g phonypony
```

Or wrangle it locally in your project:

```bash
# Local installation - perfect for your own stable
npm install phonypony
```

## 🌈 Usage 🌈

### 🎠 CLI Usage - Ride Like the Wind 🎠

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

### 🦄 Example TypeScript Interfaces 🦄

Some majestic interface specimens from our TypeScript stable:*

```typescript
interface Horse {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  tags: string[];
  status: Status;
}

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: Category;
  priority: Priority;
}

interface Category {
  id: number;
  name: string;
}

// Enums are fully supported! 🎯
enum Status {
  active = "active",
  inactive = "inactive",
  pending = "pending"
}

enum Priority {
  low = 1,
  medium = 2,
  high = 3
}
```

### 💻 Programmatic Usage 💻

```typescript
import { generateMockData, generateAndSaveMockData } from 'phonypony';

const typeScriptCode = `
  enum Status {
    active = "active",
    inactive = "inactive"
  }

  interface Horse {
    id: number;
    name: string;
    email: string;
    status: Status;
  }
`;

// Generate mock data in memory
const options = { count: 5, numberMax: 100, seed: 12345 };
const mockData = await generateMockData(typeScriptCode, options);
console.log(mockData);

// Generate and save to file
await generateAndSaveMockData(typeScriptCode, options, './output.json');

// Use different seeds for different datasets
const dataset1 = await generateMockData(typeScriptCode, { count: 3, numberMax: 50, seed: 42 });
const dataset2 = await generateMockData(typeScriptCode, { count: 3, numberMax: 50, seed: 100 });
// dataset1 and dataset2 will have different but reproducible data
```

## 🎭 Royal Stable Commands 🎭

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
// String enums - for when your data needs personality
enum PonyRole {
  admin = "admin",
  pony = "pony", 
  moderator = "moderator"
}

// Numeric enums - for when numbers tell the story
enum Priority {
  low = 1,
  medium = 2,
  high = 3
}

// Auto-increment enums - let TypeScript decide
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

### 🎯 Deterministic Generation - The Magic of Reproducible Ponies 🎯

*One of PhonyPony's most magical features is its ability to generate **exactly the same data** every time with seeded generation*

🌱 Every run uses seed `12345` by default - your data will be identical across runs
🎲 Use `--seed` flag or `seed` option for different but perfectly reproducible datasets
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

## 🛠️ Development - Join the Pony Dev Ranch 🛠️

### 🏗️ Project Structure - The PhonyPony Ranch Layout 🏗️

*Here's how our beautiful stable is organized:*

```text
src/
├── index.ts              # CLI entry point - The main gate to our ranch
├── lib.ts                # Library exports - The trading post
├── types/
│   └── index.ts          # Type definitions - The pony breed registry
└── lib/
    ├── faker-util.ts     # Faker.js utilities - The magic feed
    ├── mock-generator.ts # Core mock generation logic - The pony training ground
    ├── mock-data-service.ts # Main service - The stable master
    └── typescript-parser.ts # TypeScript AST parsing - The pony whisperer
tests/
├── mock-generator.test.ts        # Testing the training ground
├── typescript-parser.test.ts     # Testing the whisperer
├── mock-data-service.test.ts     # Testing the stable master
└── deterministic-generation.test.ts # Testing our magical reproducibility
```

---

*Made with 💖 and a whole lot of pony magic by the PhonyPony dreamteam*  
*Remember: In a world full of fake news, be someone's PhonyPony 🌈🐴✨*
