import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActividadEntity } from './actividad.entity';
import { ActividadService } from './actividad.service';
import { faker } from '@faker-js/faker';

describe('ActividadService', () => {
  let service: ActividadService;
  let actividadRepository: Repository<ActividadEntity>;

  const mockActividadRepository = {
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActividadService,
        {
          provide: getRepositoryToken(ActividadEntity),
          useValue: mockActividadRepository,
        },
      ],
    }).compile();

    service = module.get<ActividadService>(ActividadService);
    actividadRepository = module.get<Repository<ActividadEntity>>(getRepositoryToken(ActividadEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
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

      mockActividadRepository.save.mockResolvedValue({
        ...actividad,
        id: faker.string.uuid(),
      });

      const result = await service.crearActividad(actividad);
      expect(result).toHaveProperty('id');
      expect(result.titulo).toBe(actividad.titulo);
      expect(result.estado).toBe('0');
      expect(mockActividadRepository.save).toHaveBeenCalledWith(actividad);
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
    it('debería cambiar el estado a "1" (cerrada) si el 80% del cupo está lleno', async () => {
      const actividad = {
        id: '1',
        titulo: 'Actividad válida para cambiar estado',
        estado: '0',
        cupoMaximo: 10,
        fecha: '2025-05-20',
        estudiantes: Array(8).fill({}),
        resenas: [],
      };

      mockActividadRepository.findOne.mockResolvedValue(actividad);
      mockActividadRepository.save.mockImplementation((ent) => Promise.resolve(ent));

      const resultado = await service.cambiarEstado('1', '1');

      expect(resultado.estado).toBe('1');
      expect(mockActividadRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['estudiantes'],
      });
      expect(mockActividadRepository.save).toHaveBeenCalled();
    });

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

      mockActividadRepository.findOne.mockResolvedValue(actividad);

      await expect(service.cambiarEstado('1', '1')).rejects.toHaveProperty(
        'message',
        'Solo se puede cerrar si al menos el 80% del cupo está ocupado.'
      );
    });

    it('debería cambiar el estado a "2" (finalizada) si el cupo está lleno', async () => {
      const actividad = {
        id: '1',
        titulo: 'Actividad válida para cambiar estado',
        estado: '1',
        cupoMaximo: 10,
        fecha: '2025-05-20',
        estudiantes: Array(10).fill({}),
        resenas: [],
      };

      mockActividadRepository.findOne.mockResolvedValue(actividad);
      mockActividadRepository.save.mockImplementation((ent) => Promise.resolve(ent));

      const resultado = await service.cambiarEstado('1', '2');

      expect(resultado.estado).toBe('2');
      expect(mockActividadRepository.save).toHaveBeenCalled();
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

      mockActividadRepository.findOne.mockResolvedValue(actividad);

      await expect(service.cambiarEstado('1', '2')).rejects.toHaveProperty(
        'message',
        'Solo se puede finalizar si el cupo está completamente lleno.'
      );
    });

    it('debería lanzar error si la actividad no existe', async () => {
      mockActividadRepository.findOne.mockResolvedValue(null);

      await expect(service.cambiarEstado('no-existe', '1')).rejects.toHaveProperty(
        'message',
        'La actividad con el id dado no fue encontrada.'
      );
    });

    it('debería retornar la misma actividad si el estado no cambia', async () => {
      const actividad = {
        id: '1',
        titulo: 'Actividad válida',
        estado: '0',
        cupoMaximo: 10,
        fecha: '2025-05-20',
        estudiantes: [],
        resenas: [],
      };

      mockActividadRepository.findOne.mockResolvedValue(actividad);

      const resultado = await service.cambiarEstado('1', '0');

      expect(resultado).toBe(actividad);
    });
  });

  describe('findAllActividadesByDate', () => {
    it('debería retornar actividades para una fecha dada', async () => {
      const actividades = [
        { id: '1', fecha: '2025-05-20', titulo: 'Act 1' },
        { id: '2', fecha: '2025-05-20', titulo: 'Act 2' },
      ];

      mockActividadRepository.find.mockResolvedValue(actividades);

      const resultado = await service.findAllActividadesByDate('2025-05-20');

      expect(resultado.length).toBe(2);
      expect(resultado[0].fecha).toBe('2025-05-20');
      expect(mockActividadRepository.find).toHaveBeenCalledWith({ where: { fecha: '2025-05-20' } });
    });

    it('debería retornar arreglo vacío si no hay actividades para la fecha', async () => {
      mockActividadRepository.find.mockResolvedValue([]);

      const resultado = await service.findAllActividadesByDate('2025-01-01');

      expect(resultado).toEqual([]);
    });
  });
});
