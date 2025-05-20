import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { ActividadEntity } from './actividad.entity';

@Injectable()
export class ActividadService {
    constructor(
        @InjectRepository(ActividadEntity)
        private readonly actividadRepository: Repository<ActividadEntity>
    ) {}

    async crearActividad(actividad: ActividadEntity): Promise<ActividadEntity> {
        const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

        if (actividad.titulo.length < 15 || !regex.test(actividad.titulo)) {
        throw new BusinessLogicException(
            `El título debe tener al menos 15 caracteres y no debe contener símbolos.`,
            BusinessError.PRECONDITION_FAILED
        );
        }

        actividad.estado = "0";
        return await this.actividadRepository.save(actividad);
    }

    async cambiarEstado(actividadID: string, nuevoEstado: string): Promise<ActividadEntity> {
        const actividad = await this.actividadRepository.findOne({
        where: { id: actividadID },
        relations: ['estudiantes']
        });

        if (!actividad) {
        throw new BusinessLogicException("La actividad con el id dado no fue encontrada.", BusinessError.NOT_FOUND);
        }

        const estadosValidos = ["0", "1", "2"];
        if (!estadosValidos.includes(nuevoEstado)) {
        throw new BusinessLogicException(`El estado debe ser '0' (abierta), '1' (cerrada) o '2' (finalizada).`, BusinessError.PRECONDITION_FAILED);
        }

        if (actividad.estado === nuevoEstado) {
        return actividad;
        }

        const inscritos = actividad.estudiantes.length;
        const cupo = actividad.cupoMaximo;

        if (nuevoEstado === "1") {
        const porcentaje = inscritos / cupo;
        if (porcentaje < 0.8) {
            throw new BusinessLogicException(`Solo se puede cerrar si al menos el 80% del cupo está ocupado.`, BusinessError.PRECONDITION_FAILED);
        }
        }

        if (nuevoEstado === "2") {
        if (inscritos < cupo) {
            throw new BusinessLogicException(`Solo se puede finalizar si el cupo está completamente lleno.`, BusinessError.PRECONDITION_FAILED);
        }
        }

        actividad.estado = nuevoEstado;
        return await this.actividadRepository.save(actividad);
    }

    async findAllActividadesByDate(fecha: string): Promise<ActividadEntity[]> {
        return await this.actividadRepository.find({ where: { fecha } });
    }
}
