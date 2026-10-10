import { Body, Controller, Post, Req } from '@nestjs/common';
import { VerificationCodesService } from './verification_codes.service';
import type { Request } from 'express';
import { CheckCodeDto } from './dto/check-code.dto';
import { NewPassDto } from './dto/new-pass.dto';
import { UsersService } from 'src/users/users.service';
import { NewEmailDto } from './dto/new-email.dto';

@Controller()
export class VerificationCodesController {
  constructor(
    private readonly verificationCodesService: VerificationCodesService,
    private readonly usersService: UsersService,
  ) {}

  @Post('/account/password-change/send-code')
  async passwdChangeSendCode(@Req() req: Request) {
    const userId = Number(req['user'].sub);
    const email = req['user'].email;

    const code = await this.verificationCodesService.createVerificationCode(
      userId,
      'change_password',
    );
    await this.verificationCodesService.sendCode(
      'change_password',
      email,
      code,
    );

    return { message: 'Password reset email sent' };
  }

  @Post('/account/password-change/verify-code')
  async passwdChangeVerification(
    @Req() req: Request,
    @Body() checkCodeDto: CheckCodeDto,
  ) {
    const { code } = checkCodeDto;
    const userId = Number(req['user'].sub);

    const existingCode = await this.verificationCodesService.verifyCode(
      userId,
      code,
      'change_password',
    );
    if (existingCode) {
      return { isValid: true, message: 'Code successfully verified' };
    }
  }

  @Post('/account/password-change/confirm')
  async passwdChangeConfirm(
    @Req() req: Request,
    @Body() newPassDto: NewPassDto,
  ) {
    const { newPassword } = newPassDto;
    const userId = Number(req['user'].sub);

    const result = await this.usersService.confirmNewPassword(
      newPassword,
      userId,
    );
    await this.verificationCodesService.markCodeAsUsed(
      userId,
      'change_password',
    );
    return result;
  }

  @Post('/account/email-change/send-code')
  async emailChangeSendCode(@Req() req: Request) {
    const userId = Number(req['user'].sub);
    const email = req['user'].email;

    const code = await this.verificationCodesService.createVerificationCode(
      userId,
      'change_email',
    );
    await this.verificationCodesService.sendCode('change_email', email, code);

    return { message: 'Email reset email sent' };
  }

  @Post('/account/email-change/verify-code')
  async emailChangeVerification(
    @Req() req: Request,
    @Body() checkCodeDto: CheckCodeDto,
  ) {
    const { code } = checkCodeDto;
    const userId = Number(req['user'].sub);

    const existingCode = await this.verificationCodesService.verifyCode(
      userId,
      code,
      'change_email',
    );
    if (existingCode) {
      return { isValid: true, message: 'Code successfully verified' };
    }
  }

  @Post('/account/email-change/confirm')
  async emailChangeConfirm(
    @Body() newEmailDto: NewEmailDto,
    @Req() req: Request,
  ) {
    const { newEmail } = newEmailDto;
    const userId = Number(req['user'].sub);

    const result = await this.usersService.confirmNewEmail(newEmail, userId);
    await this.verificationCodesService.markCodeAsUsed(userId, 'change_email');
    return result;
  }
}
