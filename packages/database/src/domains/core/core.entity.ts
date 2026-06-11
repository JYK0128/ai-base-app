import { BaseEntity, type CountByOptions, type CountOptions, type CreateOptions, type Cursor, type DeleteOptions, type Dictionary, type EntityClass, type EntityData, type EntityKey, EntityRepositoryType, type FilterQuery, type FindByCursorOptions, type FindOneOptions, type FindOneOrFailOptions, type FindOptions, type FromEntityType, OptionalProps, type Primary, type RequiredEntityData, type UpdateOptions, type WithUsingOptions } from '@mikro-orm/core';
import { PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { uuidv7 } from 'uuidv7';

import { QueryEngine } from './core.query';
import { CoreRepository } from './core.repository';

export abstract class CoreEntity<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Entity extends object = any,
  Optional extends keyof Entity = never,
> extends BaseEntity {
  [EntityRepositoryType]?: CoreRepository<Entity>;
  [OptionalProps]?: 'createdAt' | 'updatedAt' | 'isDeleted' | Optional;

  @PrimaryKey()
  id: string = uuidv7();

  @Property({ type: Date })
  createdAt: Date = new Date();

  @Property({ type: 'string', nullable: true })
  createdBy?: string;

  @Property({ type: Date, nullable: true })
  updatedAt?: Date;

  @Property({ type: 'string', nullable: true })
  updatedBy?: string;

  @Property({ type: Date, nullable: true })
  deletedAt?: Date;

  @Property({ type: 'string', nullable: true })
  deletedBy?: string;

  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, unknown>;

  @Property({ persist: false })
  get isDeleted(): boolean {
    return !!this.deletedAt;
  }

  is(id: string): boolean {
    return this.id === id;
  }

  equal(entity: this) {
    return this.id === entity.id;
  }

  // === Repository ===
  static getRepository<T extends CoreEntity>(
    this: EntityClass<T>,
  ) {
    return QueryEngine.em.getRepository<T>(this) as CoreRepository<T>;
  }

  // === Helper ===
  static getReference<T extends CoreEntity>(
    this: EntityClass<T>,
    id: Primary<T>,
  ): T {
    return QueryEngine.getReference(this, id);
  }

  // === Count ===
  static count<T extends CoreEntity>(
    this: EntityClass<T>,
    where?: FilterQuery<T>,
    options?: CountOptions<T>,
  ): Promise<number> {
    return QueryEngine.count(this, where, options);
  }

  static countBy<T extends CoreEntity>(
    this: EntityClass<T>,
    groupBy: EntityKey<T> | readonly EntityKey<T>[],
    options?: CountByOptions<T>,
  ): Promise<Dictionary<number>> {
    return QueryEngine.countBy(this, groupBy, options);
  }

  // === Create ===
  static create<T extends CoreEntity, Convert extends boolean = false>(
    this: EntityClass<T>,
    data: RequiredEntityData<T, never, Convert>,
    options?: CreateOptions<Convert>,
  ): T {
    return QueryEngine.create(this, data, options);
  }

  static createMany<T extends CoreEntity>(
    this: EntityClass<T>,
    data: RequiredEntityData<T>[],
  ): T[] {
    return QueryEngine.createMany(this, data);
  }

  // === Read ===
  static find<T extends CoreEntity>(
    this: EntityClass<T>,
    where: FilterQuery<T>,
    options?: WithUsingOptions<FindOptions<T>, T, never>,
  ) {
    return QueryEngine.find(this, where, options);
  }

  static findAndCount<T extends CoreEntity>(
    this: EntityClass<T>,
    where: FilterQuery<T>,
    options?: WithUsingOptions<FindOptions<T>, T, never>,
  ) {
    return QueryEngine.findAndCount(this, where, options);
  }

  static findByCursor<T extends CoreEntity>(
    this: EntityClass<T>,
    options: WithUsingOptions<FindByCursorOptions<T>, T, never>,
  ): Promise<Cursor<T>> {
    return QueryEngine.findByCursor(this, options);
  }

  static findById<T extends CoreEntity>(
    this: EntityClass<T>,
    id: Primary<T>,
    options?: WithUsingOptions<FindOneOptions<T>, T, never>,
  ) {
    return QueryEngine.findById(this, id, options);
  }

  static findOne<T extends CoreEntity>(
    this: EntityClass<T>,
    where: FilterQuery<T>,
    options?: WithUsingOptions<FindOneOptions<T>, T, never>,
  ) {
    return QueryEngine.findOne(this, where, options);
  }

  static findOneOrFail<T extends CoreEntity>(
    this: EntityClass<T>,
    where: FilterQuery<T>,
    options?: WithUsingOptions<FindOneOrFailOptions<T>, T, never>,
  ) {
    return QueryEngine.findOneOrFail(this, where, options);
  }

  static findByPage<T extends CoreEntity>(
    this: EntityClass<T>,
    where: FilterQuery<T>,
    options: Omit<WithUsingOptions<FindOptions<T>, T, never>, 'offset'> & { page?: number },
  ) {
    return QueryEngine.findByPage(this, where, options);
  }

  // === Update ===
  update(data: EntityData<FromEntityType<this>>) {
    return QueryEngine.update(this, data);
  }

  nativeUpdate(
    data: EntityData<this>,
    options?: UpdateOptions<this>,
  ): Promise<number> {
    const where = { id: this.id } as FilterQuery<this>;

    return QueryEngine.nativeUpdate<this>(
      this.constructor,
      where,
      data,
      options,
    );
  }

  // === Delete ===
  delete() {
    QueryEngine.delete(this);
  }

  nativeDelete(
    options?: DeleteOptions<this>,
  ): Promise<number> {
    const where = { id: this.id } as FilterQuery<this>;

    return QueryEngine.nativeDelete<this>(
      this.constructor,
      where,
      options,
    );
  }
}
