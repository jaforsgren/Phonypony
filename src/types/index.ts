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

export interface TypeDefinition {
  name: string;
  type: string;
  kind: 'interface' | 'type';
}

export interface ParsedDefinitions {
  interfaces: InterfaceDefinition[];
  types: TypeDefinition[];
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
}
