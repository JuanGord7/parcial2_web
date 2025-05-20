import { Module } from '@nestjs/common';
import { EstudianteActividadService } from './estudiante-actividad.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstudianteEntity } from 'src/estudiante/estudiante.entity';
import { ActividadEntity } from 'src/actividad/actividad.entity';
import { EstudianteActividadController } from './estudiante-actividad.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EstudianteEntity, ActividadEntity])],
  providers: [EstudianteActividadService],
  controllers: [EstudianteActividadController]
})
export class EstudianteActividadModule {}
