import {
  BadRequestException,
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserEntity } from '../common/entities/user.entity';
import {
  CursorPaginatedResult,
  RequestUser,
} from '../common/interfaces/common.interfaces';
import { ParseIntPipe } from '../common/pipes/parse-int.pipe';
import { UserRole } from '../users/interfaces/users.interface';
import { CatsService } from './cats.service';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { Cat } from './interfaces/cat.interface';

@Controller('cats')
export class CatsController {
  private readonly logger = new Logger(CatsController.name);

  constructor(private readonly catsService: CatsService) {}

  @Post()
  @Roles([UserRole.ADMIN])
  async create(@Body() createCatDto: CreateCatDto) {
    this.logger.debug(
      `Creating cat with payload: ${JSON.stringify(createCatDto)}`
    );

    return this.catsService.create(createCatDto);
  }

  @Put(':id')
  @Roles([UserRole.ADMIN])
  async update(
    @Param('id', new ParseIntPipe())
    id: number,
    @Body() updateCatDto: UpdateCatDto
  ) {
    this.logger.debug(`Updating cat with id: ${id}`);

    // additional validation since all the fields in the dto are optional
    if (!Object.keys(updateCatDto).length) {
      throw new BadRequestException('request object must be provided');
    }

    return this.catsService.update(id, updateCatDto);
  }

  @Delete(':id')
  @Roles([UserRole.ADMIN])
  async delete(
    @Param('id', new ParseIntPipe())
    id: number
  ) {
    this.logger.debug(`Deleting cat with id: ${id}`);

    return this.catsService.delete(id);
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
    this.logger.debug(`Retrieving cat with id: ${id}`);
    return this.catsService.findById(id);
  }

  @Post(':id/favorite')
  async markCatAsFavorite(
    @Param('id', new ParseIntPipe())
    catId: number,
    @CurrentUser() currentUser: RequestUser
  ): Promise<void> {
    this.logger.debug(
      `Adding cat with id: ${catId} as favorite for user: ${currentUser.id}`
    );
    await this.catsService.markCatAsFavorite(currentUser as UserEntity, catId);
  }

  @Post(':id/unfavorite')
  async markCatAsUnfavorite(
    @Param('id', new ParseIntPipe())
    catId: number,
    @CurrentUser() currentUser: RequestUser
  ): Promise<void> {
    this.logger.debug(
      `Removing cat with id: ${catId} from favorite of user: ${currentUser.id}`
    );
    await this.catsService.markCatAsUnfavorite(
      currentUser as UserEntity,
      catId
    );
  }
}
