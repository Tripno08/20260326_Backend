import { SetMetadata } from '@nestjs/common';
import { CargoUsuario } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: CargoUsuario[]) => SetMetadata(ROLES_KEY, roles); 