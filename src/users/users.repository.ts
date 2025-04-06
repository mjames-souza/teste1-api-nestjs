import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, ILike, Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserRole } from './user-roles.enum';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { CredentialsDto } from 'src/auth/dto/credentials.dto';
import { FindUsersQueryDto } from './dto/find-users-query.dto';

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async createUser(
    createUserDto: CreateUserDto,
    role: UserRole,
  ): Promise<UserResponseDto> {
    const { email, name, password } = createUserDto;

    const user = this.create({
      email,
      name,
      role,
      status: true,
      confirmationToken: crypto.randomBytes(32).toString('hex'),
    });

    user.salt = await bcrypt.genSalt();
    user.password = await this.hashPassword(password, user.salt);

    try {
      const savedUser = await this.save(user);

      return new UserResponseDto({
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role as UserRole,
        status: savedUser.status,
        createdAt: savedUser.createdAt,
        updatedAt: savedUser.updatedAt,
      });
    } catch (error: any) {
      if (error.code?.toString() === '23505') {
        throw new ConflictException('Endereço de email já está em uso');
      }
      throw new InternalServerErrorException(
        'Erro ao salvar o usuário no banco de dados',
      );
    }
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }
  async checkCredentials(credentialsDto: CredentialsDto): Promise<User | null> {
    const { email, password } = credentialsDto;
    const user = await this.findOne({
      where: {
        email,
        status: true,
      },
    });

    if (user && (await user.checkPassword(password))) {
      return user;
    } else {
      return null;
    }
  }

  async findUserById(userId: string): Promise<UserResponseDto | null> {
    const user = await this.createQueryBuilder('user')
      .select([
        'user.id',
        'user.name',
        'user.email',
        'user.role',
        'user.status',
        'user.createdAt',
        'user.updatedAt',
      ])
      .where('user.id = :id', { id: userId })
      .andWhere('user.status = true') // opcional: só ativos
      .getOne();

    if (!user) {
      return null; // ou lance a exceção aqui se preferir
    }

    return new UserResponseDto({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }
  async findUsers(
    queryDto: FindUsersQueryDto,
  ): Promise<{ users: User[]; total: number }> {
    const { page = 1, limit = 10, search } = queryDto;

    const skip = (page - 1) * limit;

    const query = this.createQueryBuilder('user')
      .where('user.status = true')
      .skip(skip)
      .take(limit)
      .orderBy('user.createdAt', 'DESC');

    if (search) {
      query.andWhere('(user.name ILIKE :search OR user.email ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    const [users, total] = await query.getManyAndCount();

    return { users, total };
  }
}
