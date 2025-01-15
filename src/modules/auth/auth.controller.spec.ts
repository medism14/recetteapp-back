import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { BadRequestException } from '@nestjs/common';
import { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  const mockUser = {
    id: 1,
    email: 'test@test.com',
    password: 'hashedPassword123',
    firstName: 'John',
    lastName: 'Doe',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const createUserDto = {
      email: 'test@test.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
    };

    it('Enregistre un utilisateur avec succès', async () => {
      mockAuthService.register.mockResolvedValue({
        accessToken: 'token123',
        user: mockUser,
      });

      const result = await controller.register(createUserDto, mockResponse);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        'token123',
        expect.any(Object)
      );
      expect(result.statusCode).toBe(201);
      expect(result.data).toEqual(expect.objectContaining({
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
      }));
    });

    it('Lance une erreur si des champs sont manquants', async () => {
      const invalidDto = {
        email: 'test@test.com',
        password: 'password123',
      };

      await expect(controller.register(invalidDto as any, mockResponse))
        .rejects
        .toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@test.com',
      password: 'password123',
    };

    it('Connecte un utilisateur avec succès', async () => {
      mockAuthService.login.mockResolvedValue({
        accessToken: 'token123',
        user: mockUser,
      });

      const result = await controller.login(loginDto, mockResponse);

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'access_token',
        'token123',
        expect.any(Object)
      );
      expect(result.statusCode).toBe(200);
      expect(result.data).toEqual(expect.objectContaining({
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
      }));
    });

    it('Lance une erreur si email ou mot de passe manquant', async () => {
      const invalidDto = {
        email: 'test@test.com',
      };

      await expect(controller.login(invalidDto as any, mockResponse))
        .rejects
        .toThrow(BadRequestException);
    });
  });

  describe('logout', () => {
    it('Déconnecte un utilisateur avec succès', async () => {
      const result = await controller.logout(mockResponse);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        'access_token',
        expect.any(Object)
      );
      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Déconnexion réussie');
    });
  });
});
