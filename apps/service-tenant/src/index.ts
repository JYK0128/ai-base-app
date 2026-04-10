import { MikroORM } from '@mikro-orm/postgresql';
import { Partner, PartnerStatus } from '@app/database/src/entities/Partner';
import { Outbox } from '@app/database/src/entities/Outbox';

async function processSignupEvents() {
  const orm = await MikroORM.init({
    entities: [Partner, Outbox],
    dbName: 'platform_db',
    clientUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/platform_db',
  });

  const em = orm.em.fork();

  console.log('Tenant Service: Monitoring Outbox for SIGNUP events...');

  // Mocking an event poller (in reality, use CDC or Kafka)
  setInterval(async () => {
    const events = await em.find(Outbox, { eventType: 'PARTNER_SIGNED_UP', processed: false });
    
    for (const event of events) {
      console.log(`Processing onboarding for partner: ${event.payload.partnerName}`);
      
      // Update partner status to ACTIVE
      const partner = await em.findOne(Partner, { id: event.payload.partnerId });
      if (partner) {
        partner.status = PartnerStatus.ACTIVE;
        event.processed = true;
        await em.flush();
        console.log(`Partner ${partner.id} is now ACTIVE.`);
      }
    }
  }, 5000);
}

processSignupEvents().catch(console.error);
