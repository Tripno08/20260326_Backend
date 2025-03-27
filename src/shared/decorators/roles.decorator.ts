import { SetMetadata } from '@nestjs/common';
import { CargoUsuario } from '../enums/cargo-usuario.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: CargoUsuario[]) => SetMetadata(ROLES_KEY, roles); 