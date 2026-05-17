/**
 * 메시지 가공 유틸리티
 * 온점(.) 뒤에 공백이 있는 부분을 줄바꿈 문자(.\n)로 변환합니다.
 */
export function formatMessage(msg?: string) {
  if (!msg) return '잘못된 에러 메시지입니다.';
  return msg.replace(/\. +/g, '.\n');
}
