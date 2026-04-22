import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { nanoid } from 'nanoid';

const ADJECTIVES = [
  'Swift', 'Daring', 'Silent', 'Clever', 'Brave', 'Sly', 'Bold', 'Wise',
  'Royal', 'Noble', 'Mystic', 'Stormy', 'Sunny', 'Iron', 'Golden', 'Shadow',
];
const ANIMALS = [
  'Knight', 'Rook', 'Bishop', 'Pawn', 'Queen', 'Falcon', 'Tiger', 'Wolf',
  'Owl', 'Hawk', 'Panda', 'Otter', 'Fox', 'Bear', 'Lynx', 'Raven',
];

function randomUsername(): string {
  const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const b = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const n = Math.floor(Math.random() * 9000 + 1000);
  return `${a}${b}${n}`;
}

export interface JwtPayload {
  sub: string;
  username: string;
  guest: boolean;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  async createGuest() {
    // Retry if collision
    for (let i = 0; i < 5; i++) {
      const username = randomUsername();
      const exists = await this.prisma.user.findUnique({ where: { username } });
      if (exists) continue;
      const user = await this.prisma.user.create({
        data: {
          id: `g_${nanoid(10)}`,
          username,
          isGuest: true,
        },
      });
      const token = this.sign(user.id, user.username, true);
      return { token, user: this.safeUser(user) };
    }
    throw new Error('Could not allocate guest username');
  }

  sign(userId: string, username: string, guest: boolean): string {
    const payload: JwtPayload = { sub: userId, username, guest };
    return this.jwt.sign(payload);
  }

  verify(token: string): JwtPayload {
    try {
      return this.jwt.verify<JwtPayload>(token);
    } catch (err) {
      this.logger.warn(`JWT verify failed: ${(err as Error).message}`);
      throw new UnauthorizedException('Invalid token');
    }
  }

  safeUser(u: { id: string; username: string; rating: number; isGuest: boolean }) {
    return { id: u.id, username: u.username, rating: u.rating, isGuest: u.isGuest };
  }
}
