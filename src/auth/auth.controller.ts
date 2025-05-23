import {
  Controller,
  Post,
  Body,
  Req,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './libs/guards/jwt.guard';
import { UserRequest } from './libs/requests/user.request';
import { RegisterDto, LoginDto } from './libs/dto/auth.dto';
import { UserResponseDto } from '../user/libs/dto/user-response.dto';
import { Public } from './libs/decorator/public.decorator';

@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: UserRequest): UserResponseDto {
    // authService will strip out password for you
    return this.authService.toUserResponseDto(req.user);
  }
}
