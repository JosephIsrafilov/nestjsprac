import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): { message: string; ui: string } {
    return {
      message: 'Task API is running',
      ui: '/ui',
    };
  }
}
