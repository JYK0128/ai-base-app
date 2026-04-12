import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('trigger-auth')
  triggerAuth() {
    return this.appService.sendAuthMessage();
  }

  @Get('login')
  login() {
    return this.appService.triggerLogin();
  }
}
