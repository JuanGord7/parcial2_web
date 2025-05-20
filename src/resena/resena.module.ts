import { Module } from '@nestjs/common';
import { ResenaService } from './resena.service';
import { ResenaController } from './resena.controller';

@Module({
  providers: [ResenaService],
  controllers: [ResenaController]
})
export class ResenaModule {}
