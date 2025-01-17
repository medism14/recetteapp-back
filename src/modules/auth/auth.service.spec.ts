import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { UsersService } from '../users/users.service';
import {
  ConflictException,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let prismaService: PrismaService;
  let usersService: UsersService;

  // Définition d'un utilisateur mock pour les tests
  const mockUser = {
    id: 1,
    email: 'test@test.com',
    password: 'hashedPassword123',
    firstName: 'John',
    lastName: 'Doe',
  };

  // Configuration des mocks pour les services dépendants
  const mockJwtService = {
    sign: jest.fn(() => 'mock.jwt.token'),
    verify: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockUsersService = {
    getUserByEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    prismaService = module.get<PrismaService>(PrismaService);
    usersService = module.get<UsersService>(UsersService);

    // Réinitialisation des mocks entre chaque test pour éviter les interférences
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@test.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('devrait créer un nouvel utilisateur avec succès', async () => {
      // Configuration des mocks pour simuler une réussite
      mockUsersService.getUserByEmail.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.resolve('hashedPassword123'));

      const result = await service.register(registerDto);

      expect(result).toEqual({
        accessToken: 'mock.jwt.token',
        user: mockUser,
      });
      expect(mockUsersService.getUserByEmail).toHaveBeenCalledWith(
        registerDto.email,
      );
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it('devrait rejeter si le mot de passe est trop court', async () => {
      // Test de rejet avec un mot de passe trop court
      const invalidDto = { ...registerDto, password: '12345' };

      await expect(service.register(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("devrait rejeter si l'email existe déjà", async () => {
      // Test de rejet avec un email déjà existant
      mockUsersService.getUserByEmail.mockResolvedValue(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@test.com',
      password: 'password123',
    };

    it("devrait connecter l'utilisateur avec succès", async () => {
      // Configuration des mocks pour simuler une réussite
      mockUsersService.getUserByEmail.mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));

      const result = await service.login(loginDto);

      expect(result).toEqual({
        accessToken: 'mock.jwt.token',
        user: mockUser,
      });
    });

    it("devrait rejeter si l'utilisateur n'existe pas", async () => {
      // Test de rejet avec un utilisateur inexistant
      mockUsersService.getUserByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(NotFoundException);
    });

    it('devrait rejeter si le mot de passe est incorrect', async () => {
      // Test de rejet avec un mot de passe incorrect
      mockUsersService.getUserByEmail.mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
