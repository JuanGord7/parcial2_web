import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from 'src/shared/errors/business-errors';
import { ActividadEntity } from './actividad.entity';

@Injectable()
export class ActividadService {
    constructor(
       @InjectRepository(ActividadEntity)
       private readonly actividadRepository: Repository<ActividadEntity>
    ){}

    async crearActividad(actividad: ActividadEntity): Promise<ActividadEntity> {
        if (actividad.titulo.length > 15 || actividad.titulo.includes(' ')) {
            throw new BusinessLogicException(`El título tiene que ser de longitud mayor a 15 y no puede contener caracteres`, BusinessError.PRECONDITION_FAILED);
        }
        return await this.actividadRepository.save(actividad);
    }

    async cambiarEstado(actividadID: string, estado: string): Promise<ActividadEntity> {
        const actividad: ActividadEntity | null = await this.actividadRepository.findOne({where: {id: actividadID}, relations: ["estudiantes", "resenas"] } );
        if (!actividad) throw new BusinessLogicException("El usuario con el id dado no fue encontrado.", BusinessError.NOT_FOUND);
        if (estado !== "abierta" && estado !== "Cerrada" && estado !== "Finalizada") {
            throw new BusinessLogicException(`El estado tiene que ser abierta, Cerrada o Finalizada`, BusinessError.PRECONDITION_FAILED);
        }
        if (actividad.estado === "Abierta" && estado === "Cerrada") {
            throw new BusinessLogicException(`No se puede cambiar el estado de Abierta a Cerrada`, BusinessError.PRECONDITION_FAILED);
        }
        return await this.actividadRepository.save(actividad);
    }
}
