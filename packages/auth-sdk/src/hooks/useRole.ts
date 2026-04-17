import { useAuth } from './useAuth';

export const useRole = (role: string): boolean => {
  const { hasRole } = useAuth();

  return hasRole(role);
};
