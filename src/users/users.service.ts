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
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-users.dto';
import { FindUsersQueryDto } from './dto/find-users-query.dto';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async createAdminUser(
    createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    if (createUserDto.password !== createUserDto.passwordConfirmation) {
      throw new UnprocessableEntityException('As senhas não conferem');
    }

    return this.usersRepository.createUser(createUserDto, UserRole.ADMIN);
  }
  async updateUser(
    updateUserDto: UpdateUserDto,
    id: string,
  ): Promise<UserResponseDto> {
    const user = await this.findUserById(id);

    const { name, email, role, status } = updateUserDto;
    user.name = name ?? user.name;
    user.email = email ?? user.email;
    user.role = role ?? user.role;
    user.status = status === undefined ? user.status : status;

    try {
      await this.usersRepository.save(user);
      return new UserResponseDto(user); // ⬅ transformando para o DTO
    } catch (error) {
      throw new InternalServerErrorException(
        'Erro ao salvar os dados no banco de dados',
      );
    }
  }
  async deleteUser(userId: string): Promise<void> {
    const result = await this.usersRepository.softDelete(userId);

    if (result.affected === 0) {
      throw new NotFoundException(
        'Usuário não encontrado para exclusão lógica',
      );
    }
  }
  async findUserById(userId: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }
  async findUsers(
    queryDto: FindUsersQueryDto,
  ): Promise<{ users: User[]; total: number }> {
    const users = await this.usersRepository.findUsers(queryDto);
    return users;
  }
}
