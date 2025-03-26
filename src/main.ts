import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configuração global de pipes para validação
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // Configuração de prefixo global para API
  app.setGlobalPrefix('api/v1');
  
  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('Innerview API')
    .setDescription('API da plataforma Innerview - Sistema de gestão educacional com foco em intervenções RTI/MTSS')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Endpoints de autenticação')
    .addTag('users', 'Gestão de usuários')
    .addTag('students', 'Gestão de estudantes')
    .addTag('interventions', 'Framework RTI/MTSS e intervenções')
    .addTag('assessments', 'Rastreios e avaliações')
    .addTag('teams', 'Gestão de equipes e reuniões')
    .addTag('insights', 'Análises preditivas e insights')
    .addTag('integrations', 'Integrações com sistemas externos')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
  
  // Obter a porta da configuração
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  
  await app.listen(port);
  console.log(`Aplicação rodando na porta ${port}`);
  console.log(`Documentação Swagger disponível em http://localhost:${port}/api/docs`);
}

bootstrap(); 