import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@pkg/ui';
import { Languages } from 'lucide-react';

import type { GetLocaleResponseDto, GetResourceResponseDto } from '@/api/generated/model';

interface ResourceLanguageModalProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly resource: GetResourceResponseDto | null
  readonly locales: GetLocaleResponseDto[]
}

export function ResourceLanguageModal({
  open,
  onOpenChange,
  resource,
  locales,
}: ResourceLanguageModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Languages className="size-4" />
            다국어 관리
          </DialogTitle>
          <DialogDescription>
            {resource
              ? `${resource.name}의 번역 상태를 확인합니다.`
              : '선택한 리소스의 번역 상태를 확인합니다.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            현재 생성된 API 계약에는 번역 조회/저장 엔드포인트가 포함되어 있지 않습니다.
          </p>
          <p>
            지원 로케일 수:
            {' '}
            {locales.length}
            개
          </p>
        </div>

        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
