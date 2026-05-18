import { Collection, type Rel } from '@mikro-orm/core';
import { Entity, Enum, ManyToOne, OneToMany, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { Permission } from './permission.entity';
import { ResourceRepository } from './resource.repository';

export enum ResourceType {
  MENU = 'MENU',
  API = 'API',
  UI_ELEMENT = 'UI_ELEMENT',
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

  // ----------------------------------------------------
  // MENU Type properties
  // ----------------------------------------------------
  @Property({ nullable: true })
  path?: string;

  @Property({ nullable: true })
  icon?: string;

  @Property({ nullable: true })
  displayOrder?: number;

  // ----------------------------------------------------
  // API Type properties
  // ----------------------------------------------------
  @Property({ nullable: true })
  httpMethod?: string;

  @Property({ nullable: true })
  pathPattern?: string;

  // ----------------------------------------------------
  // Associated permissions on this resource
  // ----------------------------------------------------
  @OneToMany(() => Permission, (perm) => perm.resource)
  permissions = new Collection<Permission>(this);
}
