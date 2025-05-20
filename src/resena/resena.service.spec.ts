import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResenaService } from './resena.service';
import { ResenaEntity } from './resena.entity';
import { BusinessError } from '../shared/errors/business-errors';

describe('ResenaService', () => {
  let service: ResenaService;
  let resenaRepository: Partial<Repository<ResenaEntity>>;

  const resenaRepoMock = {
    save: (entity: any) => Promise.resolve({ ...entity, id: 'resena-1' }),
    findOne: (options: any) => {
      if (options.where.id === 'resena-1') {
        return Promise.resolve({
          id: 'resena-1',
          actividad: { id: 'actividad-1' },
          estudiante: { id: 'estudiante-1' },
        });
      }
      return Promise.resolve(null);
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResenaService,
        {
          provide: getRepositoryToken(ResenaEntity),
          useValue: resenaRepoMock,
        },
        {
          provide: getRepositoryToken(require('../actividad/actividad.entity').ActividadEntity),
          useValue: { findOne: () => Promise.resolve({ id: 'actividad-1', estado: '2', estudiantes: [{ id: 'estudiante-1' }] }) },
        },
        {
          provide: getRepositoryToken(require('../estudiante/estudiante.entity').EstudianteEntity),
          useValue: { findOne: () => Promise.resolve({ id: 'estudiante-1' }) },
        },
      ],
    }).compile();

    service = module.get<ResenaService>(ResenaService);
    resenaRepository = module.get<Partial<Repository<ResenaEntity>>>(getRepositoryToken(ResenaEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('agregarResena', () => {
    it('debería guardar una reseña correctamente', async () => {
      const resena = new ResenaEntity();

      const result = await service.agregarResena(resena, 'actividad-1', 'estudiante-1');

      expect(result).toHaveProperty('id', 'resena-1');
      expect(result.actividad.id).toBe('actividad-1');
      expect(result.estudiante.id).toBe('estudiante-1');
    });

    it('debería lanzar un error si falla al guardar la reseña', async () => {
      const errorRepoMock = {
        ...resenaRepoMock,
        save: () => Promise.reject(new Error('Error al guardar reseña')),
      };

      (service as any).resenaRepository = errorRepoMock;

      const resena = new ResenaEntity();

      await expect(service.agregarResena(resena, 'actividad-1', 'estudiante-1')).rejects.toThrow('Error al guardar reseña');
    });
  });

  describe('findClaseById', () => {
    it('debería retornar una reseña existente', async () => {
      const result = await service.findClaseById('resena-1');

      expect(result).toEqual({
        id: 'resena-1',
        actividad: { id: 'actividad-1' },
        estudiante: { id: 'estudiante-1' },
      });
    });

    it('debería lanzar error si la reseña no existe', async () => {
      await expect(service.findClaseById('no-existe')).rejects.toMatchObject({
        message: 'La reseña no fue encontrada.',
        type: BusinessError.NOT_FOUND,
      });
    });
  });
});
