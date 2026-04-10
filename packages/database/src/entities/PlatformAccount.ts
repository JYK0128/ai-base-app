import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'platform_accounts' })
export class PlatformAccount {
  @PrimaryKey()
  id!: string;

  @Property({ unique: true })
  email!: string;

  @Property({ hidden: true })
  password!: string;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
