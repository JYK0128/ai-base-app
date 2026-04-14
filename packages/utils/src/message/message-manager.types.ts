/**
 * 다국어 메시지 관련 인터페이스 및 타입 정의
 */

import { TreeStructure } from '../core/tree-helper';

/**
 * 계층형 메시지를 담는 트리 구조 (재귀적 정의)
 */
export type MessageTree = TreeStructure<string>;

/**
 * 네임스페이스별 메시지 트리 맵
 */
export interface MessageEntry {
  [namespace: string]: MessageTree
}

/** 네임스페이스 및 로케일별 메시지 소스 정의 */
export interface MessageSource {
  namespace: string
  locale: string
  messages: MessageTree
}

/** 데이터베이스 저장 및 조회 시 사용하는 평탄화된 메시지 레코드 */
export interface MessageRecord {
  locale: string
  namespace: string
  key: string
  message: string
}

/** 메시지 영속성 계층을 위한 인터페이스 */
export interface MessageStore {
  /** 조건에 맞는 메시지 목록 조회 */
  findMany(params?: { locale?: string, namespace?: string }): Promise<MessageRecord[]>
  /** 메시지 일괄 저장 또는 업데이트 */
  upsertMany(records: MessageRecord[]): Promise<void>
}
