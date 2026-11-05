import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req: any) {
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    return this.authService.login(loginDto, ipAddress);
  }

  @Post('logout')
  async logout() {
    return { success: true, message: 'Logged out successfully' };
  }

  @Get('me')
  async getMe(@CurrentUser('id') userId: string) {
    return this.authService.getMe(userId);
  }
}

