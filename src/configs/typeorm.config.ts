import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'pgsql',
  port: 5432,
  username: 'postgres',
  password: 'pgpassword',
  database: 'dbviraliza',
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: true,
};
