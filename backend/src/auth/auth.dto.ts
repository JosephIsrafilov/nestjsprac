import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import type { UserRole } from '../common/constants';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export type CurrentUser = {
  id: number;
  email: string;
  role: UserRole;
};
