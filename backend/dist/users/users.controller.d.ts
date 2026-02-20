import type { CurrentUser } from '../auth/auth.dto';
import { CreateUserDto } from './users.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(dto: CreateUserDto, currentUser: CurrentUser): Promise<{
        id: number;
        name: string;
        email: string;
        role: import("../common/constants").UserRole;
    }>;
    list(): Promise<{
        id: number;
        name: string;
        email: string;
        role: import("../common/constants").UserRole;
    }[]>;
}
