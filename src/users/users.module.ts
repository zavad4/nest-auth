import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma.service';
import { UsersController } from './users.controller';
import { EmailService } from 'src/utils/email.service';

@Module({
  providers: [UsersService, PrismaService, EmailService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
