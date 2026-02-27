import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../users/services/users.service';
import { LoginDto } from '../dto/login.dto';
import type { CurrentUserType } from '../types/current-user.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.usersService.findByEmail(dto.email);
    this.assertCredentialsUserExists(user);

    const validPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!validPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async me(currentUser: CurrentUserType): Promise<{
    id: number;
    name: string;
    email: string;
    role: UserRole;
    createdAt: Date;
  }> {
    const user = await this.usersService.findById(currentUser.id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  private assertCredentialsUserExists(
    user: Awaited<ReturnType<UsersService['findByEmail']>>,
  ): asserts user is NonNullable<
    Awaited<ReturnType<UsersService['findByEmail']>>
  > {
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
  }
}
