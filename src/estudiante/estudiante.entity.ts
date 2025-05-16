import { ActividadEntity } from 'src/actividad/actividad.entity';
import { ResenaEntity } from 'src/resena/resena.entity';
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

export enum Rol {
  PROFESOR = 'Profesor',
  DECANA = 'Decana',
}

@Entity()
export class EstudianteEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  cedula: number;

  @Column()
  nombre: string;

  @Column()
  correo: string;

  @Column()
  programa: string;

  @Column()
  semestre: number;

  @ManyToMany(() => ActividadEntity, actividades => actividades.estudiantes)
  @JoinTable()
  actividades: ActividadEntity;

  @OneToMany(() => ResenaEntity, resena => resena.estudiante)
  resenas: ResenaEntity[];
}