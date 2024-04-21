import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';

import { CatEntity } from '../common/entities/cat.entity';
import { UserEntity } from '../common/entities/user.entity';
import { CatsService } from './cats.service';

describe('CatsService', () => {
  let service: CatsService;
  let catRepository: Repository<CatEntity>;
  let userRepository: Repository<UserEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatsService,
        {
          provide: getRepositoryToken(CatEntity),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<CatsService>(CatsService);
    catRepository = module.get<Repository<CatEntity>>(
      getRepositoryToken(CatEntity)
    );
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity)
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(catRepository).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a cat', async () => {
      const cat = { name: 'TestCat', breed: 'TestBreed', age: 3 };
      const savedCat = { ...cat, id: 1 };

      catRepository.create = jest.fn().mockReturnValue(savedCat);
      catRepository.save = jest.fn().mockResolvedValue(savedCat);

      expect(await service.create(cat)).toEqual(savedCat);
    });
  });

  describe('update', () => {
    it('should successfully update a cat', async () => {
      const cat = { id: 1, name: 'TestCat', breed: 'TestBreed', age: 3 };
      const updatedCat = { ...cat, name: 'UpdatedCat' };

      catRepository.update = jest.fn().mockResolvedValue({ affected: 1 });
      catRepository.findOneBy = jest.fn().mockResolvedValue(updatedCat);

      expect(await service.update(cat.id, updatedCat)).toEqual(updatedCat);
    });

    it('should throw NotFoundException if cat does not exist', async () => {
      catRepository.update = jest.fn().mockResolvedValue({ affected: 0 });
      await expect(
        service.update(1, { name: 'TestCat', breed: 'TestBreed', age: 3 })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('markCatAsFavorite', () => {
    it('should successfully mark a cat as favorite', async () => {
      const cat = { id: 1, name: 'TestCat', breed: 'TestBreed', age: 3 };
      const user = { id: 1, favorites: [] };

      catRepository.findOneByOrFail = jest.fn().mockResolvedValue(cat);
      userRepository.findOneOrFail = jest.fn().mockResolvedValue(user);
      userRepository.save = jest
        .fn()
        .mockResolvedValue({ ...user, favorites: [cat] });

      await service.markCatAsFavorite(user as UserEntity, cat.id);

      expect(userRepository.save).toHaveBeenCalledWith({
        ...user,
        favorites: [cat],
      });
    });

    it("should successfully mark a cat as favorite if user don't have a favorite entry previously", async () => {
      const cat = { id: 1, name: 'TestCat', breed: 'TestBreed', age: 3 };
      const user = { id: 1, favorites: null };

      catRepository.findOneByOrFail = jest.fn().mockResolvedValue(cat);
      userRepository.findOneOrFail = jest.fn().mockResolvedValue(user);
      userRepository.save = jest
        .fn()
        .mockResolvedValue({ ...user, favorites: [cat] });

      await service.markCatAsFavorite(user as UserEntity, cat.id);

      expect(userRepository.save).toHaveBeenCalledWith({
        ...user,
        favorites: [cat],
      });
    });

    it('should throw BadRequestException if cat is already a favorite', async () => {
      const cat = { id: 1, name: 'TestCat', breed: 'TestBreed', age: 3 };
      const user = { id: 1, favorites: [{ id: cat.id }] };

      catRepository.findOneByOrFail = jest.fn().mockResolvedValue(cat);
      userRepository.findOneOrFail = jest.fn().mockResolvedValue(user);

      await expect(
        service.markCatAsFavorite(user as UserEntity, cat.id)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('markCatAsUnfavorite', () => {
    it('should successfully mark a cat as unfavorite', async () => {
      const catId = 1;
      const user = { id: 1, favorites: [{ id: catId }] };

      catRepository.findOneByOrFail = jest.fn().mockResolvedValue(null);
      userRepository.findOneOrFail = jest.fn().mockResolvedValue(user);
      userRepository.save = jest
        .fn()
        .mockResolvedValue({ ...user, favorites: [] });

      await service.markCatAsUnfavorite(user as UserEntity, catId);

      expect(userRepository.save).toHaveBeenCalledWith({
        ...user,
        favorites: [],
      });
    });

    it('should throw BadRequestException if cat is not yet marked as favorite', async () => {
      const catId = 1;
      const user = { id: 1, favorites: [] };

      catRepository.findOneByOrFail = jest.fn().mockResolvedValue({ id: 1 });
      userRepository.findOneOrFail = jest.fn().mockResolvedValue(user);

      await expect(
        service.markCatAsUnfavorite(user as UserEntity, catId)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should successfully delete a cat', async () => {
      const catId = 1;
      catRepository.delete = jest.fn().mockResolvedValue({ affected: 1 });

      await expect(service.delete(catId)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException if cat does not exist', async () => {
      const catId = 1;
      catRepository.delete = jest.fn().mockResolvedValue({ affected: 0 });

      await expect(service.delete(catId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById', () => {
    it('should return a cat entity if found', async () => {
      const cat = { id: 1, name: 'TestCat' };
      catRepository.findOneByOrFail = jest.fn().mockResolvedValue(cat);
      await expect(service.findById(1)).resolves.toEqual(cat);
    });

    it('should throw EntityNotFoundError if cat does not exist', async () => {
      const catId = 1;
      catRepository.findOneByOrFail = jest
        .fn()
        .mockRejectedValue(new EntityNotFoundError(CatEntity, { id: catId }));
      await expect(service.findById(catId)).rejects.toThrow(
        EntityNotFoundError
      );
    });
  });

  describe('countCats', () => {
    it('should return the number of cats', async () => {
      catRepository.count = jest.fn().mockResolvedValue(10);
      await expect(service.countCats()).resolves.toEqual(10);
    });
  });

  describe('findAllPaginated', () => {
    it('should return a paginated result', async () => {
      const cats = [{ id: 1 }, { id: 2 }];
      catRepository.find = jest.fn().mockResolvedValue(cats);
      catRepository.count = jest.fn().mockResolvedValue(2);

      const result = await service.findAllPaginated(0, 1);
      expect(result.items).toHaveLength(1); // Assuming limit is 1 for pagination
      expect(result.total).toEqual(2);
    });

    it('should return an empty result if no cats are found', async () => {
      catRepository.find = jest.fn().mockResolvedValue([]);
      catRepository.count = jest.fn().mockResolvedValue(0);

      const result = await service.findAllPaginated(0, 1);
      expect(result.items).toHaveLength(0);
      expect(result.total).toEqual(0);
    });

    it('should return the correct next cursor and hasNext values', async () => {
      const cats = [{ id: 1 }, { id: 2 }, { id: 3 }];
      catRepository.find = jest.fn().mockResolvedValue(cats);
      catRepository.count = jest.fn().mockResolvedValue(3);

      const result = await service.findAllPaginated(1, 2);
      expect(result.items).toHaveLength(2);
      expect(result.nextCursor).toEqual(3);
      expect(result.hasNext).toBe(true);
    });

    it('should return the correct next cursor and hasNext values when there are fewer cats than the limit', async () => {
      const cats = [{ id: 1 }, { id: 2 }];
      catRepository.find = jest.fn().mockResolvedValue(cats);
      catRepository.count = jest.fn().mockResolvedValue(2);

      const result = await service.findAllPaginated(1, 3);
      expect(result.items).toHaveLength(2);
      expect(result.nextCursor).toBeNull();
      expect(result.hasNext).toBe(false);
    });

    it('should return the correct next cursor and hasNext values there are exactly cats as mentioned in the limit', async () => {
      const cats = [{ id: 1 }, { id: 2 }];
      catRepository.find = jest.fn().mockResolvedValue(cats);
      catRepository.count = jest.fn().mockResolvedValue(2);

      const result = await service.findAllPaginated(1, 2);
      expect(result.items).toHaveLength(2);
      expect(result.nextCursor).toBeNull();
      expect(result.hasNext).toBe(false);
    });
  });
});
