import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  UnauthorizedException,
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

  @SkipAuth()
  @Get('confirm-email/:token')
  async confirmEmail(@Param('token') token: string) {
    try {
      const decodedToken = await this.userService.verifyEmailToken(token);
      console.log(decodedToken);
      const access_token = await this.userService.confirmEmail(
        decodedToken.sub,
      );
      return { access_token };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new BadRequestException('Failed to confirm email');
    }
  }

  @Get('profile')
  getProfile(@Request() req) {
    return this.userService.getDumpedUser({ email: req.user?.email });
  }
}
