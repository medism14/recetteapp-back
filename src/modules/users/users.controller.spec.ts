import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Request } from 'express';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashedPassword',
  };

  const mockUsersService = {
    getUserByEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUser', () => {
    it("devrait retourner les informations de l'utilisateur depuis la requête", async () => {
      const mockRequest = {
        user: mockUser,
      } as unknown as Request;

      const result = await controller.getUser(mockRequest);

      expect(result).toEqual(mockUser);
    });
  });

  describe('getUserByEmail', () => {
    it('devrait retourner un utilisateur quand on fournit un email valide', async () => {
      mockUsersService.getUserByEmail.mockResolvedValue(mockUser);

      const result = await controller.getUserByEmail('test@example.com');

      expect(result).toEqual(mockUser);
    });

    it("devrait retourner null si l'email n'existe pas", async () => {
      mockUsersService.getUserByEmail.mockResolvedValue(null);

      const result = await controller.getUserByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });
});
