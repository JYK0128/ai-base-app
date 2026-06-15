import { Collection, EntityName, type Opt, type Rel } from '@mikro-orm/core';
import { Entity, Enum, ManyToOne, OneToMany, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { ResourceScope, ResourceType } from './resource.constants';

@Entity({ schema: 'platform' })
export class Resource extends CoreEntity<Resource> {
  [EntityName]?: 'Resource';

  @ManyToOne(() => Resource, { nullable: true })
  parent?: Rel<Resource>;

  @OneToMany(() => Resource, (res) => res.parent)
  children = new Collection<Resource>(this);

  @Property({ type: 'string' })
  code!: string;

  @Property({ type: 'string' })
  name!: string;

  @Enum(() => ResourceType)
  type!: ResourceType;

  @Enum(() => ResourceScope)
  scope: Opt<ResourceScope> = ResourceScope.PLATFORM;

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

  @Property({ persist: false })
  get isMenu(): Opt<boolean> {
    return this.type === ResourceType.MENU;
  }

  @Property({ persist: false })
  get isComponent(): Opt<boolean> {
    return this.type === ResourceType.COMPONENT;
  }
}
