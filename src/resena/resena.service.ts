import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { ResenaEntity } from './resena.entity';
import { ActividadEntity } from '../actividad/actividad.entity';
import { EstudianteEntity } from '../estudiante/estudiante.entity';

@Injectable()
export class ResenaService {
  constructor(
    @InjectRepository(ResenaEntity)
    private readonly resenaRepository: Repository<ResenaEntity>,

    @InjectRepository(ActividadEntity)
    private readonly actividadRepository: Repository<ActividadEntity>,

    @InjectRepository(EstudianteEntity)
    private readonly estudianteRepository: Repository<EstudianteEntity>,
  ) {}

  async agregarResena(resena: ResenaEntity, actividadID: string, estudianteID: string): Promise<ResenaEntity> {
    const actividad = await this.actividadRepository.findOne({
      where: { id: actividadID },
      relations: ['estudiantes']
    });

    if (!actividad) {
      throw new BusinessLogicException('La actividad no fue encontrada.', BusinessError.NOT_FOUND);
    }

    if (actividad.estado !== "2") {
      throw new BusinessLogicException('Solo se puede agregar una reseña a actividades finalizadas.', BusinessError.PRECONDITION_FAILED);
    }

    const estudiante = await this.estudianteRepository.findOne({ where: { id: estudianteID } });

    if (!estudiante) {
      throw new BusinessLogicException('El estudiante no fue encontrado.', BusinessError.NOT_FOUND);
    }

    const estaInscrito = actividad.estudiantes.some(est => est.id === estudiante.id);
    if (!estaInscrito) {
      throw new BusinessLogicException('El estudiante no está inscrito en la actividad.', BusinessError.PRECONDITION_FAILED);
    }

    resena.actividad = actividad;
    resena.estudiante = estudiante;

    return await this.resenaRepository.save(resena);
  }

  async findClaseById(id: string): Promise<ResenaEntity> {
    const resena = await this.resenaRepository.findOne({
      where: { id },
      relations: ['actividad', 'estudiante']
    });

    if (!resena) {
      throw new BusinessLogicException('La reseña no fue encontrada.', BusinessError.NOT_FOUND);
    }

    return resena;
  }
}
