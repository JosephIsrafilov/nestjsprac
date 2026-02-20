import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { CurrentUserType } from './types/current-user.type';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
