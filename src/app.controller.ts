import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/libs/decorator/public.decorator';

@Controller({ version: '1' })
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getServiceInfo() {
    return {
      status: 'Ok',
    };
  }
}
