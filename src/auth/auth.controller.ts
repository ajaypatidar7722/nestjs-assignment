import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { LocalAuthGuard } from '../common/guards/local-auth.guard';
import {
  ExtendedLoginRequest,
  ExtendedRequest,
} from '../common/interfaces/common.interfaces';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  async registerUser(@Body() { email, password }: RegisterUserDto) {
    const user = await this.authService.register(email, password);
    return user;
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: ExtendedLoginRequest) {
    return this.authService.login(req.user);
  }

  @Get('me')
  async me(@Request() req: ExtendedRequest) {
    return req.user;
  }
}
