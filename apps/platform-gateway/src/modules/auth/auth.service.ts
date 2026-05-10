import { Injectable, Logger } from '@nestjs/common';

import { AuthClient } from './auth.client';
import { ChangePasswordDto, CreateOnboardingOrganizationDto, LoginDto, RegisterManagerDto, ResendManagerVerificationDto, VerifyManagerRegistrationDto } from './dto/auth-request.dto';
import { AuthPermissionsResponseDto } from './dto/auth-response.dto';

export interface LoginResult {
  accessToken: string
  refreshToken: string
  mustCreateOrganization?: boolean
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly authClient: AuthClient) {}

  async login(loginDto: LoginDto): Promise<LoginResult> {
    this.logger.log(`Handling login for ${loginDto.email}`);
    return this.authClient.login(loginDto);
  }

  async register(registerDto: RegisterManagerDto): Promise<void> {
    this.logger.log(`Handling manager registration for ${registerDto.email}`);
    return this.authClient.register(registerDto);
  }

  async verifyRegistration(verifyDto: VerifyManagerRegistrationDto): Promise<void> {
    this.logger.log('Handling manager registration verification');
    return this.authClient.verifyRegistration(verifyDto);
  }

  async resendVerification(resendDto: ResendManagerVerificationDto): Promise<void> {
    this.logger.log(`Handling manager verification resend for ${resendDto.email}`);
    return this.authClient.resendVerification(resendDto);
  }

  async createOnboardingOrganization(dto: CreateOnboardingOrganizationDto): Promise<LoginResult> {
    this.logger.log(`Handling onboarding organization creation for ${dto.organizationCode}`);
    return this.authClient.createOnboardingOrganization(dto);
  }

  async refresh(refreshToken: string): Promise<LoginResult> {
    this.logger.log('Handling token refresh');
    return this.authClient.refresh(refreshToken);
  }

  async logout(): Promise<void> {
    this.logger.log('Handling logout');
    return this.authClient.logout();
  }

  async permissions(): Promise<AuthPermissionsResponseDto> {
    this.logger.log('Handling permissions');
    return this.authClient.permissions();
  }

  async deferPasswordChange(): Promise<void> {
    this.logger.log('Handling password change deferment');
    return this.authClient.deferPasswordChange();
  }

  async changePassword(changePasswordDto: ChangePasswordDto): Promise<void> {
    this.logger.log('Handling password change');
    return this.authClient.changePassword(changePasswordDto);
  }
}
