import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserRole } from './user-roles.enum';
import * as bcrypt from 'bcrypt';
import { CredentialsDto } from 'src/auth/dto/credentials.dto';
import { UsersQueryDto } from './dto/users-query.dto';

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async createUser(
    createUserDto: CreateUserDto,
    role: UserRole,
  ): Promise<UserResponseDto> {
    const user = await this.findByEmail(createUserDto.email);
    if (user) {
      throw new ConflictException('Endereço de email já está em uso');
    }
    const { email, name, password } = createUserDto;

    const newUser = this.create({
      email,
      name,
      role,
      status: true,
    });

    newUser.salt = await bcrypt.genSalt();
    newUser.password = await this.hashPassword(password, newUser.salt);

    try {
      const savedUser = await this.save(newUser);

      return {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        status: savedUser.status,
        createdAt: savedUser.createdAt,
        updatedAt: savedUser.updatedAt,
      };
    } catch (error: any) {
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
      .where({ id: userId })
      .andWhere('user.status = true')
      .getOne();

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findUsers(
    queryDto: UsersQueryDto,
  ): Promise<{ users: User[]; total: number }> {
    const { pageNumber = 1, pageSize = 10, sort = 'ASC', email } = queryDto;

    const skip = (pageNumber - 1) * pageSize;

    const query = this.createQueryBuilder('user').where({ status: true });

    if (email) {
      query.andWhere('(user.email ILIKE :email)', { email: `%${email}%` });
    }

    query.skip(skip).take(pageSize).orderBy('user.createdAt', sort);

    const [users, total] = await query.getManyAndCount();

    return { users, total };
  }
}
