import { GoneException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VerificationCode } from './verification_codes.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class VerificationCodesService {
  constructor(
    @InjectRepository(VerificationCode)
    private readonly verificationCodesRepository: Repository<VerificationCode>,
    private readonly configService: ConfigService,
  ) {}

  private generateCode() {
    return crypto.randomInt(100000, 1000000).toString();
  }

  private hashCode(code: string) {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  private async hashPassword(password: string) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async createVerificationCode(
    userId: number,
    type: string,
    newEmail: string | null = null,
  ) {
    const code = this.generateCode();
    const codeHash = this.hashCode(code);
    const expiresAt = String(Date.now() + 10 * 60 * 1000);
    const createdAt = String(Date.now());
    const createdCode = this.verificationCodesRepository.create({
      type,
      userId,
      newEmail: newEmail,
      createdAt,
      expiresAt,
      codeHash,
    });

    await this.verificationCodesRepository.save(createdCode);
    return code;
  }

  async sendCode(type: string, email: string, code: string) {
    if (this.configService.get<string>('NODE_ENV') !== 'production') {
      console.log(`[DEV] Code for ${email}: ${code}`);
      return;
    }
    const transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: Number(this.configService.get<string>('SMTP_PORT')),
      secure: true,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
    const subject = type === 'change_password' ? 'Смена пароля' : 'Смена почты';
    const text = `Ваш код подтверждения: ${code}. Он действителен 10 минут.`;

    return transporter.sendMail({
      from: this.configService.get<string>('SMTP_FROM'),
      to: email,
      subject,
      text,
    });
  }

  async verifyCode(userId: number, code: string, type: string) {
    const codeHash = this.hashCode(code);

    const dbCode = await this.verificationCodesRepository.findOne({
      where: { userId, codeHash, type, used: false },
    });

    if (!dbCode) {
      throw new NotFoundException('Invalid or expired code');
    }

    if (Number(dbCode.expiresAt) < Date.now()) {
      throw new GoneException('Verification code has expired');
    }

    await this.verificationCodesRepository.update(
      { userId, codeHash, type },
      { attemptsCount: dbCode.attemptsCount ? dbCode.attemptsCount + 1 : 1 },
    );

    return dbCode;
  }

  async markCodeAsUsed(userId: number, type: string) {
    await this.verificationCodesRepository.update(
      { userId, type },
      { used: true },
    );
  }
}
