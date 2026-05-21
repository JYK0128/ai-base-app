import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label, toast } from '@pkg/ui';
import { useState } from 'react';

import { type ResourceResponseDto } from '../../../../api/model';

interface ResourceEditModalProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly resource: ResourceResponseDto | null
  readonly onSave: (resource: {
    code: string
    name: string
    path?: string
    icon?: string
  }) => void
}

export function ResourceEditModal({ open, onOpenChange, resource, onSave }: ResourceEditModalProps) {
  const isMenu = resource?.type === 'MENU';
  const [form, setForm] = useState(() => ({
    code: resource?.code ?? '',
    name: resource?.name ?? '',
    path: resource?.path ?? '',
    icon: resource?.icon ?? '',
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>리소스 수정</DialogTitle>
          <DialogDescription>
            {resource?.type === 'MENU' ? '메뉴 리소스의 표시 정보와 경로를 수정합니다.' : '컴포넌트 리소스의 표시 정보를 수정합니다.'}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();

            if (!form.code || !form.name) {
              toast.error('리소스 코드와 이름을 모두 입력해주세요.');
              return;
            }

            onSave({
              code: form.code,
              name: form.name,
              path: isMenu ? form.path : undefined,
              icon: isMenu ? form.icon : undefined,
            });

            toast.success('리소스 정보가 수정되었습니다.');
            onOpenChange(false);
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="edit-code">리소스 코드</Label>
            <Input
              id="edit-code"
              placeholder="예: SYSTEM_MANAGEMENT"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">리소스 이름</Label>
            <Input
              id="edit-name"
              placeholder="예: 시스템 관리"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          {isMenu && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="edit-path">라우트 경로</Label>
                <Input
                  id="edit-path"
                  placeholder="예: /system"
                  value={form.path}
                  onChange={(e) => setForm({ ...form, path: e.target.value })}
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-icon">아이콘 이름</Label>
                <Input
                  id="edit-icon"
                  placeholder="예: LayoutDashboard"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="font-mono"
                />
              </div>
            </>
          )}
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              저장
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
