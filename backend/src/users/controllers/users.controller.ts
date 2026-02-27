import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import type { CurrentUserType } from '../../auth/types/current-user.type';
import { CreateUserDto } from '../dto/create-user.dto';
import { UsersService } from '../services/users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  list() {
    return this.usersService.findAll();
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin)
  remove(
    @Param('id', ParseIntPipe) userId: number,
    @CurrentUser() currentUser: CurrentUserType,
  ) {
    return this.usersService.remove(userId, currentUser.id);
  }
}
