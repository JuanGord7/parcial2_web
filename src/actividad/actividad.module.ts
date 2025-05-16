import { Module } from '@nestjs/common';
import { ActividadService } from './actividad.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActividadEntity } from './actividad.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActividadEntity])],
  providers: [ActividadService]
})
export class ActividadModule {}
