// Example TypeScript file for testing function analysis with imports

import { User } from './example-types';

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  totalPages: number;
  totalItems: number;
}

// Function with imported type
export function getUser(id: number): User {
  return {
    id,
    name: 'John Doe',
    email: 'john@example.com',
    age: 30,
    isActive: true
  };
}

// Function with generic interface
export function getUserResponse(id: number): ApiResponse<User> {
  return {
    data: getUser(id),
    status: 200,
    message: 'Success',
    timestamp: new Date()
  };
}

// Function with array return type
export function getAllUsers(): User[] {
  return [getUser(1), getUser(2)];
}

// Function with paginated response
export function getPaginatedUsers(page: number = 1): PaginatedResponse<User> {
  return {
    data: getAllUsers(),
    status: 200,
    message: 'Success',
    timestamp: new Date(),
    page,
    totalPages: 5,
    totalItems: 50
  };
}

// Arrow function
export const getActiveUsers = (): User[] => {
  return getAllUsers().filter(user => user.isActive);
};

// Function with primitive return type
export function getUserCount(): number {
  return 100;
}

// Function with boolean return type  
export function isUserActive(userId: number): boolean {
  return true;
}

// Async function
export async function fetchUser(id: number): Promise<User> {
  return getUser(id);
}

// Class method
export class UserService {
  getUser(id: number): User {
    return {
      id,
      name: 'Service User',
      email: 'service@example.com',
      age: 25,
      isActive: true
    };
  }
  
  async fetchUserAsync(id: number): Promise<ApiResponse<User>> {
    return getUserResponse(id);
  }
}
