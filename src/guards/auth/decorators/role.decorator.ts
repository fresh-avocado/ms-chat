import { SetMetadata } from '@nestjs/common';
import { Role } from '../types/role.type';

export const AllowedUserType = (role: Role) => SetMetadata('role', role);
