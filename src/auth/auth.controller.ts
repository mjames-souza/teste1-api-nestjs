import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  ValidationPipe,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { CredentialsDto } from './dto/credentials.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/user.entity';
import { GetUser } from 'src/auth/get-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login de um usuário' })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    schema: { example: { token: 'jwt_token' } },
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(
    @Body(ValidationPipe) credentiaslsDto: CredentialsDto,
  ): Promise<{ token: string }> {
    return await this.authService.login(credentiaslsDto);
  }

  @Get('/me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtém os dados do usuário autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Dados do usuário autenticado',
    type: User,
  })
  @ApiResponse({ status: 401, description: 'Token inválido ou não fornecido' })
  getMe(@GetUser() user: User): User {
    return user;
  }
}
