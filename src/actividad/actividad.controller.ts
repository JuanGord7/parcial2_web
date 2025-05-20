import {Body, Controller, Get, Param, Post, Put, UseInterceptors} from '@nestjs/common';
import { ActividadService } from './actividad.service';
import { ActividadEntity } from './actividad.entity';
import { CreateActividadDto } from './actividad.dto';
import { BusinessErrorsInterceptor } from 'src/shared/interceptors/business-errors/business-errors.interceptor';

@Controller('actividades')
@UseInterceptors(BusinessErrorsInterceptor)
export class ActividadController {
  constructor(private readonly actividadService: ActividadService) {}

  @Post()
  async crearActividad(@Body() actividadDto: CreateActividadDto): Promise<ActividadEntity> {
    return this.actividadService.crearActividad(actividadDto as ActividadEntity);
  }

  @Put(':id/estado/:nuevoEstado')
  async cambiarEstado(
    @Param('id') id: string,
    @Param('nuevoEstado') nuevoEstado: string
  ): Promise<ActividadEntity> {
    return this.actividadService.cambiarEstado(id, nuevoEstado);
  }

  @Get('fecha/:fecha')
  async findAllActividadesByDate(@Param('fecha') fecha: string): Promise<ActividadEntity[]> {
    return this.actividadService.findAllActividadesByDate(fecha);
  }
}
