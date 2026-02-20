import { AuthService } from './auth.service';
import { LoginDto } from './auth.dto';
import type { CurrentUser } from './auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
