import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SkipAuth } from 'src/setMetaData';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @HttpCode(HttpStatus.OK)
  @SkipAuth()
  @Post()
  @UsePipes(new ValidationPipe())
  signUp(@Body() signInDto: CreateUserDto) {
    return this.userService.createUser(signInDto);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return this.userService.getUser({ email: req.user?.email });
  }
}
