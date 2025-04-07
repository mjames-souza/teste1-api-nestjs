import { ApiProperty } from '@nestjs/swagger';

export abstract class BaseQueryParametersDto {
  @ApiProperty({
    description: 'Campo para ordenação dos resultados',
    example: 'createdAt',
    required: false,
  })
  sort: 'ASC' | 'DESC';

  @ApiProperty({
    description: 'Número da página para paginação',
    example: 1,
    required: false,
  })
  pageNumber: number;

  @ApiProperty({
    description: 'Quantidade de itens por página',
    example: 10,
    required: false,
  })
  pageSize: number;
}
