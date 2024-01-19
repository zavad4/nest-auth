import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User as PrismaUser } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../utils/email.service';

export type User = PrismaUser;

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  private readonly logger = new Logger(UsersService.name);

  async findOne(userWhereUniqueInput: Prisma.UserWhereUniqueInput) {
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
        ? 'User with this email already exists'
        : 'Please, confirm your email';
      throw new HttpException(exception, HttpStatus.BAD_REQUEST);
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
  }) {
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
      return await this.confirmEmail(decodedToken.sub);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Failed to confirm email');
    }
  }

  async confirmEmail(id: number) {
    const user = await this.findOne({ id });
    await this.prisma.user.update({
      where: { id: user.id },
      data: { isEmailConfirmed: true },
    });

    return 'Email was successfully confirmed.';
  }
}
