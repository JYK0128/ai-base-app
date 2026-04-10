import express from 'express';
import { MikroORM } from '@mikro-orm/postgresql';
import { Partner, PartnerStatus } from '@app/database/src/entities/Partner';
import { PlatformUser, PlatformRole } from '@app/database/src/entities/PlatformUser';
import { PlatformAccount } from '@app/database/src/entities/PlatformAccount';
import { Outbox } from '@app/database/src/entities/Outbox';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const app = express();
app.use(express.json());

const SignupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

let orm: MikroORM;

async function initORM() {
  orm = await MikroORM.init({
    entities: [Partner, PlatformUser, PlatformAccount, Outbox],
    dbName: 'platform_db',
    clientUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/platform_db',
    discovery: { disableDynamicFileAccess: true },
  });
}

/**
 * @api POST /api/v1/auth/signup
 * Platform Signup (Partner Onboarding)
 */
app.post('/api/v1/auth/signup', async (req, res) => {
  try {
    const data = SignupSchema.parse(req.body);
    const em = orm.em.fork();

    await em.transactional(async (tx) => {
      // 1. Create Platform Account (Identity)
      const account = new PlatformAccount();
      account.id = uuidv4();
      account.email = data.email;
      account.password = await argon2.hash(data.password);
      tx.persist(account);

      // 2. Create Partner
      const partner = new Partner();
      partner.id = uuidv4();
      partner.name = data.name;
      partner.email = data.email;
      partner.status = PartnerStatus.PENDING;
      tx.persist(partner);

      // 3. Create Platform User (Profile/Role)
      const user = new PlatformUser();
      user.id = uuidv4();
      user.platformAccountId = account.id;
      user.role = PlatformRole.PARTNER_ADMIN;
      user.partnerId = partner.id;
      tx.persist(user);

      // 4. Create Outbox Event
      const outbox = new Outbox();
      outbox.id = uuidv4();
      outbox.eventType = 'PARTNER_SIGNED_UP';
      outbox.payload = {
        partnerId: partner.id,
        partnerName: partner.name,
        platformAccountId: account.id,
        adminId: user.id,
      };
      tx.persist(outbox);
    });

    res.status(201).json({
      success: true,
      data: {
        status: 'PENDING_ONBOARDING',
      },
      message: '회원가입이 완료되었습니다. 테넌트 프로비저닝을 시작합니다.',
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: '입력값이 올바르지 않습니다.',
          details: error.errors
        },
        timestamp: new Date().toISOString(),
        requestId: uuidv4(),
      });
    }
    console.error(error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '서버 내부 오류가 발생했습니다.'
      },
      timestamp: new Date().toISOString(),
      requestId: uuidv4(),
    });
  }
});

const PORT = process.env.PORT || 3001;
initORM().then(() => {
  app.listen(PORT, () => {
    console.log(`Auth Service listening on port ${PORT}`);
  });
});
