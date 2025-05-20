import { Controller, Param, Post, UseInterceptors } from '@nestjs/common';
import { EstudianteActividadService } from './estudiante-actividad.service';
import { BusinessErrorsInterceptor } from 'src/shared/interceptors/business-errors/business-errors.interceptor';
import { EstudianteEntity } from 'src/estudiante/estudiante.entity';

@Controller('estudiantes')
@UseInterceptors(BusinessErrorsInterceptor)
export class EstudianteActividadController {
  constructor(private readonly estudianteActividadService: EstudianteActividadService) {}

  @Post(':estudianteId/inscribir/:actividadId')
  async inscribirseActividad(
    @Param('estudianteId') estudianteId: string,
    @Param('actividadId') actividadId: string
  ): Promise<EstudianteEntity> {
    return this.estudianteActividadService.inscribirseActividad(estudianteId, actividadId);
  }
}
