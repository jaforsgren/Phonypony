import { 
  generateFromSource,
  mockFromSource,
  analyzeFunction,
  generateFromFunction,
  generateFromFunctionEnhanced,
  generateFromFunctionAuto,
  generateFromFunctionSmart,
  parseDefinitions,
  createWithSourceContext
} from '../src/api';
import * as fs from 'fs';
import * as path from 'path';

describe('Public API', () => {
  const examplePath = path.resolve(__dirname, 'examples/example-types.ts');
  const source = fs.readFileSync(examplePath, 'utf-8');

  it('generateFromSource returns GeneratedData[] for example types', async () => {
    const result = await generateFromSource(source, { count: 2, numberMax: 100, seed: 123 });

    // Should include key interfaces
    const names = result.map(r => r.name).sort();
    expect(names).toEqual(expect.arrayContaining([
      'Pony',
      'PonyProfile',
      'Product',
      'Category',
      'Review',
      'Order',
      'Address'
    ]));

    // Each entry should have the requested count
    for (const item of result) {
      expect(Array.isArray(item.data)).toBe(true);
      expect(item.data).toHaveLength(2);
    }

    // Spot-check structure of a few types
    const pony = result.find(r => r.name === 'Pony')!;
    expect(pony.data[0]).toHaveProperty('id');
    expect(pony.data[0]).toHaveProperty('name');
    expect(pony.data[0]).toHaveProperty('email');
    expect(pony.data[0]).toHaveProperty('isActive');
    expect(pony.data[0]).toHaveProperty('createdAt');
    expect(pony.data[0]).toHaveProperty('tags');
    expect(pony.data[0]).toHaveProperty('profile');

    const product = result.find(r => r.name === 'Product')!;
    expect(product.data[0]).toHaveProperty('id');
    expect(product.data[0]).toHaveProperty('title');
    expect(product.data[0]).toHaveProperty('description');
    expect(product.data[0]).toHaveProperty('price');
    expect(product.data[0]).toHaveProperty('inStock');
    expect(product.data[0]).toHaveProperty('category');
    expect(product.data[0]).toHaveProperty('reviews');
  });

  it('mockFromSource returns a name->data map', async () => {
    const map = await mockFromSource(examplePath, { count: 3, numberMax: 50, seed: 42 });

    expect(Object.keys(map)).toEqual(expect.arrayContaining([
      'Pony', 'PonyProfile', 'Product', 'Category', 'Review', 'Order', 'Address'
    ]));

    expect(Array.isArray(map.Pony)).toBe(true);
    expect(map.Pony).toHaveLength(3);

    const order = map.Order[0];
    expect(order).toHaveProperty('id');
    expect(order).toHaveProperty('ponyId');
    expect(order).toHaveProperty('products');
    expect(order).toHaveProperty('total');
    expect(order).toHaveProperty('status');
    expect(order).toHaveProperty('createdAt');
    expect(order).toHaveProperty('shippingAddress');
  });

  it('analyzeFunction works with file path and baseDir', async () => {
    const functionsPath = path.resolve(__dirname, 'examples', 'example-functions.ts');
    const baseDir = path.dirname(functionsPath);
    const result = await analyzeFunction(functionsPath, 'getUserCount', { baseDir });
    expect(result.returnType).toBeDefined();
    expect(typeof result.mockData).toBe('number');
  });

  it('generateFromFunctionEnhanced works with wrapped function', async () => {
    function getProduct() { return {}; }
    const wrapped = createWithSourceContext(getProduct, `
      interface Product { id: number; title: string; price: number; }
      function getProduct(): Product { return { id: 1, title: 't', price: 1 }; }
    `);
    const data = await generateFromFunctionEnhanced(wrapped, { count: 1 });
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('title');
    expect(data).toHaveProperty('price');
  });

  it('generateFromFunctionAuto discovers source by function name', async () => {
    function getUserCount() { return 0; }
    const searchDir = path.resolve(__dirname, 'examples');
    const data = await generateFromFunctionAuto(getUserCount, { searchDir, count: 1 });
    expect(typeof data).toBe('number');
  });

  it('generateFromFunctionSmart uses source context fallback', async () => {
    function getUserById(id: number) { return null; }
    const wrapped = createWithSourceContext(getUserById, `
      interface User { id: number; name: string; email: string; }
      function getUserById(id: number): User | null { return { id, name: 'n', email: 'e' }; }
    `);
    const data = await generateFromFunctionSmart(wrapped, { count: 1, searchDir: path.resolve(__dirname, 'not-real') });
    if (Array.isArray(data)) {
      expect(data[0]).toHaveProperty('id');
      expect(data[0]).toHaveProperty('name');
      expect(data[0]).toHaveProperty('email');
    } else if (data) {
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('email');
    }
  });

  it('parseDefinitions parses interfaces from source', async () => {
    const parsed = await parseDefinitions(source);
    const names = parsed.interfaces.map(i => i.name);
    expect(names).toEqual(expect.arrayContaining(['Pony', 'Product', 'Order']));
  });
});
it('mockFromSource works with complex types', async () => {
  const map = await mockFromSource('/Users/johanforsgren/DEV/PERSONAL/phonypony/tests/examples/example-complex-types.ts', { count: 3, numberMax: 50, seed: 42 });

  // Union types
  expect(Object.values(map['IUserDTO2'][0])).toEqual(expect.arrayContaining([
    'revolutionize scalable models', 'Mariela.Stamm@hotmail.com', 'SUPERVISOR', 'synthesize bricks-and-clicks solutions'
  ]));

  const order = map.IUserDTO2[0];
  expect(order).toHaveProperty('id');
  expect(order).toHaveProperty('email');
  expect(order).toHaveProperty('role');
  expect(order).toHaveProperty('cognitoId');

  // Primitive aliases resolved via Unbox
  expect(Object.keys(map)).toEqual(expect.arrayContaining(['IUserDTO2', 'Name', 'Age', 'RawBoolean']));
  expect(Array.isArray(map.Name)).toBe(true);
  expect(typeof map.Name[0]).toBe('string');
  expect(typeof map.Age[0]).toBe('number');
  expect(typeof map.RawBoolean[0]).toBe('boolean');
});

it('parseDefinitions extracts enums from const objects and aliases', async () => {
  const complexPath = path.resolve(__dirname, 'examples/example-complex-types.ts');
  const complexSource = fs.readFileSync(complexPath, 'utf-8');
  const parsed = await parseDefinitions(complexSource);

  const enumNames = parsed.enums.map(e => e.name);
  expect(enumNames).toEqual(expect.arrayContaining([
    'AuthenticationRoleConst',
    'UserRole',
    'AuthenticationRole'
  ]));

  const authConst = parsed.enums.find(e => e.name === 'AuthenticationRoleConst')!;
  const values = authConst.members.map(m => m.value);
  expect(values).toEqual(expect.arrayContaining(['ADMIN', 'SUPERVISOR', 'CONSULTANT_MANAGER', 'STAFF']));
});

it('generateFromFunctionEnhanced resolves conditional/generic aliases (Box/Unbox)', async () => {
  function getValue() { return '' as any; }
  const wrapped = createWithSourceContext(getValue, `
    type Box<T> = { value: T };
    type Unbox<T> = T extends Box<infer Inner> ? Inner : T;
    type Name = Unbox<Box<string>>;
    function getValue(): Name { return 'ok'; }
  `);
  const data = await generateFromFunctionEnhanced(wrapped, { count: 1 });
  expect(typeof data).toBe('string');
});





