import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label, toast } from '@pkg/ui';
import { useState } from 'react';

interface SubResourceRegistrationModalProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly parentName?: string
  readonly onSave: (resource: { code: string, name: string, type: string, actions: string[] }) => void
}

export function SubResourceRegistrationModal({ open, onOpenChange, parentName, onSave }: SubResourceRegistrationModalProps) {
  const [form, setForm] = useState({
    type: 'COMPONENT',
    code: '',
    name: '',
  });

  // eslint-disable-next-line sonarjs/deprecation
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.name) {
      toast.error('리소스 코드와 이름을 모두 입력해주세요.');
      return;
    }

    // User will select action from the Radio group in the tree
    onSave({
      ...form,
      actions: [],
    });

    toast.success('컴포넌트 리소스가 임시 트리에 추가되었습니다.');
    onOpenChange(false);
    setForm({ type: 'COMPONENT', code: '', name: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>컴포넌트 리소스 추가</DialogTitle>
          <DialogDescription>
            {parentName ? `'${parentName}' 리소스에` : '선택한 리소스에'}
            {' '}
            속할 컴포넌트 리소스를 등록합니다.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="sub-code">리소스 코드 (영문)</Label>
            <Input
              id="sub-code"
              placeholder="예: BTN_USER_DELETE"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sub-name">리소스 이름</Label>
            <Input
              id="sub-name"
              placeholder="예: 사용자 삭제 버튼"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              등록하기
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
