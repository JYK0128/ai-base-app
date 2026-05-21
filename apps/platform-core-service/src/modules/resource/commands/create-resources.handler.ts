import { Transactional } from '@mikro-orm/decorators/legacy';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager } from '@mikro-orm/postgresql';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Resource, ResourceRepository, ResourceType } from '@pkg/database';

import { CreateResourceBatchItem, CreateResourcesAsserter, CreateResourcesCommand, type ResourceBatchOperation } from './create-resources.helpers';

interface CreateResourcesResult {
  readonly operation: ResourceBatchOperation
  readonly tempId?: string
  readonly id: string
}

@CommandHandler(CreateResourcesCommand)
export class CreateResourcesHandler implements ICommandHandler<CreateResourcesCommand> {
  private readonly Asserter = CreateResourcesAsserter;

  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepo: ResourceRepository,
    private readonly em: EntityManager,
  ) {}

  @Transactional()
  async execute(command: CreateResourcesCommand): Promise<{ results: CreateResourcesResult[] }> {
    if (command.items.length === 0) {
      return { results: [] };
    }

    await this.validateIdentifiers(command.items);
    await this.validateCodes(command.items);
    await this.validateReferences(command.items);

    const createItems = command.items.filter((item) => item.operation === 'CREATE');
    const updateItems = command.items.filter((item) => item.operation === 'UPDATE');
    const deleteItems = command.items.filter((item) => item.operation === 'DELETE');

    const { results: createResults, createdIds } = await this.processCreates(createItems);
    const updateResults = await this.processUpdates(updateItems, createdIds);
    const deleteResults = await this.processDeletes(deleteItems);

    await this.em.flush();
    return { results: [...createResults, ...updateResults, ...deleteResults] };
  }

  private async processCreates(items: CreateResourceBatchItem[]): Promise<{
    results: CreateResourcesResult[]
    createdIds: Map<string, string>
  }> {
    const pendingCreates = new Map(items.map((item) => [item.tempId!, item] as const));
    const createdIds = new Map<string, string>();
    const results: CreateResourcesResult[] = [];

    while (pendingCreates.size > 0) {
      let progressed = false;

      for (const [tempId, item] of Array.from(pendingCreates.entries())) {
        if (item.parentTempId && !createdIds.has(item.parentTempId)) {
          continue;
        }

        const parent = await this.resolveParent(item, createdIds);
        const resource = this.resourceRepo.create({
          code: item.code!,
          name: item.name!,
          type: item.type!,
          path: item.path,
          icon: item.icon,
          parent,
          sortOrder: item.sortOrder,
          actions: this.resolveActionsForType(item.type, item.actions),
          translations: item.translations,
        });

        this.em.persist(resource);
        createdIds.set(tempId, resource.id);
        results.push({ operation: 'CREATE', tempId, id: resource.id });
        pendingCreates.delete(tempId);
        progressed = true;
      }

      if (!progressed) {
        return this.Asserter.throw('CYCLIC_DEPENDENCY');
      }
    }

    return { results, createdIds };
  }

  private async processUpdates(items: CreateResourceBatchItem[], createdIds: Map<string, string>): Promise<CreateResourcesResult[]> {
    const results: CreateResourcesResult[] = [];

    for (const item of items) {
      const resource = await this.assertResourceId(item.id, 'MISSING_UPDATE_ID');
      const parent = await this.resolveParent(item, createdIds, resource.id);
      this.applyResourceUpdate(resource, item, parent);
      this.em.persist(resource);
      results.push({ operation: 'UPDATE', id: resource.id });
    }

    return results;
  }

  private async processDeletes(items: CreateResourceBatchItem[]): Promise<CreateResourcesResult[]> {
    const results: CreateResourcesResult[] = [];

    for (const item of items) {
      const resource = await this.assertResourceId(item.id, 'MISSING_DELETE_ID');
      await this.deleteResourceTree(resource);
      results.push({ operation: 'DELETE', id: resource.id });
    }

    return results;
  }

  private applyResourceUpdate(
    resource: Resource,
    item: CreateResourceBatchItem,
    parent?: Resource,
  ): void {
    if (item.code !== undefined) resource.code = item.code;
    if (item.name !== undefined) resource.name = item.name;
    if (item.type !== undefined) resource.type = item.type;
    if (item.path !== undefined) resource.path = item.path;
    if (item.icon !== undefined) resource.icon = item.icon;
    if (item.sortOrder !== undefined) resource.sortOrder = item.sortOrder;
    if (item.translations !== undefined) resource.translations = item.translations;
    if (parent !== undefined) resource.parent = parent;

    this.applyResourceActions(resource, item);
  }

  private applyResourceActions(resource: Resource, item: CreateResourceBatchItem): void {
    if (item.actions !== undefined) {
      resource.actions = item.actions;
      return;
    }

    if ((item.type ?? resource.type) === ResourceType.MENU) {
      resource.actions = ['CREATE', 'READ', 'UPDATE', 'DELETE'];
    }
  }

  private resolveActionsForType(type?: ResourceType, requestedActions?: string[]): string[] | undefined {
    if (requestedActions !== undefined) {
      return requestedActions;
    }

    if (type === ResourceType.MENU) {
      return ['CREATE', 'READ', 'UPDATE', 'DELETE'];
    }

    return undefined;
  }

  private async validateIdentifiers(items: CreateResourceBatchItem[]): Promise<void> {
    const tempIds = new Set<string>();
    const ids = new Set<string>();

    for (const item of items) {
      if (item.operation === 'CREATE') {
        await this.validateCreateIdentifiers(item, tempIds);
        continue;
      }

      await this.validateExistingIdentifiers(item, ids);
    }
  }

  private async validateCodes(items: CreateResourceBatchItem[]): Promise<void> {
    const codes = this.collectCodes(items);
    await this.ensureNoBatchCodeDuplicates(codes);
    const existingByCode = await this.findExistingCodeMap(codes);
    await this.assertNoExistingCodeConflict(items, existingByCode);
  }

  private async validateReferences(items: CreateResourceBatchItem[]): Promise<void> {
    const tempIds = new Set(items.filter((item) => item.operation === 'CREATE' && item.tempId).map((item) => item.tempId!));

    for (const item of items) {
      if (item.parentId && item.parentTempId) {
        return this.Asserter.throw('INVALID_PARENT_REFERENCE');
      }

      if (item.parentTempId && !tempIds.has(item.parentTempId)) {
        return this.Asserter.throw('INVALID_PARENT_REFERENCE');
      }
    }
  }

  private async assertResourceId(id: string | undefined, code: 'MISSING_UPDATE_ID' | 'MISSING_DELETE_ID'): Promise<Resource> {
    if (!id) {
      return this.Asserter.throw(code);
    }

    const resource = await this.resourceRepo.findOne({ id });
    return this.Asserter.assert(resource, 'RESOURCE_NOT_FOUND');
  }

  private async validateCreateIdentifiers(item: CreateResourceBatchItem, tempIds: Set<string>): Promise<void> {
    const { tempId, code, name, type } = item;

    if (!tempId || !code || !name || !type) {
      return this.Asserter.throw('MISSING_CREATE_FIELDS');
    }

    if (tempIds.has(tempId)) {
      return this.Asserter.throw('DUPLICATE_TEMP_ID');
    }

    tempIds.add(tempId);
  }

  private async validateExistingIdentifiers(item: CreateResourceBatchItem, ids: Set<string>): Promise<void> {
    const { id } = item;

    if (!id) {
      return this.Asserter.throw(item.operation === 'UPDATE' ? 'MISSING_UPDATE_ID' : 'MISSING_DELETE_ID');
    }

    if (ids.has(id)) {
      return this.Asserter.throw('DUPLICATE_RESOURCE_ID');
    }

    ids.add(id);
  }

  private async resolveParent(
    item: CreateResourceBatchItem,
    createdIds: Map<string, string>,
    currentId?: string,
  ): Promise<Resource | undefined> {
    if (item.parentId && item.parentTempId) {
      return this.Asserter.throw('INVALID_PARENT_REFERENCE');
    }

    if (item.parentTempId) {
      const parentId = createdIds.get(item.parentTempId);
      if (!parentId) {
        return this.Asserter.throw('INVALID_PARENT_REFERENCE');
      }

      return this.em.getReference(Resource, parentId);
    }

    if (item.parentId) {
      if (item.parentId === currentId) {
        return this.Asserter.throw('INVALID_PARENT_REFERENCE');
      }

      const parent = await this.resourceRepo.findOne({ id: item.parentId });
      return this.Asserter.assert(parent, 'PARENT_NOT_FOUND');
    }

    return undefined;
  }

  private async deleteResourceTree(resource: Resource): Promise<void> {
    await this.em.populate(resource, ['children']);

    for (const child of resource.children.getItems()) {
      await this.deleteResourceTree(child);
    }

    resource.delete();
    this.em.persist(resource);
  }

  private collectCodes(items: CreateResourceBatchItem[]): string[] {
    return items.flatMap((item) => item.code ? [item.code] : []);
  }

  private async ensureNoBatchCodeDuplicates(codes: string[]): Promise<void> {
    const batchCodes = new Set<string>();

    for (const code of codes) {
      if (batchCodes.has(code)) {
        return this.Asserter.throw('DUPLICATE_CODE');
      }

      batchCodes.add(code);
    }
  }

  private async findExistingCodeMap(codes: string[]): Promise<Map<string, Resource>> {
    if (codes.length === 0) {
      return new Map<string, Resource>();
    }

    const existing = await this.resourceRepo.find({ code: { $in: codes } });
    return new Map(existing.map((resource) => [resource.code, resource] as const));
  }

  private async assertNoExistingCodeConflict(
    items: CreateResourceBatchItem[],
    existingByCode: Map<string, Resource>,
  ): Promise<void> {
    for (const item of items) {
      if (!item.code) {
        continue;
      }

      const conflict = existingByCode.get(item.code);
      if (!conflict) {
        continue;
      }

      if (item.operation === 'CREATE' || (item.operation === 'UPDATE' && conflict.id !== item.id)) {
        return this.Asserter.throw('DUPLICATE_CODE');
      }
    }
  }
}
