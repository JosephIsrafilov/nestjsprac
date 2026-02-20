import { User, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateUserDto): Promise<{
        id: number;
        name: string;
        email: string;
        role: UserRole;
    }>;
    findAll(): Promise<Array<{
        id: number;
        name: string;
        email: string;
        role: UserRole;
    }>>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: number): Promise<User | null>;
    private toPublicUser;
    private isPrismaUniqueError;
}
