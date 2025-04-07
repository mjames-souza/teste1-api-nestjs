# API de Gerenciamento de Usuários – Desafio Técnico Viraliza

## Descrição do Desafio Técnico – Viraliza
Este projeto foi desenvolvido como parte do processo seletivo para a vaga de Desenvolvedor na empresa **Viraliza**. O objetivo é construir uma API utilizando **NestJS** e **PostgreSQL**, com autenticação segura baseada em **JWT**, e o uso de **Docker** como diferencial.

A API deve permitir o gerenciamento completo de usuários, autenticação e listagem com filtros, ordenação e paginação.

## Como rodar o projeto (em modo de desenvolvimento)

1. Clonar o repositório
git clone https://github.com/mjames-souza/teste1-api-nestjs.git
cd teste1-api-nestjs

2. Subir os containers
docker-compose up

3. Iniciar a Aplicação 
npm run start:dev

A API estará disponível em `http://localhost:3000`.

### Observações
1. Ao rodar o projeto, o banco de dados será populado com um usuário **ADMINISTRADOR** através da função de seed, no arquivo seed.ts, com as seguintes credenciais: 
    name: 'admin',
    email: 'admin@email.com',
    password: 'admin123',

O acesso a alguns endpoints é protegido por **roles**:

| Rota                  | Método | Acesso     |
|-----------------------|--------|------------|
| `/auth/login`         | POST   | Público    |
| `/users`              | GET    | Admin      |
| `/users`              | POST   | Admin      |
| `/me `                | GET    | Autenticado |
| `/users/{id}`         | PATCH   | Público    |
| `/users/{id}`              | DELETE  | Admin ou Usuário Autenticado (Self delete)     |
| `/users/change-credentials/{id}`              | PATCH   | Admin      |
| `/users/{id}`         | GET    | Admin      |


O controle é feito via **Guards e Decorators personalizados** (`@Roles('admin')`, etc).
2. No typeOrmConfig a opção sychronize está ativada (`synchronize: true `). Em produção, mantenha `synchronize: false` e utilize **migrations** para versionar alterações no banco.

### Documentação da API – Swagger

Disponível em:

📌 [`http://localhost:3000/api`](http://localhost:3000/api)
