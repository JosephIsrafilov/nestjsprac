import { User } from '@prisma/client';
import type { UserRole } from '../common/constants';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './users.dto';
type PublicUser = {
    id: number;
    name: string;
    email: string;
    role: UserRole;
};
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateUserDto): Promise<PublicUser>;
    findAll(): Promise<PublicUser[]>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: number): Promise<User | null>;
    private mapToPublicUser;
}
export {};
