import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { BadRequestException, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let prismaService: PrismaService;
  let usersService: UsersService;

  const mockUser = {
    id: 1,
    email: 'test@test.com',
    password: 'hashedPassword123',
    firstName: 'John',
    lastName: 'Doe',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      create: jest.fn(),
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

    it('Crée un compte avec succès', async () => {
      mockUsersService.getUserByEmail.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('token123');

      const result = await service.register(createUserDto);

      expect(result).toEqual({
        accessToken: 'token123',
        user: mockUser,
      });
    });

    it('Lance une erreur si le mot de passe est trop court', async () => {
      await expect(service.register({ ...createUserDto, password: '12345' }))
        .rejects
        .toThrow(BadRequestException);
    });

    it('Lance une erreur si l\'email existe déjà', async () => {
      mockUsersService.getUserByEmail.mockResolvedValue("test@test.com");
      mockUsersService.getUserByEmail.mockResolvedValue(mockUser);

      await expect(service.register(createUserDto))
        .rejects
        .toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@test.com',
      password: 'password123',
    };

    it('Connecte l\'utilisateur avec succès', async () => {
      mockUsersService.getUserByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
      mockJwtService.sign.mockReturnValue('token123');   

      const result = await service.login(loginDto);

      expect(result).toEqual({
        accessToken: 'token123',
        user: mockUser,
      });
    });

    it('Lance une erreur si l\'utilisateur n\'existe pas', async () => {
      mockUsersService.getUserByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto))
        .rejects
        .toThrow(NotFoundException);
    });

    it('Lance une erreur si le mot de passe est incorrect', async () => {
      mockUsersService.getUserByEmail.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      await expect(service.login(loginDto))
        .rejects
        .toThrow(UnauthorizedException);
    });
  });

  describe('isTokenValid', () => {
    it('Vérifie un token valide', async () => {
      mockJwtService.verify.mockReturnValue({ email: 'test@test.com' });
      mockUsersService.getUserByEmail.mockResolvedValue(mockUser);

      const result = await service.isTokenValid('validToken123');

      expect(result).toEqual(mockUser);
    });

    it('Lance une erreur si le token est invalide', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw { name: 'JsonWebTokenError' };
      });

      await expect(service.isTokenValid('invalidToken'))
        .rejects
        .toThrow(UnauthorizedException);
    });

    it('Lance une erreur si le token est expiré', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw { name: 'TokenExpiredError' };
      });

      await expect(service.isTokenValid('expiredToken'))
        .rejects
        .toThrow(UnauthorizedException);
    });
  });
});
