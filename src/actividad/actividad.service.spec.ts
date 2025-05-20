import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ActividadEntity } from './actividad.entity';
import { ActividadService } from './actividad.service';
import { faker } from '@faker-js/faker';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';

describe('ActividadService', () => {
  let service: ActividadService;
  let repository: Repository<ActividadEntity>;
  let actividadesList: ActividadEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ActividadService],
    }).compile();

    service = module.get<ActividadService>(ActividadService);
    repository = module.get<Repository<ActividadEntity>>(getRepositoryToken(ActividadEntity));
    await seedDatabase();
  });

  const seedDatabase = async () => {
    await repository.clear();
    actividadesList = [];
    for (let i = 0; i < 5; i++) {
      const actividad: ActividadEntity = await repository.save({
        titulo: faker.lorem.words(5),
        estado: '0',
        cupoMaximo: faker.number.int({ min: 10, max: 30 }),
        fecha: faker.date.future().toISOString().split('T')[0],
        estudiantes: [],
        resenas: [],
      });
      actividadesList.push(actividad);
    }
  };

  it('service debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('crearActividad', () => {
    it('debería crear una actividad válida', async () => {
      const actividad: ActividadEntity = {
        id: '',
        titulo: 'Actividad con título válido y largo',
        estado: '0',
        cupoMaximo: 20,
        fecha: '2025-05-20',
        estudiantes: [],
        resenas: [],
      };

      const result = await service.crearActividad(actividad);

      expect(result).toHaveProperty('id');
      expect(result.titulo).toBe(actividad.titulo);
      expect(result.estado).toBe('0');
    });

    it('debería lanzar error si el título es corto', async () => {
      const actividad: ActividadEntity = {
        id: '',
        titulo: 'Corto',
        estado: '0',
        cupoMaximo: 20,
        fecha: '2025-05-20',
        estudiantes: [],
        resenas: []
      };

      await expect(service.crearActividad(actividad)).rejects.toHaveProperty(
        'message',
        'El título debe tener al menos 15 caracteres y no debe contener símbolos.'
      );
    });

    it('debería lanzar error si el título tiene símbolos', async () => {
      const actividad: ActividadEntity = {
        id: '',
        titulo: 'Título inválido!!!',
        estado: '0',
        cupoMaximo: 20,
        fecha: '2025-05-20',
        estudiantes: [],
        resenas: []
      };

      await expect(service.crearActividad(actividad)).rejects.toHaveProperty(
        'message',
        'El título debe tener al menos 15 caracteres y no debe contener símbolos.'
      );
    });
  });

  describe('cambiarEstado', () => {
    it('debería lanzar error si intenta cerrar sin 80% de cupo lleno', async () => {
      const actividad = {
        id: '1',
        titulo: 'Actividad válida para cambiar estado',
        estado: '0',
        cupoMaximo: 10,
        fecha: '2025-05-20',
        estudiantes: Array(5).fill({}),
        resenas: [],
      };

      await repository.save(actividad);

      await expect(service.cambiarEstado('1', '1')).rejects.toHaveProperty(
        'message',
        'Solo se puede cerrar si al menos el 80% del cupo está ocupado.'
      );
    });

    it('debería lanzar error si intenta finalizar sin cupo lleno', async () => {
      const actividad = {
        id: '1',
        titulo: 'Actividad válida para cambiar estado',
        estado: '1',
        cupoMaximo: 10,
        fecha: '2025-05-20',
        estudiantes: Array(8).fill({}),
        resenas: [],
      };

      await repository.save(actividad);

      await expect(service.cambiarEstado('1', '2')).rejects.toHaveProperty(
        'message',
        'Solo se puede finalizar si el cupo está completamente lleno.'
      );
    });

    it('debería lanzar error si la actividad no existe', async () => {
      await expect(service.cambiarEstado('no-existe', '1')).rejects.toHaveProperty(
        'message',
        'La actividad con el id dado no fue encontrada.'
      );
    });

    it('debería retornar la misma actividad si el estado no cambia', async () => {
      const actividad = repository.create({
        titulo: 'Actividad válida',
        estado: '0',
        cupoMaximo: 10,
        fecha: '2025-05-20',
      });

      const savedActividad = await repository.save(actividad);

      const resultado = await service.cambiarEstado(savedActividad.id, '0');

      expect(resultado).toEqual(expect.objectContaining({
        id: savedActividad.id,
        titulo: savedActividad.titulo,
        estado: savedActividad.estado,
      }));
    });
  });

  describe('findAllActividadesByDate', () => {
    it('debería retornar actividades para una fecha dada', async () => {
      const actividades = [
        { id: faker.string.uuid(), fecha: '2025-05-20', titulo: 'Act 1', estado: '0', cupoMaximo: 10, estudiantes: [], resenas: [] },
        { id: faker.string.uuid(), fecha: '2025-05-20', titulo: 'Act 2', estado: '0', cupoMaximo: 10, estudiantes: [], resenas: [] },
      ];

      for (const act of actividades) {
        await repository.save(act);
      }

      const resultado = await service.findAllActividadesByDate('2025-05-20');

      expect(resultado.length).toBe(2);
      expect(resultado[0].fecha).toBe('2025-05-20');
    });

    it('debería retornar arreglo vacío si no hay actividades para la fecha', async () => {
      const resultado = await service.findAllActividadesByDate('2025-01-01');

      expect(resultado).toEqual([]);
    });
  });
});
