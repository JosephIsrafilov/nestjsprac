import { UserRole } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(dto: CreateUserDto): Promise<{
        id: number;
        name: string;
        email: string;
        role: UserRole;
    }>;
    list(): Promise<{
        id: number;
        name: string;
        email: string;
        role: UserRole;
    }[]>;
}
