import type { Opt } from '@mikro-orm/core';
import { PrimaryKey, Property } from '@mikro-orm/decorators/legacy';

export abstract class BaseEntity {
  @PrimaryKey()
  id!: string;

  @Property()
  createdAt: Date & Opt = new Date();

  @Property({ nullable: true })
  createdBy?: string;

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date & Opt = new Date();

  @Property({ nullable: true })
  updatedBy?: string;

  @Property({ nullable: true })
  deletedAt?: Date | null = null;

  @Property({ nullable: true })
  deletedBy?: string | null = null;
}
