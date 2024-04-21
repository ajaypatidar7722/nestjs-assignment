import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { CatEntity } from '../common/entities/cat.entity';
import { UserEntity } from '../common/entities/user.entity';
import { CursorPaginatedResult } from '../common/interfaces/common.interfaces';
import { Cat } from './interfaces/cat.interface';

@Injectable()
export class CatsService {
  constructor(
    @InjectRepository(CatEntity)
    private repository: Repository<CatEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>
  ) {}

  create(cat: Cat) {
    const entity = this.repository.create(cat);

    return this.repository.save(entity);
  }

  async update(id: number, cat: Cat) {
    const result = await this.repository.update({ id }, cat);
    if (result.affected === 0) {
      throw new NotFoundException('cat not found');
    }

    return this.repository.findOneBy({ id });
  }

  async markCatAsFavorite(currentUser: UserEntity, catId: number) {
    const cat = await this.findById(catId);

    const user = await this.userRepository.findOneOrFail({
      where: { id: currentUser.id },
      relations: { favorites: true },
    });

    const favorites = user.favorites || [];

    if (
      favorites.length &&
      favorites.find((favoriteCat) => favoriteCat.id === catId)
    ) {
      throw new BadRequestException('cat already marked as favorite');
    }
    user.favorites = [...favorites, cat];

    return this.userRepository.save(user);
  }

  async markCatAsUnfavorite(currentUser: UserEntity, catId: number) {
    // validate cat's existense
    await this.findById(catId);

    const user = await this.userRepository.findOneOrFail({
      where: { id: currentUser.id },
      relations: { favorites: true },
    });

    if (!user.favorites.find((favoriteCat) => favoriteCat.id === catId)) {
      throw new BadRequestException('cat is not yet marked as favorite');
    } else {
      user.favorites = user.favorites.filter(
        (favoriteCat) => favoriteCat.id !== catId
      );
      return this.userRepository.save(user);
    }
  }

  async delete(id: number) {
    const result = await this.repository.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException('cat not found');
    }
  }

  async findById(id: number): Promise<CatEntity> {
    return this.repository.findOneByOrFail({ id });
  }

  /**
   * This should come from the cache for improved performance
   */
  async countCats(): Promise<number> {
    return this.repository.count();
  }

  async findAllPaginated(
    prevCusror: number,
    limit: number
  ): Promise<CursorPaginatedResult<Cat>> {
    const cats = await this.repository.find({
      where: {
        id: MoreThanOrEqual(prevCusror),
      },
      take: limit + 1,
      order: {
        id: 'ASC',
      },
    });

    const total = await this.countCats();

    if (cats.length <= limit) {
      return {
        items: cats,
        nextCursor: null,
        hasNext: false,
        total,
      };
    }

    const lastCat = cats.pop();
    const hasNext = !!lastCat;
    const nextCursor = lastCat.id;

    return {
      items: cats,
      nextCursor,
      hasNext,
      total,
    };
  }
}
