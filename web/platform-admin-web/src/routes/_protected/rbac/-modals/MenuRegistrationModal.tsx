import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Input, Label, toast } from '@pkg/ui';
import { Activity, Bell, BookOpen, Box, Briefcase, Calendar, Database, FileText,
         Folder, Globe, Heart, Home, Image as ImageIcon, Key, LayoutDashboard,
         Lock, Mail, MessageSquare, Server, Settings, Shield, ShoppingBag,
         ShoppingCart, Star, Users } from 'lucide-react';
import { useState } from 'react';

interface MenuRegistrationModalProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onSave: (menu: { code: string, name: string, path: string, icon: string, type: string }) => void
}

const COMMON_ICONS = [
  { name: 'Home', icon: Home },
  { name: 'LayoutDashboard', icon: LayoutDashboard },
  { name: 'Users', icon: Users },
  { name: 'Settings', icon: Settings },
  { name: 'Folder', icon: Folder },
  { name: 'FileText', icon: FileText },
  { name: 'Database', icon: Database },
  { name: 'Shield', icon: Shield },
  { name: 'Activity', icon: Activity },
  { name: 'Box', icon: Box },
  { name: 'Image', icon: ImageIcon },
  { name: 'Mail', icon: Mail },
  { name: 'MessageSquare', icon: MessageSquare },
  { name: 'ShoppingBag', icon: ShoppingBag },
  { name: 'ShoppingCart', icon: ShoppingCart },
  { name: 'Star', icon: Star },
  { name: 'Heart', icon: Heart },
  { name: 'Calendar', icon: Calendar },
  { name: 'Bell', icon: Bell },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Globe', icon: Globe },
  { name: 'Lock', icon: Lock },
  { name: 'Key', icon: Key },
  { name: 'Server', icon: Server },
];

export function MenuRegistrationModal({ open, onOpenChange, onSave }: MenuRegistrationModalProps) {
  const [menuForm, setMenuForm] = useState({
    code: '',
    name: '',
    path: '',
    icon: '',
  });

  const handleSaveMenu = (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!menuForm.code || !menuForm.name || !menuForm.path) {
      toast.error('메뉴 코드, 이름, 라우트 경로를 모두 입력해주세요.');
      return;
    }

    // Save to parent (mock state)
    onSave({
      ...menuForm,
      type: 'MENU',
    });

    toast.success('임시 리소스 트리에 추가되었습니다.');
    onOpenChange(false);
    setMenuForm({ code: '', name: '', path: '', icon: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle>메뉴 리소스 추가</DialogTitle>
          <DialogDescription>
            프론트엔드 네비게이션에 표시될 메뉴 리소스를 등록합니다.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSaveMenu} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="menu-code">메뉴 코드 (영문)</Label>
            <Input
              id="menu-code"
              placeholder="예: SYSTEM_MANAGEMENT"
              value={menuForm.code}
              onChange={(e) => setMenuForm({ ...menuForm, code: e.target.value })}
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="menu-name">메뉴 표시 이름</Label>
            <Input
              id="menu-name"
              placeholder="예: 시스템 관리"
              value={menuForm.name}
              onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="menu-path">라우트 경로 (Path)</Label>
            <Input
              id="menu-path"
              placeholder="예: /system"
              value={menuForm.path}
              onChange={(e) => setMenuForm({ ...menuForm, path: e.target.value })}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label>아이콘 선택 - 선택사항</Label>
            <div className="grid grid-cols-5 gap-2 border border-slate-200 rounded-md p-2 max-h-40 overflow-y-auto bg-slate-50">
              {COMMON_ICONS.map(({ name, icon: IconComponent }) => (
                <button
                  key={name}
                  type="button"
                  title={name}
                  className={`p-2 rounded flex items-center justify-center transition-colors ${
                    menuForm.icon === name
                      ? 'bg-blue-100 text-blue-600 border border-blue-300'
                      : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-100'
                  }`}
                  onClick={() => setMenuForm({ ...menuForm, icon: menuForm.icon === name ? '' : name })}
                >
                  <IconComponent className="w-5 h-5" />
                </button>
              ))}
            </div>
            {menuForm.icon && (
              <p className="text-xs text-blue-600 font-medium">
                선택된 아이콘:
                {menuForm.icon}
              </p>
            )}
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
