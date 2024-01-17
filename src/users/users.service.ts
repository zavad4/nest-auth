// users.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, User as PrismaUser } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/utils/email.service';

export type User = PrismaUser;

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async findOne(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createUser(data: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      const exception = existingUser.isEmailConfirmed
        ? new ConflictException('User with this email already exists')
        : new ConflictException('Please, confirm your email');
      throw exception;
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    const payload = { sub: user.id, email: user.email };
    const confirmationToken = await this.jwtService.signAsync(payload);
    console.log(confirmationToken);

    const text =
      await this.emailService.getConfirmationLetter(confirmationToken);
    await this.emailService.sendEmail({
      to: user.email,
      subject: 'Confirmation letter from nest-auth',
      text,
    });

    return this.dumpUser(user);
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }

  async getDumpedUser(userWhereUniqueInput: Prisma.UserWhereUniqueInput) {
    return this.dumpUser(
      await this.prisma.user.findUnique({
        where: userWhereUniqueInput,
      }),
    );
  }

  private dumpUser(data) {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
    };
  }

  async verifyEmailToken(token: string) {
    try {
      const decodedToken = await this.jwtService.verifyAsync(token);
      return decodedToken;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid token');
    }
  }

  async confirmEmail(id: number) {
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { isEmailConfirmed: true },
    });
    const payload = { id: updatedUser.id, email: updatedUser.email };
    const access_token = await this.jwtService.signAsync(payload);
    console.log(access_token);
    return access_token;
  }
}
