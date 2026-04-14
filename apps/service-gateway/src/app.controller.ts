import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import type { Request } from 'express';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('auth/login')
  login(@Body() body: { userId: string }, @Req() req: Request) {
    const clientIp = req.ip || '0.0.0.0';
    return this.appService.triggerLogin(body.userId, clientIp);
  }

  @Get('trigger-auth-event')
  triggerAuthEvent() {
    return this.appService.sendAuthMessage();
  }

  @Get('user')
  getUser() {
    return this.appService.getUserInfo();
  }
}
