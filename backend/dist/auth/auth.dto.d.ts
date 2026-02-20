import type { UserRole } from '../common/constants';
export declare class LoginDto {
    email: string;
    password: string;
}
export type CurrentUser = {
    id: number;
    email: string;
    role: UserRole;
};
