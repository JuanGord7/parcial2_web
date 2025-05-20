import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EstudianteModule } from './estudiante/estudiante.module';
import { ResenaModule } from './resena/resena.module';
import { ActividadModule } from './actividad/actividad.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstudianteEntity } from './estudiante/estudiante.entity';
import { ResenaEntity } from './resena/resena.entity';
import { ActividadEntity } from './actividad/actividad.entity';
import { EstudianteActividadModule } from './estudiante-actividad/estudiante-actividad.module';

@Module({
  imports: [EstudianteModule, ResenaModule, ActividadModule, TypeOrmModule.forRoot({
     type: 'postgres',
     host: 'localhost',
     port: 5433,
     username: 'postgres',
     password: 'postgres',
     database: 'parcial2',
     entities: [EstudianteEntity, ResenaEntity, ActividadEntity],
     dropSchema: true,
     synchronize: true}), EstudianteActividadModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
