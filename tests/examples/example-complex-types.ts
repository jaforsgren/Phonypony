// conditional type with type inference
type Box<T> = {
    value: T;
  }; // boxes a type

type BoxedString = Box<string>;  // { value: string }
type BoxedNumber = Box<number>;  // { value: number }

type Unbox<T> = T extends Box<infer Inner> ? Inner : T;

type Name = Unbox<Box<string>>;     // string
type Age = Unbox<Box<number>>;      // number
type RawBoolean = Unbox<boolean>;   // boolean (not a Box, stays the same)

// regular types
export const AuthenticationRoleConst = {
    ADMIN: "ADMIN",
    SUPERVISOR: "SUPERVISOR",
    CONSULTANT_MANAGER: "CONSULTANT_MANAGER",
    STAFF: "STAFF"
} as const;

export type AuthenticationRole = (typeof AuthenticationRoleConst)[keyof typeof AuthenticationRoleConst];

export type UserRole = keyof typeof AuthenticationRoleConst
export type UserRolesArray = (typeof AuthenticationRoleConst)[UserRole][]
export const UserRoles = Object.values(AuthenticationRoleConst)

interface IUserDTO2 {
    id: string
    email: string
    role: UserRole
    cognitoId: string
}

export type UserDTO = {
    id: string
    email: string
    role: UserRole
    cognitoId: string
}