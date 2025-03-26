import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './shared/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { RolesGuard } from './shared/guards/roles.guard';
import { PrismaService } from './shared/prisma/prisma.service';
import { StudentsModule } from './modules/students/students.module';
import { InstitutionsModule } from './modules/institutions/institutions.module';
import { AssessmentsModule } from './modules/assessments/assessments.module';
import { GoalsModule } from './modules/goals/goals.module';

@Module({
  imports: [
    // Configuração de variáveis de ambiente
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Prisma Module
    PrismaModule,
    // Auth Module
    AuthModule,
    // Users Module
    UsersModule,
    // Students Module
    StudentsModule,
    // Institutions Module
    InstitutionsModule,
    // Assessments Module
    AssessmentsModule,
    // Goals Module
    GoalsModule,
    // Outros módulos serão importados aqui
  ],
  providers: [
    // Guards globais
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {} 