import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUserData } from '../auth/current-user.decorator';
import type { CurrentUser } from '../auth/auth.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { USER_ROLE } from '../common/constants';
import { CreateUserDto } from './users.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(
    @Body() dto: CreateUserDto,
    @CurrentUserData() currentUser: CurrentUser,
  ) {
    if (currentUser.role !== USER_ROLE.admin) {
      throw new ForbiddenException('Only admin can create users');
    }

    return this.usersService.create(dto);
  }

  @Get()
  list() {
    return this.usersService.findAll();
  }
}
