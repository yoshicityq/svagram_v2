import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Public } from './decorators/public.decorator';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  // Очистка токена из куки
  private clearRefreshCookie(res: Response) {
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/auth', //
    });
  }

  // Запись токена в куки
  private setRefreshCookie(res: Response, refreshToken: string): void {
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      path: '/auth',
      maxAge: Number(
        this.configService.getOrThrow<string>('REFRESH_COOKIE_MAX_AGE'),
      ),
    });
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() loginUserDto: LoginUserDto,
  ): Promise<{
    message: string;
    accessToken: string;
    user: { id: number; username: string; email: string };
  }> {
    const userData = await this.authService.loginUser(loginUserDto);

    this.setRefreshCookie(res, userData.refreshToken);
    return {
      message: 'Successfully logged in!',
      accessToken: userData.accessToken,
      user: userData.user,
    };
  }

  @Public()
  @Post('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    const token = req.cookies?.refreshToken;

    this.clearRefreshCookie(res);

    if (!token) return res.json({ ok: true });

    this.authService.logoutUser(token, res);
  }

  @Public()
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const token = req.cookies?.refreshToken;
    if (!token) throw new UnauthorizedException(`Refresh token not found`);

    const { refreshToken, accessToken } = await this.authService.refresh(token);
    this.setRefreshCookie(res, refreshToken);

    return { accessToken };
  }

  @Get('me')
  getMe(@Req() req: Request) {
    const user = req['user'];
    return {
      user: {
        id: user.sub,
        username: user.username,
        email: user.email,
      },
    };
  }
}
