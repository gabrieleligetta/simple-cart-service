import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from '../user/libs/dto/user.dto';
import { UserResponseDto } from '../user/libs/dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string): Promise<any> {
    // Verifica se esiste già un user con questa email
    const existing = await this.userService.findByEmail(email);
    if (existing) {
      throw new ConflictException('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.userService.createUser(email, hashedPassword);
    return this.toUserResponseDto(user);
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Confronta password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Genera JWT payload
    const payload = { sub: user.id, email: user.email };

    const token = this.jwtService.sign(payload);

    return { access_token: token };
  }

  // Utilizzata all'interno di JwtStrategy
  async validateUserById(id: number): Promise<UserDto | null> {
    const user = await this.userService.findById(id);
    if (!user) {
      return null;
    }
    return user;
  }

  toUserResponseDto(user: UserDto): UserResponseDto {
    const { id, email, createdAt, updatedAt } = user;
    return <UserResponseDto>{ id, email, createdAt, updatedAt };
  }
}
