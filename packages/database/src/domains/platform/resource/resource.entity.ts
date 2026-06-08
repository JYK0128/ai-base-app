import { Collection, EntityName, type Opt, type Rel } from '@mikro-orm/core';
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
  [EntityName]?: 'Resource';

  @Property({ type: 'string' })
  code!: string;

  @Property({ type: 'string' })
  name!: string;

  @Enum(() => ResourceType)
  type!: ResourceType;

  @Enum(() => ResourceScope)
  scope: Opt<ResourceScope> = ResourceScope.PLATFORM;

  @ManyToOne(() => Resource, { nullable: true })
  parent?: Rel<Resource>;

  @OneToMany(() => Resource, (res) => res.parent)
  children = new Collection<Resource>(this);

  @Property({ type: 'string', nullable: true })
  path?: string;

  @Property({ type: 'string', nullable: true })
  icon?: string;

  @Property({ type: 'number', nullable: true })
  sortOrder?: number;

  @Property({ type: 'json' })
  actions: Opt<string[]> = [];

  @Property({ type: 'string', nullable: true })
  constraint?: string;

  get isMenu(): Opt<boolean> {
    return this.type === ResourceType.MENU;
  }

  get isComponent(): Opt<boolean> {
    return this.type === ResourceType.COMPONENT;
  }
}
