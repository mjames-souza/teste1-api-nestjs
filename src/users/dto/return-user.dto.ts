import { UserResponseDto } from './user-response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ReturnUserDto {
  @ApiProperty({ type: UserResponseDto, description: 'Dados do usuário' })
  user: UserResponseDto;

  @ApiProperty({
    example: 'Mensagem de sucesso',
    description: 'Mensagem de retorno',
  })
  message: string;
}
