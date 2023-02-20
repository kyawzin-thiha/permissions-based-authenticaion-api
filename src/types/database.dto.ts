import {Account, User, Role, Permission} from "@prisma/client"

export type AccountDto = Account | null;
export type AccountWithUserDto = Account & {user: User} | null;
export type AccountWithUserAndsRoleDto = Account & { user: User & { role: Role } } | null;

export type UserDto = User | null;
export type UserWithRoleDto = User & { role: Role } | null;

export type RoleDto = Role | null;
export type RoleWithPermissionDto = Role & { permission: Permission } | null;
export type RolesWithPermissionDto = (Role & { permission: Permission })[] | null;