import { HashingService } from '@app/hashing';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../common/entities/user.entity';

import { UserRole } from './interfaces/users.interface';

@Injectable()
export class UsersService {
  private logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
    private readonly hashingService: HashingService
  ) {}

  async register(email: string, password: string) {
    this.logger.debug(`Registering new user: ${email}`);

    const user = new UserEntity();
    user.email = email;
    user.password = await this.hashingService.hashPassword(password);
    user.role = UserRole.ADMIN;

    try {
      return this.repository.save(user);
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Invalid email or password');
    }
  }
}
