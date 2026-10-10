import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthSession } from './auth.entity';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { LoginUserDto } from './dto/login-user.dto';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { Response } from 'express';
import { SessionToken } from 'src/interfaces/tokens';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthSession)
    private readonly authSessionRepository: Repository<AuthSession>,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  // Создание Access Токена
  private signAccessToken({
    id,
    email,
    username,
  }: Pick<User, 'id' | 'username' | 'email'>): string {
    return jwt.sign(
      { sub: id, email, username },
      this.configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
      {
        expiresIn: (this.configService.get<string>('ACCESS_TOKEN_TTL') ??
          '10m') as jwt.SignOptions['expiresIn'],
      },
    );
  }

  // Создание Refresh Токена
  private signRefreshToken(id: number, jti: string): string {
    return jwt.sign(
      { sub: id, jti },
      this.configService.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
      {
        expiresIn: (this.configService.get<string>('REFRESH_TOKEN_TTL') ??
          '30d') as jwt.SignOptions['expiresIn'],
      },
    );
  }

  //   Найти токен
  private async findToken(jti: string): Promise<AuthSession> {
    const token = await this.authSessionRepository.findOneBy({ jti });
    if (!token) {
      throw new UnauthorizedException(`Token not found`);
    }
    return token;
  }
  // Отозвать токен
  private async revokeToken(jti: string, userId: number): Promise<AuthSession> {
    const result = await this.authSessionRepository.update(
      { jti, userId, revoked: false },
      { revoked: true },
    );
    if (result.affected === 0) throw new NotFoundException('Session not found');

    return this.findToken(jti);
  }
  //   Отозвать все токены юзера
  private async revokeAllTokens(userId: number) {
    await this.authSessionRepository.update({ userId }, { revoked: true });
  }

  // Запись токена в бд
  async createToken(
    user: User,
  ): Promise<{ refreshToken: string; accessToken: string }> {
    const jti = crypto.randomUUID();

    const accessToken = this.signAccessToken(user);
    const refreshToken = this.signRefreshToken(user.id, jti);

    const now = Date.now();

    const decoded = jwt.decode(refreshToken);

    if (!decoded || typeof decoded === 'string' || !decoded.exp) {
      throw new InternalServerErrorException('Failed to create refresh token');
    }

    const token = this.authSessionRepository.create({
      jti: jti,
      expiresAt: String(decoded.exp * 1000),
      createdAt: String(now),
      userId: user.id,
      revoked: false,
    });
    await this.authSessionRepository.save(token);
    return { refreshToken, accessToken };
  }

  // Логин пользователя
  async loginUser(loginUserDto: LoginUserDto): Promise<{
    refreshToken: string;
    accessToken: string;
    user: { id: number; username: string; email: string };
  }> {
    const { username, password } = loginUserDto;
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const { refreshToken, accessToken } = await this.createToken(user);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username, email: user.email },
    };
  }

  //  Логаут юзера
  logoutUser(token: string, res: Response) {
    try {
      const payload = jwt.verify(
        token,
        this.configService.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
      );

      this.revokeToken(payload['jti'], Number(payload['sub']));
      return res.json({ ok: true });
    } catch {
      return res.json({ ok: true });
    }
  }

  //   Замена токена
  async refresh(
    token: string,
  ): Promise<{ refreshToken: string; accessToken: string }> {
    let payload: string | jwt.JwtPayload;
    try {
      payload = jwt.verify(
        token,
        this.configService.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
      );
    } catch {
      throw new UnauthorizedException(`Invalid or expired refresh token`);
    }

    if (typeof payload === 'string' || !payload.jti || !payload.sub)
      throw new UnauthorizedException('Invalid refresh token');

    const userId = Number(payload.sub);
    if (!Number.isInteger(userId))
      throw new UnauthorizedException('Invalid refresh token');

    const oldJti = payload.jti;

    await this.revokeToken(oldJti, userId);
    const user = await this.usersService.findById(Number(userId));
    const { refreshToken, accessToken } = await this.createToken(user);

    return { refreshToken, accessToken };
  }
}
