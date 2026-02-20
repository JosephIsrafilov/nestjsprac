import type { CurrentUserType } from '../auth/types/current-user.type';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(dto: CreateUserDto, currentUser: CurrentUserType): Promise<{
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
