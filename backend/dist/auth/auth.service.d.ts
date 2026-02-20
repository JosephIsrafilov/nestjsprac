import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CurrentUser, LoginDto } from './auth.dto';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    login(dto: LoginDto): Promise<{
        access_token: string;
    }>;
    me(currentUser: CurrentUser): Promise<{
        id: number;
        name: string;
        email: string;
        role: string;
    }>;
}
