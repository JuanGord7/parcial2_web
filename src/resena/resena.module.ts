import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResenaService } from './resena.service';
import { ResenaController } from './resena.controller';
import { ResenaEntity } from './resena.entity';
import { ActividadModule } from 'src/actividad/actividad.module';
import { EstudianteModule } from 'src/estudiante/estudiante.module';

@Module({
  imports: [TypeOrmModule.forFeature([ResenaEntity]), ActividadModule, EstudianteModule],
  providers: [ResenaService],
  controllers: [ResenaController]
})
export class ResenaModule {}
