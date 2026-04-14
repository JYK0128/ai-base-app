import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import type { Request } from 'express';

import { GatewayService } from './gateway.service';

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Get()
  getHello(): string {
    return this.gatewayService.getHello();
  }

  @Post('login')
  async login(@Body() data: { userId: string }, @Req() req: Request) {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    return this.gatewayService.login({
      userId: data.userId,
      clientIp,
    });
  }

  @Get('user')
  async getUser(@Req() req: Request) {
    const userId = req.query.userId as string;
    return this.gatewayService.getUser(userId);
  }
}
