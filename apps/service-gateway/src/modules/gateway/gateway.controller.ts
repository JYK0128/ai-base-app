import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { GetUserDto } from './dto/get-user.dto';
import { LoginDto } from './dto/login.dto';
import { GatewayService } from './gateway.service';

@ApiTags('Gateway')
@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Get()
  @ApiOperation({ summary: '헬로 월드', description: '게이트웨이 상태 확인용' })
  getHello(): string {
    return this.gatewayService.getHello();
  }

  @Post('login')
  @ApiOperation({ summary: '로그인', description: '인증 서비스로 로그인 요청을 전달합니다.' })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  async login(@Body() loginDto: LoginDto) {
    return this.gatewayService.login(loginDto);
  }

  @Get('user')
  @ApiOperation({ summary: '사용자 조회', description: '인증 서비스에서 사용자 정보를 조회합니다.' })
  async getUser(@Query() getUserDto: GetUserDto) {
    return this.gatewayService.getUser(getUserDto.userId);
  }
}
