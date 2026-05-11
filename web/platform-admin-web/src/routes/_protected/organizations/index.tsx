import { Badge,
         Button,
         Table,
         TableBody,
         TableCell,
         TableHead,
         TableHeader,
         TableRow } from '@pkg/ui';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { getCoreControllerGetOrganizationsV1QueryKey,
         useCoreControllerApproveOrganizationV1,
         useCoreControllerGetOrganizationsV1,
         useCoreControllerRejectOrganizationV1 } from '../../../api/endpoints';
import type { OrganizationResponseDto } from '../../../api/model';

export const Route = createFileRoute('/_protected/organizations/')({
  component: OrganizationsPage,
});

function OrganizationsPage() {
  const queryClient = useQueryClient();
  const { data } = useCoreControllerGetOrganizationsV1();
  const organizations: OrganizationResponseDto[] = data?.data ?? [];
  const invalidateOrganizations = () => {
    void queryClient.invalidateQueries({ queryKey: getCoreControllerGetOrganizationsV1QueryKey() });
  };
  const approveMutation = useCoreControllerApproveOrganizationV1({
    mutation: {
      onSuccess: invalidateOrganizations,
    },
  });
  const rejectMutation = useCoreControllerRejectOrganizationV1({
    mutation: {
      onSuccess: invalidateOrganizations,
    },
  });

  const handleApprove = (id: string) => {
    approveMutation.mutate({ id });
  };

  const handleReject = (id: string) => {
    rejectMutation.mutate({ id });
  };

  const getStatusVariant = (status: string) => {
    if (status === 'APPROVED') return 'default';
    if (status === 'PENDING') return 'secondary';
    return 'destructive';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">조직 관리</h1>
      </div>

      <div className="border rounded-lg bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>조직명</TableHead>
              <TableHead>도메인</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>가입일</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizations.map((org) => (
              <TableRow key={org.id}>
                <TableCell className="font-medium">{org.name}</TableCell>
                <TableCell>{org.subdomain}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(org.status)}>
                    {org.status}
                  </Badge>
                </TableCell>
                <TableCell>{org.createdAt}</TableCell>
                <TableCell className="text-right space-x-2">
                  {org.status === 'PENDING' && (
                    <>
                      <Button size="sm" onClick={() => handleApprove(org.id)}>승인</Button>
                      <Button size="sm" variant="outline" onClick={() => handleReject(org.id)}>거절</Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
