import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResenaService } from './resena.service';
import { ResenaEntity } from './resena.entity';
import { BusinessError } from '../shared/errors/business-errors';

describe('ResenaService', () => {
  let service: ResenaService;
  let resenaRepository: Repository<ResenaEntity>;

  const mockResenaRepository = {
    save: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResenaService,
        {
          provide: getRepositoryToken(ResenaEntity),
          useValue: mockResenaRepository,
        },
        {
          provide: getRepositoryToken(require('../actividad/actividad.entity').ActividadEntity),
          useValue: { findOne: jest.fn(() => ({ id: 'actividad-1', estado: '2', estudiantes: [{ id: 'estudiante-1' }] })) },
        },
        {
          provide: getRepositoryToken(require('../estudiante/estudiante.entity').EstudianteEntity),
          useValue: { findOne: jest.fn(() => ({ id: 'estudiante-1' })) },
        },
      ],
    }).compile();

    service = module.get<ResenaService>(ResenaService);
    resenaRepository = module.get<Repository<ResenaEntity>>(getRepositoryToken(ResenaEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('agregarResena', () => {
    it('debería guardar una reseña correctamente', async () => {
      const resena = new ResenaEntity();

      mockResenaRepository.save.mockImplementation(r => Promise.resolve({ ...r, id: 'resena-1' }));

      const result = await service.agregarResena(resena, 'actividad-1', 'estudiante-1');

      expect(mockResenaRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 'resena-1');
      expect(result.actividad.id).toBe('actividad-1');
      expect(result.estudiante.id).toBe('estudiante-1');
    });
  });

  describe('findClaseById', () => {
    it('debería retornar una reseña existente', async () => {
      const resena = { id: 'resena-1', actividad: { id: 'actividad-1' }, estudiante: { id: 'estudiante-1' } };
      mockResenaRepository.findOne.mockResolvedValue(resena);

      const result = await service.findClaseById('resena-1');

      expect(mockResenaRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'resena-1' },
        relations: ['actividad', 'estudiante'],
      });
      expect(result).toEqual(resena);
    });

    it('debería lanzar error si la reseña no existe', async () => {
      mockResenaRepository.findOne.mockResolvedValue(null);

      await expect(service.findClaseById('no-existe')).rejects.toMatchObject({
        message: 'La reseña no fue encontrada.',
        type: BusinessError.NOT_FOUND,
      });
    });
  });
});
