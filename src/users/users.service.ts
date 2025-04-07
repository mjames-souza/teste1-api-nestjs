import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserRole } from './user-roles.enum';
import { User } from './user.entity';
import { UpdateUserDto } from './dto/update-users.dto';
import { UsersQueryDto } from './dto/users-query.dto';
import { UpdateCredentialsDto } from 'src/auth/dto/update-credentials.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    if (createUserDto.password !== createUserDto.passwordConfirmation) {
      throw new UnprocessableEntityException('As senhas não conferem');
    }

    return this.usersRepository.createUser(createUserDto, UserRole.USER);
  }

  async updateUser(
    updateUserDto: UpdateUserDto,
    id: string,
  ): Promise<UserResponseDto> {
    const user = await this.findUserById(id);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const { name } = updateUserDto;
    user.name = name ?? user.name;
    await this.usersRepository.update(id, user);
    const updatedUser = await this.findUserById(id);

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };
  }

  async changeCredentials(
    newCredentials: UpdateCredentialsDto,
    id: string,
  ): Promise<void> {
    const user = await this.findUserById(id);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const salt = await bcrypt.genSalt();

    const newData = {
      email: newCredentials.email,
      password: await bcrypt.hash(newCredentials.password, salt),
    };

    await this.usersRepository.update(id, newData);
  }

  async deleteUser(userId: string, requester: User): Promise<void> {
    const user = await this.findUserById(userId);
    if (user.id !== requester.id) {
      throw new UnprocessableEntityException(
        'Apenas administradores podem excluir outros usuários',
      );
    }
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    await this.usersRepository.softDelete(userId);
    await this.usersRepository.save({ ...user, status: false });
  }

  async findUserById(userId: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  async findUsers(queryDto: UsersQueryDto): Promise<{
    users: User[];
    pageNumber: number;
    pageSize: number;
    totalItems: number;
  }> {
    const result = await this.usersRepository.findUsers(queryDto);
    return {
      users: result.users,
      pageNumber: queryDto.pageNumber,
      pageSize: queryDto.pageSize,
      totalItems: result.total,
    };
  }
}
