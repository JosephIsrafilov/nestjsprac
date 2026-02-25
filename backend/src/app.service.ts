import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): { message: string; ui: string } {
    return {
      message: 'Task API is running',
      ui: '/ui',
    };
  }
}
