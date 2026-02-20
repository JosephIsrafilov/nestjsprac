import { UserRole } from '@prisma/client';
export type CurrentUserType = {
    id: number;
    email: string;
    role: UserRole;
};
