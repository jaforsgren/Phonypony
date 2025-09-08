export enum MemberType {
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
  DATE = "Date",
}

export interface InterfaceMember {
  name: string;
  type: string;
}

export interface InterfaceDefinition {
  name: string;
  members: InterfaceMember[];
}

export interface EnumMember {
  name: string;
  value: string | number;
}

export interface EnumDefinition {
  name: string;
  members: EnumMember[];
}
export interface TypeDefinition {
  name: string;
  type: string;
  kind: 'type' | 'interface' | 'enum';
  unionTypes?: string[];
}

export interface ParsedDefinitions {
  interfaces: InterfaceDefinition[];
  types: TypeDefinition[];
  enums: EnumDefinition[];
}

export interface GenerationOptions {
  count: number;
  numberMax: number;
  seed?: number;
}

export interface GeneratedData {
  name: string;
  data: any[];
}

export interface FakerUtilMethods {
  string: () => string;
  text: () => string;
  number: (options?: { max?: number }) => number;
  boolean: () => boolean;
  datetime: () => Date;
  userName: () => string;
  firstName: () => string;
  lastName: () => string;
  fullName: () => string;
  price: () => string;
  sentence: () => string;
  phoneNumber: () => string;
  country: () => string;
  address: () => string;
  city: () => string;
  url: () => string;
  email: () => string;
  zipCode: () => string;
  state: () => string;
  title: () => string;
  uuid: () => string;
}
