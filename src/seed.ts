import { UserRole } from './users/user-roles.enum';
import { UsersRepository } from './users/users.repository';
import { INestApplication } from '@nestjs/common';

export async function executeSeed(app: INestApplication) {
  const usersRepository = app.get(UsersRepository);

  const adminUser = {
    name: 'admin',
    email: 'admin@email.com',
    password: 'admin123',
    passwordConfirmation: 'admin123',
  };
  const existingAdmin = await usersRepository.findByEmail(adminUser.email);

  if (!existingAdmin) {
    await usersRepository.createUser(adminUser, UserRole.ADMIN);
    console.log('Usuário administrador criado com sucesso!');
  } else {
    console.log('Usuário administrador já existe.');
  }
}
