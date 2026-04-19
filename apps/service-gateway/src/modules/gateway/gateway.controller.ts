import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { Public } from '@/common/decorators/public.decorator';

import { GetUserDto } from './dto/get-user.dto';
import { LoginDto } from './dto/login.dto';
import { GatewayService } from './gateway.service';

@ApiTags('Gateway')
@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: '헬로 월드', description: '게이트웨이 상태 확인용' })
  getHello(): string {
    return this.gatewayService.getHello();
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: '로그인', description: '인증 서비스로 로그인 요청을 전달합니다.' })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  async login(@Body() loginDto: LoginDto) {
    return this.gatewayService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: '토큰 갱신', description: '리프레시 토큰을 사용하여 액세스 토큰을 갱신합니다.' })
  @ApiResponse({ status: 200, description: '토큰 갱신 성공' })
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.gatewayService.refresh(refreshToken);
  }

  @Post('logout')
  @ApiOperation({ summary: '로그아웃', description: '세션을 종료하고 리프레시 토큰을 무효화합니다.' })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  async logout(@Req() req: Request) {
    // request.user는 AuthGuard에서 주입됨
    return this.gatewayService.logout(req.user!.sub);
  }

  @Get('user')
  @ApiOperation({ summary: '사용자 조회', description: '인증 서비스에서 사용자 정보를 조회합니다.' })
  async getUser(@Query() getUserDto: GetUserDto) {
    return this.gatewayService.getUser(getUserDto.userId);
  }
}
