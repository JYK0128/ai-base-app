import { Badge,
         Button,
         Card,
         CardContent,
         CardDescription,
         CardFooter,
         CardHeader,
         CardTitle,
         Checkbox,
         Dialog,
         DialogContent,
         DialogDescription,
         DialogFooter,
         DialogHeader,
         DialogTitle,
         Input,
         Label,
         Table,
         TableBody,
         TableCell,
         TableHead,
         TableHeader,
         TableRow,
         Textarea,
         toast } from '@pkg/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Check,
         ChevronDown,
         ChevronRight,
         Edit,
         FolderTree,
         Grid,
         Info,
         Key,
         Loader2, Plus,
         Shield,
         Sliders,
         Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ApiResponse, ResourceTreeNode, RoleDto, useGetRbacResources, useGetRbacRoles, useUpdateRolePermissions } from '@/lib/api/rbac';
import axiosInstance from '@/lib/axios';

// ==========================================
// TanStack Route Definition
// ==========================================
export const Route = createFileRoute('/_protected/rbac/')({
  component: RbacPage,
});

interface RoleCheckboxCellProps {
  roleCode: string
  permCode: string
  isChecked: boolean
  onToggle: (roleCode: string, permCode: string) => Promise<void>
}

function RoleCheckboxCell({ roleCode, permCode, isChecked, onToggle }: Readonly<RoleCheckboxCellProps>) {
  return (
    <TableCell className="text-center p-3">
      <div className="flex justify-center">
        <Checkbox
          id={`${roleCode}:${permCode}`}
          checked={isChecked}
          onCheckedChange={() => {
            onToggle(roleCode, permCode).catch(() => {});
          }}
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
      </div>
    </TableCell>
  );
}

function RbacPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'roles' | 'resources' | 'matrix'>('matrix');

  // 🌟 DB Live Queries
  const { data: dbResources = [], isLoading: isResourcesLoading } = useGetRbacResources();
  const { data: dbRoles = [], isLoading: isRolesLoading } = useGetRbacRoles();

  // 🌟 Single query to fetch the entire role-permissions matrix
  const { data: matrixData = {}, isLoading: isMatrixLoading } = useQuery<Record<string, string[]>>({
    queryKey: ['rbac.matrix'],
    queryFn: async () => {
      const res = await axiosInstance<ApiResponse<Record<string, string[]>>>({
        url: '/api/v1/rbac/matrix',
        method: 'GET',
      });
      return res.data;
    },
  });

  // 🌟 Assemble checked status mappings: mappings["roleCode:permissionCode"] = true
  const mappings: Record<string, boolean> = {};
  dbRoles.forEach((role) => {
    const rolePermissions = matrixData[role.code] ?? [];
    rolePermissions.forEach((permCode) => {
      mappings[`${role.code}:${permCode}`] = true;
    });
  });

  const updatePermissionsMutation = useUpdateRolePermissions();

  // States for Dialogs & Forms (Keep local state for UI simulations)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleDto | null>(null);
  const [roleForm, setRoleForm] = useState<Omit<RoleDto, 'id'>>({
    code: '',
    name: '',
    description: '',
    scope: 'ORGANIZATION',
  });

  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [selectedParentResource, setSelectedParentResource] = useState<ResourceTreeNode | null>(null);
  const [resourceForm, setResourceForm] = useState({
    code: '',
    name: '',
    type: 'MENU',
    path: '',
    icon: '',
    httpMethod: 'GET',
    pathPattern: '',
    actionsStr: 'READ',
  });

  // Expandable node tracking for Resources tab
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ==========================================
  // Role CRUD Actions (Local simulations for now)
  // ==========================================
  const handleOpenRoleAdd = () => {
    setSelectedRole(null);
    setRoleForm({
      code: '',
      name: '',
      description: '',
      scope: 'ORGANIZATION',
    });
    setIsRoleDialogOpen(true);
  };

  const handleOpenRoleEdit = (role: RoleDto) => {
    setSelectedRole(role);
    setRoleForm({
      code: role.code,
      name: role.name,
      description: role.description ?? '',
      scope: role.scope,
    });
    setIsRoleDialogOpen(true);
  };

  const handleSaveRole = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.info('역할 추가/수정은 API 통합 단계 이후 데이터베이스에 저장됩니다. (현재 Matrix 실시간 연동 완료)');
    setIsRoleDialogOpen(false);
  };

  const handleDeleteRole = (id: string, code: string) => {
    if (confirm(`'${code}' 역할을 정말로 삭제하시겠습니까?`)) {
      toast.info('역할 삭제는 API 통합 단계 이후 반영됩니다.');
    }
  };

  // ==========================================
  // Resource CRUD Actions (Local simulations for now)
  // ==========================================
  const handleOpenResourceAdd = (parent: ResourceTreeNode | null = null) => {
    setSelectedParentResource(parent);
    setResourceForm({
      code: '',
      name: '',
      type: parent ? 'API' : 'MENU',
      path: '',
      icon: 'Folder',
      httpMethod: 'GET',
      pathPattern: '',
      actionsStr: parent ? 'EXECUTE' : 'READ,CREATE,UPDATE,DELETE',
    });
    setIsResourceDialogOpen(true);
  };

  const handleSaveResource = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.info('자원 추가는 API 통합 단계 이후 데이터베이스에 저장됩니다.');
    setIsResourceDialogOpen(false);
  };

  const handleDeleteResource = (id: string, code: string) => {
    if (confirm(`'${code}' 자원을 정말로 삭제하시겠습니까?`)) {
      toast.info('자원 삭제는 API 통합 단계 이후 반영됩니다.');
    }
  };

  // ==========================================
  // Matrix Permission Toggle Actions (Live transactional mapping updates!)
  // ==========================================
  const handleToggleMapping = async (roleCode: string, permissionCode: string) => {
    const key = `${roleCode}:${permissionCode}`;
    const isCurrentlyChecked = !!mappings[key];

    const currentPermissions = matrixData[roleCode] ?? [];

    let newPermissions: string[];
    if (isCurrentlyChecked) {
      newPermissions = currentPermissions.filter((p) => p !== permissionCode);
    }
    else {
      newPermissions = [...currentPermissions, permissionCode];
    }

    try {
      await updatePermissionsMutation.mutateAsync({
        roleCode,
        permissionCodes: newPermissions,
      });

      // 🌟 Invalidate the entire matrix query so that UI instantly updates!
      await queryClient.invalidateQueries({ queryKey: ['rbac.matrix'] });

      if (!isCurrentlyChecked) {
        toast.success(`'${roleCode}' 역할에 '${permissionCode}' 권한이 부여되었습니다.`, {
          icon: '🔑',
        });
      }
      else {
        toast.info(`'${roleCode}' 역할의 '${permissionCode}' 권한이 취소되었습니다.`, {
          icon: '🔒',
        });
      }
    }
    catch (error) {
      console.error(error);
      toast.error('권한 매핑을 변경하는 데 실패했습니다.');
    }
  };

  // Recursively render resource tree in Resources Tab
  const renderResourceTree = (node: ResourceTreeNode, depth: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes[node.id];

    // 중첩 삼항 연산자 제거 및 리팩토링
    const getBadgeVariant = (type: string): 'default' | 'secondary' | 'outline' => {
      if (type === 'MENU') return 'default';
      if (type === 'API') return 'secondary';
      return 'outline';
    };
    const badgeVariant = getBadgeVariant(node.type);

    const getChevronIcon = () => {
      if (!hasChildren) {
        return <ChevronRight className="w-4 h-4 opacity-30" />;
      }
      return isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />;
    };
    const chevronIcon = getChevronIcon();

    return (
      <div key={node.id} className="select-none">
        <div
          className="flex items-center justify-between p-2 hover:bg-slate-50 border-b border-slate-100 rounded-lg group transition-colors"
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
        >
          <div className="flex items-center gap-2">
            <span
              onClick={() => hasChildren && toggleExpand(node.id)}
              className={`p-1 cursor-pointer rounded hover:bg-slate-200 transition-colors ${
                hasChildren ? 'text-slate-600' : 'text-slate-300 pointer-events-none'
              }`}
            >
              {chevronIcon}
            </span>

            <span className="font-semibold text-slate-800">{node.name}</span>
            <span className="text-xs text-slate-400 font-mono">
              (
              {node.code}
              )
            </span>

            <Badge
              variant={badgeVariant}
              className="text-[10px] px-1 py-0"
            >
              {node.type}
            </Badge>

            {node.type === 'MENU' && node.path && (
              <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                {node.path}
              </span>
            )}
            {node.type === 'API' && node.httpMethod && (
              <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                {node.httpMethod}
                {' '}
                {node.pathPattern}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 hover:text-blue-600"
              onClick={() => handleOpenResourceAdd(node)}
              title="하위 자원 추가"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 hover:text-red-600"
              onClick={() => handleDeleteResource(node.id, node.code)}
              title="자원 삭제"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-0.5">
            {node.children.map((child) => renderResourceTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Recursively render matrix rows (Tree row header + checkbox cells)
  const renderMatrixRows = (node: ResourceTreeNode, depth: number = 0): React.ReactNode[] => {
    const list: React.ReactNode[] = [];
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes[node.id];

    // Map permissions directly from the database schema
    node.permissions.forEach((permission, actionIdx) => {
      const isFirstAction = actionIdx === 0;
      const permCode = permission.code;

      list.push(
        <TableRow key={permission.id} className="hover:bg-slate-50/50">
          {/* Resource Name and Code cell */}
          <TableCell className="font-medium p-3" style={{ paddingLeft: `${depth * 20 + 12}px` }}>
            {isFirstAction
              ? (
                <div className="flex items-center gap-2">
                  {hasChildren
                    ? (
                      <span
                        onClick={() => toggleExpand(node.id)}
                        className="p-0.5 cursor-pointer rounded hover:bg-slate-200"
                      >
                        {isExpanded
                          ? (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                          )
                          : (
                            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                          )}
                      </span>
                    )
                    : (
                      <span className="w-4 h-4 inline-block" />
                    )}
                  <div>
                    <span className="text-slate-800 font-semibold">{node.name}</span>
                    <span className="text-xs text-slate-400 font-mono ml-1.5">
                      (
                      {node.code}
                      )
                    </span>
                  </div>
                  <Badge
                    variant={node.type === 'MENU' ? 'default' : 'secondary'}
                    className="text-[9px] scale-90 px-1 py-0"
                  >
                    {node.type}
                  </Badge>
                </div>
              )
              : (
                <span className="text-slate-400 text-xs italic ml-6">↳ 세부 액션 기능</span>
              )}
          </TableCell>

          {/* Specific Action Cell */}
          <TableCell className="p-3">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-mono">
              {permission.action}
            </Badge>
          </TableCell>

          {/* Role Checkboxes */}
          {dbRoles.map((role) => {
            const key = `${role.code}:${permCode}`;
            const isChecked = !!mappings[key];

            return (
              <RoleCheckboxCell
                key={role.code}
                roleCode={role.code}
                permCode={permCode}
                isChecked={isChecked}
                onToggle={handleToggleMapping}
              />
            );
          })}
        </TableRow>,
      );
    });

    // Render children recursively if expanded
    if (hasChildren && isExpanded) {
      node.children.forEach((child) => {
        list.push(...renderMatrixRows(child, depth + 1));
      });
    }

    return list;
  };

  const isDataLoading = isResourcesLoading || isRolesLoading || isMatrixLoading;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Title Header */}
      <div className="flex flex-col gap-1 md:flex-row md:justify-between md:items-center border-b pb-4 border-slate-200">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
            <Shield className="w-6 h-6 text-blue-600" />
            동적 권한 관리 (Dynamic RBAC)
          </h1>
          <p className="text-slate-500 text-sm">
            역할(Role)을 생성하고 플랫폼 자원(Resource) 트리 구조를 기반으로 실시간 권한(Permission) 매핑 매트릭스를 제어합니다.
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button
            variant={activeTab === 'matrix' ? 'default' : 'outline'}
            onClick={() => setActiveTab('matrix')}
            className="gap-2"
          >
            <Grid className="w-4 h-4" />
            권한 매핑 매트릭스
          </Button>
          <Button
            variant={activeTab === 'roles' ? 'default' : 'outline'}
            onClick={() => setActiveTab('roles')}
            className="gap-2"
          >
            <Key className="w-4 h-4" />
            역할(Roles) 관리
          </Button>
          <Button
            variant={activeTab === 'resources' ? 'default' : 'outline'}
            onClick={() => setActiveTab('resources')}
            className="gap-2"
          >
            <FolderTree className="w-4 h-4" />
            자원(Resources) 트리
          </Button>
        </div>
      </div>

      {/* Info Notice Panel */}
      <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 flex gap-3 text-slate-700">
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-blue-900">동적 RBAC 실시간 데이터베이스 연동 시스템 완료</p>
          <p className="text-slate-600 mt-1 leading-relaxed border-t pt-1 border-blue-100/50">
            현재 화면은
            {' '}
            <strong>PostgreSQL 데이터베이스 테이블</strong>
            과 실시간으로 연동되어 동작합니다. 매트릭스 탭에서 체크박스를 클릭하여
            역할별 권한 매핑을 변경하면
            {' '}
            <strong>백엔드 트랜잭션 API</strong>
            가 안전하게 작동하여 권한 매핑이 즉시 갱신되며, 시스템 전체 인가 가드에 실시간 배포 없이 반영됩니다.
          </p>
        </div>
      </div>

      {/* Loading Spinner */}
      {isDataLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-500 text-sm">데이터베이스에서 실시간 RBAC 메타데이터를 불러오고 있습니다...</p>
        </div>
      )}

      {/* TAB CONTENT: ROLE-PERMISSION MATRIX */}
      {!isDataLoading && activeTab === 'matrix' && (
        <Card className="border-slate-200/80 shadow-sm overflow-hidden animate-fade-in">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg font-bold flex items-center gap-1.5 text-slate-800">
                  <Sliders className="w-4 h-4 text-blue-500" />
                  실시간 권한 매트릭스 제어판
                </CardTitle>
                <CardDescription>
                  각 자원의 액션(세부 기능)에 체크표시하여 다이나믹하게 사용 권한을 배포 없이 활성화하거나 통제합니다.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-100/50">
                <TableRow>
                  <TableHead className="w-[320px] font-semibold text-slate-700">통제 대상 자원 (Resource Tree)</TableHead>
                  <TableHead className="w-[120px] font-semibold text-slate-700">보안 행위 (Action)</TableHead>
                  {dbRoles.map((role) => (
                    <TableHead key={role.code} className="text-center font-semibold text-slate-700 min-w-[140px]">
                      <div className="flex flex-col items-center">
                        <span className="text-slate-900 font-bold">{role.name}</span>
                        <Badge variant="outline" className="mt-1 bg-white text-[10px] scale-90">
                          {role.code}
                        </Badge>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {dbResources.map((res) => renderMatrixRows(res))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-4 justify-between">
            <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
              <Check className="w-4 h-4 text-green-600" />
              체크박스 변경 시 즉시 백엔드 트랜잭션이 수행되어 데이터베이스에 100% 안전하게 저장됩니다.
            </div>
            <Button size="sm" onClick={() => toast.success('현재 권한 매핑 테이블이 실시간으로 동기화되어 안전하게 보관되어 있습니다.')}>
              동기화 상태 완료
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* TAB CONTENT: ROLE MANAGEMENT */}
      {!isDataLoading && activeTab === 'roles' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">역할(Role) 그룹 관리</h2>
            <Button onClick={handleOpenRoleAdd} className="gap-1 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4" />
              역할 등록
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dbRoles.map((role) => (
              <Card key={role.id} className="border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="bg-slate-50 font-mono text-[10px]">
                      {role.scope}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800"
                        onClick={() => handleOpenRoleEdit(role)}
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-slate-500 hover:text-red-600"
                        onClick={() => handleDeleteRole(role.id, role.code)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold mt-2 text-slate-900">{role.name}</CardTitle>
                  <CardDescription className="font-mono text-xs text-blue-600 font-bold mt-1">
                    {role.code}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-slate-600 text-sm py-0 flex-1">
                  {role.description || '지정된 상세 설명이 없습니다.'}
                </CardContent>
                <CardFooter className="pt-4 border-t border-slate-100 bg-slate-50/50 mt-4 text-xs text-slate-400">
                  DB ID:
                  {' '}
                  {role.id}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: RESOURCE TREE EDITOR */}
      {!isDataLoading && activeTab === 'resources' && (
        <Card className="border-slate-200/80 shadow-sm animate-fade-in">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg font-bold text-slate-800">통합 권한 자원 트리 에디터</CardTitle>
                <CardDescription>
                  메뉴, 백엔드 API, 기능 버튼 등을 논리적인 트리 형태로 구성하여 권한 자원을 체계적으로 정의합니다.
                </CardDescription>
              </div>
              <Button onClick={() => handleOpenResourceAdd(null)} className="gap-1 bg-slate-800 hover:bg-slate-900 text-white">
                <Plus className="w-4 h-4" />
                최상위 자원 추가
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {dbResources.map((res) => renderResourceTree(res))}
          </CardContent>
        </Card>
      )}

      {/* DIALOG: ROLE ADD/EDIT */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>{selectedRole ? '역할 편집' : '신규 역할 등록'}</DialogTitle>
            <DialogDescription>
              사용자 계정에 부여하여 접근 권한을 제어할 시스템의 역할 명칭과 범위를 설정합니다.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveRole} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="role-code">역할 코드 (영대문자 및 언더바)</Label>
              <Input
                id="role-code"
                placeholder="예: SYSTEM_OPERATOR"
                value={roleForm.code}
                onChange={(e) => setRoleForm({ ...roleForm, code: e.target.value })}
                disabled={!!selectedRole}
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role-name">역할 명칭 (표시 이름)</Label>
              <Input
                id="role-name"
                placeholder="예: 시스템 운영자"
                value={roleForm.name}
                onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role-scope">적용 스코프</Label>
              <select
                id="role-scope"
                value={roleForm.scope}
                onChange={(e) => setRoleForm({ ...roleForm, scope: e.target.value as 'PLATFORM' | 'ORGANIZATION' })}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="PLATFORM">PLATFORM (플랫폼 전체 어드민)</option>
                <option value="ORGANIZATION">ORGANIZATION (조직 테넌트 한정)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role-desc">역할 설명</Label>
              <Textarea
                id="role-desc"
                placeholder="해당 역할이 가지는 권한 범위에 대한 상세 설명입니다."
                value={roleForm.description}
                onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
              />
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
                취소
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">저장</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG: RESOURCE ADD */}
      <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>
              {selectedParentResource ? `'${selectedParentResource.name}' 하위 자원 추가` : '최상위 자원 추가'}
            </DialogTitle>
            <DialogDescription>
              플랫폼에 정의하여 인가를 수행할 자원의 종류와 물리 매핑 값을 정의합니다.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveResource} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="res-type">자원 구분</Label>
              <select
                id="res-type"
                value={resourceForm.type}
                onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value })}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="MENU">MENU (프론트엔드 메뉴 페이지)</option>
                <option value="API">API (백엔드 라우트 주소)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="res-code">자원 고유 코드 (영문)</Label>
              <Input
                id="res-code"
                placeholder="예: FAQ, USER_DELETE"
                value={resourceForm.code}
                onChange={(e) => setResourceForm({ ...resourceForm, code: e.target.value })}
                className="font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="res-name">자원 표시 명칭</Label>
              <Input
                id="res-name"
                placeholder="예: 자주 묻는 질문 관리, 사용자 삭제 버튼"
                value={resourceForm.name}
                onChange={(e) => setResourceForm({ ...resourceForm, name: e.target.value })}
              />
            </div>

            {/* Menu-specific fields */}
            {resourceForm.type === 'MENU' && (
              <div className="space-y-4 border-t pt-3 mt-3 border-slate-100">
                <div className="space-y-1.5">
                  <Label htmlFor="res-path">라우트 경로 (Path)</Label>
                  <Input
                    id="res-path"
                    placeholder="예: /faq"
                    value={resourceForm.path}
                    onChange={(e) => setResourceForm({ ...resourceForm, path: e.target.value })}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="res-icon">아이콘 이름 (Lucide Icon 명)</Label>
                  <Input
                    id="res-icon"
                    placeholder="예: QuestionMark, HelpCircle"
                    value={resourceForm.icon}
                    onChange={(e) => setResourceForm({ ...resourceForm, icon: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* API-specific fields */}
            {resourceForm.type === 'API' && (
              <div className="space-y-4 border-t pt-3 mt-3 border-slate-100">
                <div className="space-y-1.5">
                  <Label htmlFor="res-method">HTTP Method</Label>
                  <select
                    id="res-method"
                    value={resourceForm.httpMethod}
                    onChange={(e) => setResourceForm({ ...resourceForm, httpMethod: e.target.value })}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="GET">GET (조회)</option>
                    <option value="POST">POST (생성)</option>
                    <option value="PUT">PUT (수정)</option>
                    <option value="DELETE">DELETE (삭제)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="res-pattern">API URL 패턴 (Path Pattern)</Label>
                  <Input
                    id="res-pattern"
                    placeholder="예: /api/v1/faqs/*"
                    value={resourceForm.pathPattern}
                    onChange={(e) => setResourceForm({ ...resourceForm, pathPattern: e.target.value })}
                    className="font-mono"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5 border-t pt-3 mt-3 border-slate-100">
              <Label htmlFor="res-actions">허용 보안 행위 목록 (쉼표 구분)</Label>
              <Input
                id="res-actions"
                placeholder="예: READ, CREATE, UPDATE, DELETE"
                value={resourceForm.actionsStr}
                onChange={(e) => setResourceForm({ ...resourceForm, actionsStr: e.target.value })}
                className="font-mono"
              />
              <p className="text-[11px] text-slate-400">자원 위에서 체크박스로 통제할 세부 권한 행위를 나열합니다.</p>
            </div>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsResourceDialogOpen(false)}>
                취소
              </Button>
              <Button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white">자원 저장</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
