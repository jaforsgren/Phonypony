export interface ImportedUser {
  id: string;
  name: string;
}

export type ImportedRole = 'admin' | 'user';

export enum ImportedStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}


