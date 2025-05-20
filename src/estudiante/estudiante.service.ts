import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { EstudianteEntity } from './estudiante.entity';

@Injectable()
export class EstudianteService {
  constructor(
    @InjectRepository(EstudianteEntity)
    private readonly estudianteRepository: Repository<EstudianteEntity>
  ) {}

  async crearEstudiante(estudiante: EstudianteEntity): Promise<EstudianteEntity> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(estudiante.correo)) {
      throw new BusinessLogicException('El correo tiene que ser válido', BusinessError.PRECONDITION_FAILED);
    }

    if (estudiante.semestre < 1 || estudiante.semestre > 10) {
      throw new BusinessLogicException('El semestre debe estar entre 1 y 10', BusinessError.PRECONDITION_FAILED);
    }

    return await this.estudianteRepository.save(estudiante);
  }

  async findEstudianteById(id: string): Promise<EstudianteEntity> {
    const estudiante = await this.estudianteRepository.findOne({
      where: { id },
      relations: ['actividades', 'resenas'],
    });

    if (!estudiante) {
      throw new BusinessLogicException('El estudiante con el id dado no fue encontrado.', BusinessError.NOT_FOUND);
    }

    return estudiante;
  }
}
