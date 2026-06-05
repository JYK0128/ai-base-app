import { Collection, type Opt, type Rel } from '@mikro-orm/core';
import { Entity, Enum, ManyToOne, OneToMany, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { ResourceRepository } from './resource.repository';

export enum ResourceType {
  MENU = 'MENU',
  COMPONENT = 'COMPONENT',
}

export enum ResourceScope {
  PLATFORM = 'PLATFORM',
  ORGANIZATION = 'ORGANIZATION',
}

@Entity({ schema: 'platform', repository: () => ResourceRepository })
export class Resource extends CoreEntity<Resource> {
  @Property()
  code!: string;

  @Property()
  name!: string;

  @Enum(() => ResourceType)
  type!: ResourceType;

  @Enum(() => ResourceScope)
  scope: ResourceScope = ResourceScope.PLATFORM;

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

  @Property({ type: 'json' })
  actions: string[] = [];

  @Property({ nullable: true })
  constraint?: string;

  get isMenu(): Opt<boolean> {
    return this.type === ResourceType.MENU;
  }

  get isComponent(): Opt<boolean> {
    return this.type === ResourceType.COMPONENT;
  }
}
