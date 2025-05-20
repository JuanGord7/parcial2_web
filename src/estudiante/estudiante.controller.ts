import { Body, Controller, Get, Param, Post, UseInterceptors } from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { EstudianteEntity } from './estudiante.entity';
import { CreateEstudianteDto } from './estudiante.dto';
import { BusinessErrorsInterceptor } from 'src/shared/interceptors/business-errors/business-errors.interceptor';

@Controller('estudiantes')
@UseInterceptors(BusinessErrorsInterceptor)
export class EstudianteController {
  constructor(private readonly estudianteService: EstudianteService) {}

  @Post()
  async crearEstudiante(@Body() estudianteDto: CreateEstudianteDto): Promise<EstudianteEntity> {
    return this.estudianteService.crearEstudiante(estudianteDto as EstudianteEntity);
  }

  @Get(':id')
  async findEstudianteById(@Param('id') id: string): Promise<EstudianteEntity> {
    return this.estudianteService.findEstudianteById(id);
  }
}
