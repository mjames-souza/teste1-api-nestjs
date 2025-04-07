import { ApiProperty } from '@nestjs/swagger';

export class CredentialsDto {
  @ApiProperty({
    example: 'usuario@email.com',
    description: 'O endereço de email do usuário',
  })
  email: string;

  @ApiProperty({
    example: 'senha123',
    description: 'A senha do usuário',
  })
  password: string;
}
