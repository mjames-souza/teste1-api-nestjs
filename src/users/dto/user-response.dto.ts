import { UserRole } from '../user-roles.enum';

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}
