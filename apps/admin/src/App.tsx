import { useEffect } from 'react';
import { RouterProvider, createBrowserRouter, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { Orders } from './pages/Orders';
import { Customers } from './pages/Customers';
import { Products } from './pages/Products';
import { Store } from './pages/Store';

// Admin shell — every child route here requires a verified session.
// Section 16.7 — sidebar nav, desktop-first (the one context where desktop,
// not mobile, is the primary canvas — internal operators work at a desk).
function AdminLayout() {
  const { status, logout } = useAuthStore();
  const navigate = useNavigate();

  if (status === 'unauthenticated') return <Navigate to="/login" replace />;

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-background-alt">
      <Sidebar onLogout={handleLogout} />
      <main className="ml-60 min-h-screen p-6 xl:p-8">
        <Outlet />
      </main>
    </div>
  );
}

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Orders /> },
      { path: 'customers', element: <Customers /> },
      { path: 'products', element: <Products /> },
      { path: 'store', element: <Store /> },
    ],
  },
]);

export default function App() {
  const { status, checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Verify the real session (via the httpOnly cookie) before any route renders — this
  // is what makes AdminLayout's guard trustworthy instead of a client-spoofable flag.
  if (status === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-[100svh] w-full bg-background text-text-secondary">
        Đang tải...
      </div>
    );
  }

  return <RouterProvider router={router} />;
}
