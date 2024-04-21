import { HashingService } from '@app/hashing';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let hashingService: HashingService;

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      register: jest.fn(),
    };
    const mockJwtService = {
      sign: jest.fn(),
    };
    const mockHashingService = {
      comparePassword: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: HashingService,
          useValue: mockHashingService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    hashingService = module.get<HashingService>(HashingService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return a user object when the user is found and the password is correct', async () => {
      const userEmail = 'test@example.com';
      const userPassword = 'correctPassword';
      const mockUser = { email: userEmail, password: 'hashedPassword' };

      usersService.findByEmail = jest.fn().mockResolvedValue(mockUser);
      hashingService.comparePassword = jest.fn().mockResolvedValue(true);

      const result = await authService.validateUser(userEmail, userPassword);

      expect(usersService.findByEmail).toHaveBeenCalledWith(userEmail);
      expect(hashingService.comparePassword).toHaveBeenCalledWith(
        userPassword,
        mockUser.password
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null when the user is not found', async () => {
      usersService.findByEmail = jest.fn().mockResolvedValue(null);

      const result = await authService.validateUser(
        'nonexistent@example.com',
        'anyPassword'
      );

      expect(result).toBeNull();
    });

    it('should return null when the password is incorrect', async () => {
      const userEmail = 'test@example.com';
      const userPassword = 'incorrectPassword';
      const mockUser = { email: userEmail, password: 'hashedPassword' };

      usersService.findByEmail = jest.fn().mockResolvedValue(mockUser);
      hashingService.comparePassword = jest.fn().mockResolvedValue(false);

      const result = await authService.validateUser(userEmail, userPassword);

      expect(hashingService.comparePassword).toHaveBeenCalledWith(
        userPassword,
        mockUser.password
      );
      expect(result).toBeNull();
    });
  });

  describe('register', () => {
    it('should return a user object when registration is successful', async () => {
      const userEmail = 'newuser@example.com';
      const userPassword = 'newPassword';
      const mockUser = { email: userEmail, password: userPassword };

      usersService.register = jest.fn().mockResolvedValue(mockUser);

      const result = await authService.register(userEmail, userPassword);

      expect(usersService.register).toHaveBeenCalledWith(
        userEmail,
        userPassword
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should return an access token when login is successful', async () => {
      const userPayload = { sub: 1, email: 'user@example.com' };
      const mockToken = 'signedJwtToken';

      jwtService.sign = jest.fn().mockReturnValue(mockToken);

      const result = await authService.login(userPayload);

      expect(jwtService.sign).toHaveBeenCalledWith(userPayload);
      expect(result).toEqual({ accessToken: mockToken });
    });
  });
});
