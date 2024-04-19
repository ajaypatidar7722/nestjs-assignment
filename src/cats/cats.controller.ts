import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Logger,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { CursorPaginatedResult } from '..//common/interfaces/common.interfaces';
import { Roles } from '../common/decorators/roles.decorator';
import { ParseIntPipe } from '../common/pipes/parse-int.pipe';
import { UserRole } from '../users/interfaces/users.interface';
import { CatsService } from './cats.service';
import { CreateCatDto } from './dto/create-cat.dto';
import { Cat } from './interfaces/cat.interface';

@Controller('cats')
export class CatsController {
  private readonly logger = new Logger(CatsController.name);

  constructor(private readonly catsService: CatsService) {}

  @Post()
  @Roles([UserRole.ADMIN])
  async create(@Body() createCatDto: CreateCatDto) {
    console.log(createCatDto);
    this.catsService.create(createCatDto);
  }

  @Public()
  @Get()
  async findAll(
    @Query('cursor', new DefaultValuePipe(0), ParseIntPipe) cursor: number,
    @Query('limit', new DefaultValuePipe(16), ParseIntPipe) limit: number
  ): Promise<CursorPaginatedResult<Cat>> {
    this.logger.debug(
      `Retrieving cats with cursor: ${cursor} and limit: ${limit}`
    );
    return this.catsService.findAllPaginated(cursor, limit);
  }

  @Public()
  @Get(':id')
  async findOne(
    @Param('id', new ParseIntPipe())
    id: number
  ): Promise<Cat> {
    if (!id) {
      throw new BadRequestException('id must be a number');
    }

    this.logger.debug(`Retrieving cat with id: ${id}`);
    return this.catsService.findById(id);
  }
}
