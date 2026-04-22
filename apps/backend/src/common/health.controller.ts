import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  health() {
    return { ok: true, ts: Date.now() };
  }

  @Get('healthz')
  healthz() {
    return { ok: true };
  }

  @Get('/')
  root() {
    return {
      name: 'chess-platform-api',
      status: 'ok',
      docs: 'https://github.com/kayanerkama-alt/chess-platform',
    };
  }
}
