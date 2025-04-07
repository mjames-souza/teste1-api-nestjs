import { IsOptional, IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BaseQueryParametersDto } from 'src/shared/dto/base-query-parameters.dto';

export class UsersQueryDto extends BaseQueryParametersDto {
  @ApiProperty({
    required: false,
    type: String,
    description: 'Texto para busca por nome ou email',
    example: 'João',
  })
  @IsOptional()
  @IsString()
  email?: string;
}
