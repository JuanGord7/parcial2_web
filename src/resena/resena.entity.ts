import { ActividadEntity } from '../actividad/actividad.entity';
import { EstudianteEntity } from '../estudiante/estudiante.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum Rol {
  PROFESOR = 'Profesor',
  DECANA = 'Decana',
}

@Entity()
export class ResenaEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  comentario: string;

  @Column()
  calificacion: number;

  @Column()
  fecha: string;

  @ManyToOne(() => EstudianteEntity, estudiante => estudiante.resenas)
  estudiante: EstudianteEntity;

  @ManyToOne(() => ActividadEntity, actividad => actividad.resenas)
  actividad: ActividadEntity;
}