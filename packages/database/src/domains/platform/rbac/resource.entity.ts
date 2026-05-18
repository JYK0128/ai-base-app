import { Collection, type Rel } from '@mikro-orm/core';
import { Entity, Enum, ManyToOne, OneToMany, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { ResourceRepository } from './resource.repository';

export enum ResourceType {
  MENU = 'MENU',
  API = 'API',
  COMPONENT = 'COMPONENT',
}

@Entity({ schema: 'platform', repository: () => ResourceRepository })
export class Resource extends CoreEntity<Resource> {
  @Property({ unique: true })
  code!: string;

  @Property()
  name!: string;

  @Enum(() => ResourceType)
  type!: ResourceType;

  @ManyToOne(() => Resource, { nullable: true })
  parent?: Rel<Resource>;

  @OneToMany(() => Resource, (res) => res.parent)
  children = new Collection<Resource>(this);

  @Property({ nullable: true })
  path?: string;

  @Property({ nullable: true })
  icon?: string;

  @Property({ nullable: true })
  sortOrder?: number;

  @Property({ type: 'json', nullable: true })
  actions?: string[];

  @Property({ nullable: true })
  mappedAction?: string;
}
