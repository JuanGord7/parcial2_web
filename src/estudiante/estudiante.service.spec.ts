import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstudianteEntity } from './estudiante.entity';
import { EstudianteService } from './estudiante.service';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';

describe('EstudianteService', () => {
  let service: EstudianteService;
  let estudianteRepository: Repository<EstudianteEntity>;
  let estudiantesList: EstudianteEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [EstudianteService],
    }).compile();

    service = module.get<EstudianteService>(EstudianteService);
    estudianteRepository = module.get<Repository<EstudianteEntity>>(getRepositoryToken(EstudianteEntity));

    await seedDatabase();
  });

  const seedDatabase = async () => {
    await estudianteRepository.clear();
    estudiantesList = [];

    for (let i = 0; i < 5; i++) {
      const estudiante = await estudianteRepository.save({
        nombre: faker.person.firstName(),
        cedula: parseInt(faker.string.numeric(10)),
        correo: faker.internet.email(),
        programa: faker.lorem.word(),
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

  describe('crearEstudiante', () => {
    it('debería crear un estudiante válido', async () => {
      const estudiante: EstudianteEntity = {
        id: '',
        nombre: faker.person.firstName(),
        correo: 'test@example.com',
        semestre: 5,
        cedula: parseInt(faker.string.numeric(10)),
        programa: 'Ingeniería de Sistemas',
        actividades: [],
        resenas: [],
      };
      const newEstudiante = await service.crearEstudiante(estudiante);
      expect(newEstudiante).not.toBeNull();
      expect(newEstudiante.correo).toBe('test@example.com');
      expect(newEstudiante.semestre).toBe(5);
    });

    it('debería lanzar error por correo inválido', async () => {
      const estudiante: EstudianteEntity = {
        id: '',
        nombre: faker.person.firstName(),
        correo: 'correo-invalido',
        semestre: 5,
        cedula: parseInt(faker.string.numeric(10)),
        programa: 'Ingeniería de Sistemas',
        actividades: [],
        resenas: [],
      };

      await expect(service.crearEstudiante(estudiante)).rejects.toHaveProperty('message', 'El correo tiene que ser válido');
    });

    it('debería lanzar error por semestre inválido', async () => {
      const estudiante: EstudianteEntity = {
        id: '',
        nombre: faker.person.firstName(),
        correo: 'valid@example.com',
        semestre: 20,
        cedula: parseInt(faker.string.numeric(10)),
        programa: 'Ingeniería de Sistemas',
        actividades: [],
        resenas: [],
      };

      await expect(service.crearEstudiante(estudiante)).rejects.toHaveProperty('message', 'El semestre debe estar entre 1 y 10');
    });
  });
});
