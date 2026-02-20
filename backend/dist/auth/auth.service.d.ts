import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CurrentUserType } from './types/current-user.type';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    login(dto: LoginDto): Promise<{
        access_token: string;
    }>;
    me(currentUser: CurrentUserType): Promise<{
        id: number;
        name: string;
        email: string;
        role: string;
    }>;
}
