import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UserRole } from './users/user-roles.enum';
import { UsersRepository } from './users/users.repository';

export async function executeSeed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersRepository = app.get(UsersRepository);

  try {
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
  } catch (error) {
    console.error('Erro ao criar o usuário administrador:', error);
  } finally {
    await app.close();
  }
}
