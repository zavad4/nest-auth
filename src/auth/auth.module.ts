import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { PrismaService } from 'src/prisma.service';
import config from 'src/config';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: config.jwt.secret,
      signOptions: { expiresIn: config.jwt.expiresIn },
    }),
  ],
  providers: [
    AuthService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
