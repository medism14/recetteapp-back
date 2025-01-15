import { Controller, Get, Param, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { IUser } from '../../interfaces/user.interface';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUser(@Req() req: Request) {
    return req.user;
  }

  @Get('email/:email')
  async getUserByEmail(@Param('email') email: string): Promise<IUser> {
    return this.usersService.getUserByEmail(email);
  }
}