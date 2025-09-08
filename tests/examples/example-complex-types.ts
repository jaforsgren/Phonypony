// import { Insertable, Selectable } from 'kysely'
// import { AuthenticationRole, StaffType, User } from '../../../../@types/database/db.types'

// kysely type


// export type SelectType<T> = T extends ColumnType<infer S, any, any> ? S : T;
// export type InsertType<T> = T extends ColumnType<any, infer I, any> ? I : T;
// export type UpdateType<T> = T extends ColumnType<any, any, infer U> ? U : T;

// export type ColumnType<SelectType, InsertType = SelectType, UpdateType = SelectType> = {
//     readonly __select__: SelectType;
//     readonly __insert__: InsertType;
//     readonly __update__: UpdateType;
// };


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

// export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
//   ? ColumnType<S, I | undefined, U>
//   : ColumnType<T, T | undefined, T>;


// export type User = {
//     id: Generated<string>;
//     email: string;
//     cognito_id: string;
//     role: Generated<AuthenticationRole>;
//     fcm_tokens: Generated<string[]>;
//     active_notification: Generated<boolean>;
// };

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

// export type UserWithRelationsDTO = {
//     id: string
//     email: string
//     role: UserRole
//     cognitoId: string
//     officeStaffId: string | null
//     staffId: number | null
//     staffType: StaffType | null
// }

// export type UserWithRelationsSelectable = Selectable<User> & {
//     office_staff_id: string | null
//     staff_id: number | null
//     staff_type: StaffType | null
// }

// export type SelectableUser = Selectable<User>
// export type InsertableUser = Insertable<Omit<User, 'id'>>
