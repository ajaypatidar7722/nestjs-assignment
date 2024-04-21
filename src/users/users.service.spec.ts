import { HashingService } from '@app/hashing';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from '../common/entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: Repository<UserEntity>;
  let mockHashingService: HashingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
        {
          provide: HashingService,
          useValue: {
            hashPassword: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    mockRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity)
    );
    mockHashingService = module.get<HashingService>(HashingService);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      mockHashingService.hashPassword = jest
        .fn()
        .mockReturnValue('hashedPassword');
      mockRepository.save = jest.fn().mockResolvedValue(new UserEntity());

      await expect(service.register(email, password)).resolves.toBeDefined();
      expect(mockHashingService.hashPassword).toHaveBeenCalledWith(password);
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email,
          password: 'hashedPassword',
          role: 'user',
        })
      );
    });

    it('should throw a BadRequestException if email or password is invalid', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      mockHashingService.hashPassword = jest
        .fn()
        .mockReturnValue('hashedPassword');
      mockRepository.save = jest
        .fn()
        .mockRejectedValue(
          new BadRequestException('Invalid email or password')
        );

      await expect(service.register(email, password)).rejects.toThrowError(
        BadRequestException
      );
    });

    it('should throw a BadRequestException user repository query fails to save user', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      mockHashingService.hashPassword = jest
        .fn()
        .mockReturnValue('hashedPassword');
      mockRepository.save = jest.fn().mockImplementation(() => {
        throw new BadRequestException('Invalid email or password');
      });

      await expect(service.register(email, password)).rejects.toThrowError(
        BadRequestException
      );
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const email = 'test@example.com';
      const user = new UserEntity();

      mockRepository.findOne = jest.fn().mockResolvedValue(user);

      const result = await service.findByEmail(email);

      expect(result).toBe(user);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email } });
    });
  });
});
