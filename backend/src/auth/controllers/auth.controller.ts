import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../decorators/current-user.decorator';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AuthService } from '../services/auth.service';
import type { CurrentUserType } from '../types/current-user.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto): Promise<{ access_token: string }> {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() currentUser: CurrentUserType) {
    return this.authService.me(currentUser);
  }
}
