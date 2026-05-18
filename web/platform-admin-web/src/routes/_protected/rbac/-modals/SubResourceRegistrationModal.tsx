import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label, RadioGroup, RadioGroupItem, toast } from '@pkg/ui';
import { useState } from 'react';

interface SubResourceRegistrationModalProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly parentName?: string
  readonly onSave: (resource: { code: string, name: string, path: string, type: string, actions: string[] }) => void
}

export function SubResourceRegistrationModal({ open, onOpenChange, parentName, onSave }: SubResourceRegistrationModalProps) {
  const [form, setForm] = useState({
    type: 'API',
    code: '',
    name: '',
    path: '',
  });

  // eslint-disable-next-line sonarjs/deprecation
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.name || !form.path) {
      toast.error('리소스 코드, 이름, 경로를 모두 입력해주세요.');
      return;
    }

    // User will select action from the Radio group in the tree
    onSave({
      ...form,
      actions: [],
    });

    toast.success('하위 리소스가 임시 트리에 추가되었습니다.');
    onOpenChange(false);
    setForm({ type: 'API', code: '', name: '', path: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>하위 리소스 추가</DialogTitle>
          <DialogDescription>
            {parentName ? `'${parentName}' 하위에` : '선택한 메뉴 하위에'}
            {' '}
            속할 API 또는 컴포넌트 리소스를 등록합니다.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label>리소스 타입</Label>
            <RadioGroup
              value={form.type}
              onValueChange={(val) => setForm({ ...form, type: val })}
              className="flex items-center gap-6 mt-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="API" id="type-api" />
                <Label htmlFor="type-api" className="cursor-pointer font-normal">API 엔드포인트</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="COMPONENT" id="type-comp" />
                <Label htmlFor="type-comp" className="cursor-pointer font-normal">UI 컴포넌트</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sub-code">리소스 코드 (영문)</Label>
            <Input
              id="sub-code"
              placeholder={form.type === 'API' ? '예: USER_GET_API' : '예: BTN_USER_DELETE'}
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sub-name">리소스 이름</Label>
            <Input
              id="sub-name"
              placeholder={form.type === 'API' ? '예: 사용자 목록 조회' : '예: 사용자 삭제 버튼'}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sub-path">경로</Label>
            <Input
              id="sub-path"
              placeholder={form.type === 'API' ? '예: /api/v1/users' : '예: .btn-submit, #login-form'}
              value={form.path}
              onChange={(e) => setForm({ ...form, path: e.target.value })}
              className="font-mono"
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
