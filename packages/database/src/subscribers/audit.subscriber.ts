import { ChangeSetType, type EventSubscriber, type FlushEventArgs } from '@mikro-orm/core';
import type { AuthContext } from '@pkg/shared/server';

import { CoreEntity } from '../domains/core/core.entity';

export class AuditSubscriber implements EventSubscriber {
  onFlush(args: FlushEventArgs): void {
    const { account } = args.em.getLoggerContext<AuthContext>();
    const now = new Date();

    for (const changeSet of [...args.uow.getChangeSets()]) {
      if (!this.isCoreEntity(changeSet.entity)) {
        continue;
      }

      if (this.isCreateChangeSet(changeSet.type)) {
        this.applyCreateAudit(args, changeSet.entity, account?.id, now);
        continue;
      }

      if (this.isUpdateChangeSet(changeSet.type)) {
        this.applyUpdateAudit(args, changeSet.entity, account?.id, now);
        continue;
      }

      if (this.isDeleteChangeSet(changeSet.type)) {
        this.applyDeleteAudit(args, changeSet.entity, account?.id, now);
      }
    }
  }

  private isCoreEntity(entity: unknown): entity is CoreEntity {
    return entity instanceof CoreEntity;
  }

  private isCreateChangeSet(type: ChangeSetType): boolean {
    return type === ChangeSetType.CREATE;
  }

  private isUpdateChangeSet(type: ChangeSetType): boolean {
    return type === ChangeSetType.UPDATE || type === ChangeSetType.UPDATE_EARLY;
  }

  private isDeleteChangeSet(type: ChangeSetType): boolean {
    return type === ChangeSetType.DELETE || type === ChangeSetType.DELETE_EARLY;
  }

  private applyCreateAudit(
    args: FlushEventArgs,
    entity: CoreEntity,
    accountId: string | undefined,
    now: Date,
  ): void {
    entity.createdAt = now;

    if (accountId) {
      entity.createdBy = accountId;
    }

    args.uow.recomputeSingleChangeSet(entity);
  }

  private applyUpdateAudit(
    args: FlushEventArgs,
    entity: CoreEntity,
    accountId: string | undefined,
    now: Date,
  ): void {
    entity.updatedAt = now;

    if (accountId) {
      entity.updatedBy = accountId;
    }

    args.uow.recomputeSingleChangeSet(entity);
  }

  private applyDeleteAudit(
    args: FlushEventArgs,
    entity: CoreEntity,
    accountId: string | undefined,
    now: Date,
  ): void {
    entity.deletedAt = now;

    if (accountId) {
      entity.deletedBy = accountId;
    }

    args.uow.computeChangeSet(entity, ChangeSetType.UPDATE);
  }
}
