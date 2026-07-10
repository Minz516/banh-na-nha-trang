import { useEffect, useState } from 'react';
import { RouterProvider, createBrowserRouter, Outlet, Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

// Admin Shell / Layout — every child route here requires a verified session.
const AdminLayout = () => {
  const { status, logout } = useAuthStore();
  const navigate = useNavigate();

  if (status === 'unauthenticated') return <Navigate to="/login" replace />;

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex min-h-screen text-left w-full max-w-[100vw] text-gray-900 bg-gray-50 m-0">
      <aside className="w-64 bg-gray-900 text-white p-4 shrink-0 flex flex-col m-0 min-h-screen fixed left-0 top-0 bottom-0 z-50">
        <h1 className="text-xl font-bold mb-6 text-white text-left pl-2 mt-4">Nhà Na Admin</h1>
        <nav className="flex flex-col gap-2 relative z-10 w-full flex-grow">
          <Link to="/" className="hover:bg-gray-800 p-2 rounded text-gray-200 hover:text-white transition-colors">Dashboard</Link>
          <Link to="/products" className="hover:bg-gray-800 p-2 rounded text-gray-200 hover:text-white transition-colors">Products & Catalog</Link>
          <Link to="/orders" className="hover:bg-gray-800 p-2 rounded text-gray-200 hover:text-white transition-colors">Orders</Link>
          <Link to="/vouchers" className="hover:bg-gray-800 p-2 rounded text-gray-200 hover:text-white transition-colors">Vouchers</Link>
          <Link to="/blog" className="hover:bg-gray-800 p-2 rounded text-gray-200 hover:text-white transition-colors">Blog</Link>

          <button onClick={handleLogout} className="text-left mt-auto hover:bg-red-800 p-2 rounded text-red-300 w-full cursor-pointer transition-colors">Logout</button>
        </nav>
      </aside>
      <main className="flex-1 p-8 ml-64 overflow-y-auto min-h-screen w-full items-start justify-start flex-col">
        <Outlet />
      </main>
    </div>
  );
};

// Stubs for real pages
const Dashboard = () => <div className="w-full text-left"><h2 className="text-2xl font-bold mb-4 text-gray-900">Dashboard</h2><p className="text-gray-600">Welcome to Bánh Tráng Nhà Na Admin.</p></div>;

const Login = () => {
  const { status, login } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (status === 'authenticated') return <Navigate to="/" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      const message = (err as { message?: string })?.message ?? 'Đăng nhập thất bại';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[100svh] w-full text-left max-w-none bg-gray-50 flex-col py-10 mt-0 m-0">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow max-w-md w-full m-auto mt-[20vh]">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Admin Login</h1>

        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded p-2 mb-4 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          placeholder="admin@banhtrangnhana.com"
        />

        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded p-2 mb-4 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
          placeholder="••••••••"
        />

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 w-full cursor-pointer disabled:opacity-50"
        >
          {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
};

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'products', element: <div className="text-left"><h2 className="text-2xl font-bold mb-4 text-gray-900">Products</h2></div> },
      { path: 'orders', element: <div className="text-left"><h2 className="text-2xl font-bold mb-4 text-gray-900">Orders</h2></div> },
      { path: 'vouchers', element: <div className="text-left"><h2 className="text-2xl font-bold mb-4 text-gray-900">Vouchers</h2></div> },
      { path: 'blog', element: <div className="text-left"><h2 className="text-2xl font-bold mb-4 text-gray-900">Blog</h2></div> },
    ]
  }
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
      <div className="flex items-center justify-center min-h-[100svh] w-full text-gray-500">
        Đang tải...
      </div>
    );
  }

  return <RouterProvider router={router} />;
}
