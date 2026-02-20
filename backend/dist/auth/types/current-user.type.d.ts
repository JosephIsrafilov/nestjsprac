import type { UserRole } from '../../common/constants';
export type CurrentUserType = {
    id: number;
    email: string;
    role: UserRole;
};
