import { Collection, EntityName, type Opt, type Rel } from '@mikro-orm/core';
import { Embeddable, Embedded, Entity, Enum, ManyToOne, OneToMany, Property } from '@mikro-orm/decorators/legacy';

import { CoreEntity } from '../../core/core.entity';
import { ResourceAction, ResourceScope, ResourceType } from './resource.constants';

@Embeddable()
export class ResourceMetadata {
  [key: string]: unknown;

  constructor(data?: Partial<ResourceMetadata>) {
    Object.assign(this, data);
  }

  @Property({ type: 'boolean' })
  creatable = false;

  @Property({ type: 'boolean' })
  readable = false;

  @Property({ type: 'boolean' })
  updatable = false;

  @Property({ type: 'boolean' })
  deletable = false;
}

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

  @Embedded({ entity: () => ResourceMetadata, object: true })
  override metadata: Opt<ResourceMetadata> = new ResourceMetadata();

  @Property({ persist: false })
  get actions(): Opt<string[]> | null {
    const actions: string[] = [];

    if (this.metadata?.creatable) {
      actions.push(ResourceAction.CREATE);
    }
    if (this.metadata?.readable) {
      actions.push(ResourceAction.READ);
    }
    if (this.metadata?.updatable) {
      actions.push(ResourceAction.UPDATE);
    }
    if (this.metadata?.deletable) {
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

    if (!this.metadata) {
      this.metadata = new ResourceMetadata();
    }

    this.metadata.creatable = action === ResourceAction.CREATE;
    this.metadata.readable = action === ResourceAction.READ;
    this.metadata.updatable = action === ResourceAction.UPDATE;
    this.metadata.deletable = action === ResourceAction.DELETE;
  }

  grant(...actions: ResourceAction[]): void {
    if (!this.isMenu) {
      throw new Error('Resource.grant is only available for menu resources');
    }

    if (actions.length === 0) {
      return;
    }

    if (!this.metadata) {
      this.metadata = new ResourceMetadata();
    }

    for (const action of actions) {
      switch (action) {
        case 'CREATE':
          this.metadata.creatable = true;
          break;
        case 'READ':
          this.metadata.readable = true;
          break;
        case 'UPDATE':
          this.metadata.updatable = true;
          break;
        case 'DELETE':
          this.metadata.deletable = true;
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

    if (!this.metadata) {
      this.metadata = new ResourceMetadata();
    }

    for (const action of actions) {
      switch (action) {
        case 'CREATE':
          this.metadata.creatable = false;
          break;
        case 'READ':
          this.metadata.readable = false;
          break;
        case 'UPDATE':
          this.metadata.updatable = false;
          break;
        case 'DELETE':
          this.metadata.deletable = false;
          break;
      }
    }
  }
}
