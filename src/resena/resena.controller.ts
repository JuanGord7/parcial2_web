import { Body, Controller, Get, Param, Post, UseInterceptors} from '@nestjs/common';
import { ResenaService } from './resena.service';
import { ResenaEntity } from './resena.entity';
import { CreateResenaDto } from './resena.dto';
import { BusinessErrorsInterceptor } from 'src/shared/interceptors/business-errors/business-errors.interceptor';

@Controller('resenas')
@UseInterceptors(BusinessErrorsInterceptor)
export class ResenaController {
  constructor(private readonly resenaService: ResenaService) {}

  @Post('actividad/:actividadID/estudiante/:estudianteID')
  async agregarResena(
    @Param('actividadID') actividadID: string,
    @Param('estudianteID') estudianteID: string,
    @Body() resenaDto: CreateResenaDto
  ): Promise<ResenaEntity> {
    return this.resenaService.agregarResena(
      resenaDto as ResenaEntity,
      actividadID,
      estudianteID
    );
  }

  @Get(':id')
  async findResenaById(@Param('id') id: string): Promise<ResenaEntity> {
    return this.resenaService.findClaseById(id);
  }
}
