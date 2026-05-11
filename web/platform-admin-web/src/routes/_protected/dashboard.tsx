import { createFileRoute } from '@tanstack/react-router';

import { useAuth } from '../../hooks/useAuth';

export const Route = createFileRoute('/_protected/dashboard')({
  component: Dashboard,
});

function Dashboard() {
  const { logout } = useAuth();

  return (
    <div className="p-10 font-sans">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-slate-600 mb-6">Welcome to the protected dashboard area.</p>
      <button
        onClick={() => {
          logout();
          window.location.href = '/';
        }}
        className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold"
      >
        Logout
      </button>
    </div>
  );
}
