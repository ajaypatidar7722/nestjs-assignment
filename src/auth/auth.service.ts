import { HashingService } from '@app/hashing';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../common/interfaces/common.interfaces';
import { User } from '../users/interfaces/users.interface';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private hashingService: HashingService
  ) {}

  async validateUser(email: string, pass: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      return null;
    }

    const valid = await this.hashingService.comparePassword(
      pass,
      user.password
    );

    if (!valid) {
      return null;
    }

    return user;
  }

  async register(email: string, password: string): Promise<User> {
    return this.usersService.register(email, password);
  }

  async login(payload: JwtPayload) {
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
