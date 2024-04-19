import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { CatEntity } from '../common/entities/cat.entity';
import { CursorPaginatedResult } from '../common/interfaces/common.interfaces';
import { Cat } from './interfaces/cat.interface';

@Injectable()
export class CatsService {
  constructor(
    @InjectRepository(CatEntity)
    private repository: Repository<CatEntity>
  ) {}

  private readonly cats: Cat[] = [];

  create(cat: Cat) {
    this.cats.push(cat);
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
