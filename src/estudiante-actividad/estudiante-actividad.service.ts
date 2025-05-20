import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstudianteEntity } from '../estudiante/estudiante.entity';
import { ActividadEntity } from '../actividad/actividad.entity';
import { BusinessLogicException, BusinessError } from '../shared/errors/business-errors';

@Injectable()
export class EstudianteActividadService {
  constructor(
    @InjectRepository(EstudianteEntity)
    private readonly estudianteRepository: Repository<EstudianteEntity>,

    @InjectRepository(ActividadEntity)
    private readonly actividadRepository: Repository<ActividadEntity>,
  ) {}

  async inscribirseActividad(estudianteID: string, actividadID: string): Promise<EstudianteEntity> {
    const estudiante = await this.estudianteRepository.findOne({
      where: { id: estudianteID },
      relations: ['actividades'],
    });

    if (!estudiante) {
      throw new BusinessLogicException(
        'El estudiante con el id dado no fue encontrado.',
        BusinessError.NOT_FOUND,
      );
    }

    const actividad = await this.actividadRepository.findOne({
      where: { id: actividadID },
      relations: ['estudiantes'],
    });

    if (!actividad) {
      throw new BusinessLogicException(
        'La actividad con el id dado no fue encontrada.',
        BusinessError.NOT_FOUND,
      );
    }

    if (actividad.cupoMaximo <= actividad.estudiantes.length) {
      throw new BusinessLogicException(
        'La actividad no tiene cupo disponible.',
        BusinessError.PRECONDITION_FAILED,
      );
    }

    if (actividad.estado !== '0') {
      throw new BusinessLogicException(
        'La actividad no está disponible para inscripciones.',
        BusinessError.PRECONDITION_FAILED,
      );
    }

    const yaInscrito = estudiante.actividades.some((a) => a.id === actividad.id);
    if (yaInscrito) {
      throw new BusinessLogicException(
        'El estudiante ya está inscrito en esta actividad.',
        BusinessError.PRECONDITION_FAILED,
      );
    }

    estudiante.actividades.push(actividad);
    return await this.estudianteRepository.save(estudiante);
  }
}
