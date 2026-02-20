import type { UserRole } from '../common/constants';
export declare class CreateUserDto {
    name: string;
    email: string;
    password: string;
    role: UserRole;
}
