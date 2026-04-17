import { useAuth } from './useAuth';

export const usePermission = (permission: string): boolean => {
  const { hasPermission } = useAuth();

  return hasPermission(permission);
};
