import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { CurrentUserType } from '../auth/types/current-user.type';
import { USER_ROLE } from '../common/constants';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(
    @Body() dto: CreateUserDto,
    @CurrentUser() currentUser: CurrentUserType,
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
