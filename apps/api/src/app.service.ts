import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return '🚀 ConnectGig API is running! Welcome to the future of gig work!';
  }
}
