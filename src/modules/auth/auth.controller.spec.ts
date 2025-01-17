import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { BadRequestException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  // Définition d'un utilisateur mock pour les tests
  const mockUser = {
    id: 1,
    email: 'test@test.com',
    password: 'hashedPassword123',
    firstName: 'John',
    lastName: 'Doe',
  };

  // Configuration des mocks pour le service AuthService
  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  // Création d'une réponse mock pour les tests
  const mockResponse = {
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis(),
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
      // Configuration du mock pour simuler une réussite de l'enregistrement
      mockAuthService.register.mockResolvedValue({
        accessToken: 'mock.jwt.token',
        user: mockUser,
      });

      const result = await controller.register(registerDto, mockResponse);

      // Vérification du résultat attendu
      expect(result).toEqual({
        data: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
        },
      });
    });

    it('devrait rejeter si des champs requis sont manquants', async () => {
      // Test de rejet avec un DTO invalide
      const invalidDto = {
        email: 'test@test.com',
        password: 'password123',
        // firstName et lastName manquants
      };

      await expect(
        controller.register(invalidDto as any, mockResponse)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@test.com',
      password: 'password123',
    };

    it('devrait connecter l\'utilisateur avec succès', async () => {
      // Configuration du mock pour simuler une réussite de la connexion
      mockAuthService.login.mockResolvedValue({
        accessToken: 'mock.jwt.token',
        user: mockUser,
      });

      const result = await controller.login(loginDto, mockResponse);

      // Vérification du résultat attendu
      expect(result).toEqual({
        data: {
          id: mockUser.id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
        },
      });
    });

    it('devrait rejeter si email ou mot de passe manquant', async () => {
      // Test de rejet avec un DTO invalide
      const invalidDto = {
        email: 'test@test.com',
        // password manquant
      };

      await expect(
        controller.login(invalidDto as any, mockResponse)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('logout', () => {
    it('devrait déconnecter l\'utilisateur avec succès', async () => {
      const result = await controller.logout(mockResponse);

      // Vérification du résultat attendu
      expect(result).toEqual({
        statusCode: 200,
        message: 'Déconnexion réussie',
      });
    });
  });

});
