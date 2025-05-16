import { Module } from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstudianteEntity } from './estudiante.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EstudianteEntity])],
  providers: [EstudianteService]
})
export class EstudianteModule {}
