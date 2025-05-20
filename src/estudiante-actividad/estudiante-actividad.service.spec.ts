import { Test, TestingModule } from '@nestjs/testing';
import { EstudianteActividadService } from './estudiante-actividad.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActividadEntity } from '../actividad/actividad.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { faker } from '@faker-js/faker';
import { EstudianteEntity } from '../estudiante/estudiante.entity';

describe('EstudianteActividadService', () => {
  let service: EstudianteActividadService;
  let estudianteRepository: Repository<EstudianteEntity>;
  let actividadRepository: Repository<ActividadEntity>;
  let estudiantesList: EstudianteEntity[];
  let actividadesList: ActividadEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [EstudianteActividadService],
    }).compile();

    service = module.get<EstudianteActividadService>(EstudianteActividadService);
    estudianteRepository = module.get<Repository<EstudianteEntity>>(getRepositoryToken(EstudianteEntity));
    actividadRepository = module.get<Repository<ActividadEntity>>(getRepositoryToken(ActividadEntity));

    await seedDatabase();
  });

  const seedDatabase = async () => {
    await estudianteRepository.clear();
    await actividadRepository.clear();

    estudiantesList = [];
    actividadesList = [];

    for (let i = 0; i < 5; i++) {
      const actividad = await actividadRepository.save({
        titulo: faker.lorem.words(3),
        fecha: new Date().toISOString(),
        cupoMaximo: 3,
        estado: '0',
        estudiantes: [],
        resenas: [],
      });
      actividadesList.push(actividad);
    }

    for (let i = 0; i < 5; i++) {
      const estudiante = await estudianteRepository.save({
        nombre: faker.person.firstName(),
        cedula: parseInt(faker.string.numeric(10)),
        programa: faker.lorem.word(),
        correo: faker.internet.email(),
        semestre: faker.number.int({ min: 1, max: 10 }),
        actividades: [],
        resenas: [],
      });
      estudiantesList.push(estudiante);
    }
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('inscribirseActividad', () => {
    it('debería inscribir a un estudiante en una actividad válida', async () => {
      const estudiante = estudiantesList[0];
      const actividad = actividadesList[0];

      const result = await service.inscribirseActividad(estudiante.id, actividad.id);

      expect(result).not.toBeNull();
      expect(result.actividades.some(a => a.id === actividad.id)).toBeTruthy();
    });

    it('debería lanzar error si el estudiante no existe', async () => {
      const actividad = actividadesList[0];

      await expect(service.inscribirseActividad('id-no-existe', actividad.id)).rejects.toHaveProperty(
        'message',
        'El estudiante con el id dado no fue encontrado.',
      );
    });

    it('debería lanzar error si la actividad no existe', async () => {
      const estudiante = estudiantesList[0];

      await expect(service.inscribirseActividad(estudiante.id, 'id-no-existe')).rejects.toHaveProperty(
        'message',
        'La actividad con el id dado no fue encontrada.',
      );
    });

    it('debería lanzar error si la actividad no tiene cupo disponible', async () => {
      const estudiante = estudiantesList[1];

      const actividadLlena = await actividadRepository.save({
        titulo: 'Llena',
        fecha: new Date().toISOString(),
        cupoMaximo: 1,
        estado: '0',
        estudiantes: [estudiante],
        resenas: [],
      });

      await expect(service.inscribirseActividad(estudiante.id, actividadLlena.id)).rejects.toHaveProperty(
        'message',
        'La actividad no tiene cupo disponible.',
      );
    });

    it('debería lanzar error si la actividad no está disponible', async () => {
      const estudiante = estudiantesList[2];

      const actividadInactiva = await actividadRepository.save({
        titulo: 'Inactiva',
        fecha: new Date().toISOString(),
        cupoMaximo: 5,
        estado: '1',
        estudiantes: [],
        resenas: [],
      });

      await expect(service.inscribirseActividad(estudiante.id, actividadInactiva.id)).rejects.toHaveProperty(
        'message',
        'La actividad no está disponible para inscripciones.',
      );
    });

    it('debería lanzar error si el estudiante ya está inscrito', async () => {
      const estudiante = estudiantesList[3];
      const actividad = actividadesList[1];

      estudiante.actividades = [actividad];
      await estudianteRepository.save(estudiante);

      actividad.estudiantes = [estudiante];
      await actividadRepository.save(actividad);

      await expect(service.inscribirseActividad(estudiante.id, actividad.id)).rejects.toHaveProperty(
        'message',
        'El estudiante ya está inscrito en esta actividad.',
      );
    });
  });
});
