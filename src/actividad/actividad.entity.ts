import { EstudianteEntity } from 'src/estudiante/estudiante.entity';
import { ResenaEntity } from 'src/resena/resena.entity';
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

export enum Rol {
  PROFESOR = 'Profesor',
  DECANA = 'Decana',
}

@Entity()
export class ActividadEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  titulo: string;

  @Column()
  fecha: string;

  @Column()
  cupoMaximo: number;

  @Column()
  estado: string;

  @ManyToMany(() => EstudianteEntity, estudiantes => estudiantes.actividades)
  estudiantes: EstudianteEntity[];

  @OneToMany(() => ResenaEntity, resena => resena.actividad)
  resenas: ResenaEntity[];
}