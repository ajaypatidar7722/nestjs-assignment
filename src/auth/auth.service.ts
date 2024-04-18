import { HashingService } from '@app/hashing';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private hashingService: HashingService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);

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

    const { password, ...restUser } = user;
    return restUser;
  }

  async register(email: string, password: string) {
    return this.usersService.register(email, password);
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
