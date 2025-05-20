import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from 'src/shared/errors/business-errors';
import { EstudianteEntity } from './estudiante.entity';
import { ActividadEntity } from 'src/actividad/actividad.entity';

@Injectable()
export class EstudianteService {
    constructor(
        @InjectRepository(EstudianteEntity)
        private readonly estudianteRepository: Repository<EstudianteEntity>,
        @InjectRepository(ActividadEntity)
        private readonly actividadRepository: Repository<ActividadEntity>
    ){}

    async crearEstudiante(estudiante: EstudianteEntity): Promise<EstudianteEntity> {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(estudiante.correo)) {
            throw new BusinessLogicException(`El correo tiene que ser válido`, BusinessError.PRECONDITION_FAILED);
        }

        if (estudiante.semestre < 1 || estudiante.semestre > 10) {
            throw new BusinessLogicException('El semestre debe estar entre 1 y 10', BusinessError.PRECONDITION_FAILED);
        }
        return await this.estudianteRepository.save(estudiante);
    }

    async findEstudianteById(id: string): Promise<EstudianteEntity> {
        const estudiante: EstudianteEntity | null = await this.estudianteRepository.findOne({where: {id}, relations: ["actividades", "resenas"] } );
        if (!estudiante) throw new BusinessLogicException("El estudiante con el id dado no fue encontrado.", BusinessError.NOT_FOUND);
        return estudiante;
    }

    async InscribirseActividad(estudianteID: string, actividadID: string): Promise<EstudianteEntity> {
        const estudiante = await this.estudianteRepository.findOne({
            where: { id: estudianteID },
            relations: ['actividades']
        });

        if (!estudiante) {
            throw new BusinessLogicException("El estudiante con el id dado no fue encontrado.", BusinessError.NOT_FOUND);
        }

        const actividad = await this.actividadRepository.findOne({
            where: { id: actividadID },
            relations: ['estudiantes']
        });

        if (!actividad) {
            throw new BusinessLogicException("La actividad con el id dado no fue encontrada.", BusinessError.NOT_FOUND);
        }

        if (actividad.cupoMaximo <= actividad.estudiantes.length) {
            throw new BusinessLogicException("La actividad no tiene cupo disponible.", BusinessError.PRECONDITION_FAILED);
        }

        if (actividad.estado !== "0") {
            throw new BusinessLogicException("La actividad no está disponible para inscripciones.", BusinessError.PRECONDITION_FAILED);
        }

        const yaInscrito = estudiante.actividades.some(a => a.id === actividad.id);
        if (yaInscrito) {
            throw new BusinessLogicException("El estudiante ya está inscrito en esta actividad.", BusinessError.PRECONDITION_FAILED);
        }

        estudiante.actividades.push(actividad);
        return await this.estudianteRepository.save(estudiante);
    }
}
