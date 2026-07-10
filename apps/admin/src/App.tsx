import { RouterProvider, createBrowserRouter, Outlet, Navigate, Link } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

// Admin Shell / Layout
const AdminLayout = () => {
  const { isAuthenticated, logout } = useAuthStore();
  
  // Guard
  if (!isAuthenticated) return <Navigate to="/login" replace />;

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
          
          <button onClick={logout} className="text-left mt-auto hover:bg-red-800 p-2 rounded text-red-300 w-full cursor-pointer transition-colors">Logout</button>
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

// We'll fake login to true for development layout viewing
const Login = () => {
  const setAuth = useAuthStore(state => state.setAuth);
  return (
    <div className="flex items-center justify-center min-h-[100svh] w-full text-left max-w-none bg-gray-50 flex-col py-10 mt-0 m-0">
      <div className="bg-white p-8 rounded shadow max-w-md w-full m-auto mt-[20vh]">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">Admin Login</h1>
        <button 
          onClick={() => setAuth({ _id: '1', email: 'admin@banhtrangnhana.com', role: 'admin', isActive: true, createdAt: new Date(), updatedAt: new Date() } as any)}
          className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 w-full cursor-pointer">
          Click here to bypass login during dev
        </button>
      </div>
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
  return <RouterProvider router={router} />;
}
