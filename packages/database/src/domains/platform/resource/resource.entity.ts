import { Collection, EntityName, type Opt, type Rel } from '@mikro-orm/core';
import { Entity, Enum, ManyToOne, OneToMany, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { ResourceAction, ResourceScope, ResourceType } from './resource.constants';

@Entity({ schema: 'platform' })
export class Resource extends CoreEntity<Resource> {
  [EntityName]?: 'Resource';

  @ManyToOne(() => Resource, { nullable: true })
  parent: Rel<Resource> | null = null;

  @OneToMany(() => Resource, (res) => res.parent)
  children = new Collection<Resource>(this);

  @Property({ type: 'string', unique: true })
  code!: string;

  @Property({ type: 'string' })
  name!: string;

  @Enum(() => ResourceType)
  type!: ResourceType;

  @Enum(() => ResourceScope)
  scope: Opt<ResourceScope> = ResourceScope.PLATFORM;

  @Property({ type: 'string', nullable: true })
  path: string | null = null;

  @Property({ type: 'string', nullable: true })
  icon: string | null = null;

  @Property({ type: 'number', nullable: true })
  sortOrder: number | null = null;

  @Property({ type: 'boolean' })
  creatable: Opt<boolean> = false;

  @Property({ type: 'boolean' })
  readable: Opt<boolean> = false;

  @Property({ type: 'boolean' })
  updatable: Opt<boolean> = false;

  @Property({ type: 'boolean' })
  deletable: Opt<boolean> = false;

  @Property({ persist: false })
  get actions(): Opt<string[]> {
    const actions: string[] = [];

    if (this.creatable) {
      actions.push(ResourceAction.CREATE);
    }
    if (this.readable) {
      actions.push(ResourceAction.READ);
    }
    if (this.updatable) {
      actions.push(ResourceAction.UPDATE);
    }
    if (this.deletable) {
      actions.push(ResourceAction.DELETE);
    }

    return actions;
  }

  @Property({ persist: false })
  get isMenu(): Opt<boolean> {
    return this.type === ResourceType.MENU;
  }

  @Property({ persist: false })
  get isComponent(): Opt<boolean> {
    return this.type === ResourceType.COMPONENT;
  }

  set(action: ResourceAction | null): void {
    if (this.isMenu) {
      throw new Error('Resource.set is only available for component resources');
    }

    this.creatable = action === ResourceAction.CREATE;
    this.readable = action === ResourceAction.READ;
    this.updatable = action === ResourceAction.UPDATE;
    this.deletable = action === ResourceAction.DELETE;
  }

  grant(...actions: ResourceAction[]): void {
    if (!this.isMenu) {
      throw new Error('Resource.grant is only available for menu resources');
    }

    if (actions.length === 0) {
      return;
    }

    for (const action of actions) {
      switch (action) {
        case 'CREATE':
          this.creatable = true;
          break;
        case 'READ':
          this.readable = true;
          break;
        case 'UPDATE':
          this.updatable = true;
          break;
        case 'DELETE':
          this.deletable = true;
          break;
      }
    }
  }

  revoke(...actions: ResourceAction[]): void {
    if (!this.isMenu) {
      throw new Error('Resource.revoke is only available for menu resources');
    }

    if (actions.length === 0) {
      throw new Error('Resource.revoke requires at least one action');
    }

    for (const action of actions) {
      switch (action) {
        case 'CREATE':
          this.creatable = false;
          break;
        case 'READ':
          this.readable = false;
          break;
        case 'UPDATE':
          this.updatable = false;
          break;
        case 'DELETE':
          this.deletable = false;
          break;
      }
    }
  }
}
