import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

// Section 16.8 — Authentication: minimal, single-purpose form, one primary
// CTA, no marketing content competing with the task.
export function Login() {
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
    <div className="flex items-center justify-center min-h-[100svh] w-full bg-background px-4">
      <form onSubmit={handleSubmit} className="bg-card rounded-lg shadow-lg max-w-sm w-full p-8">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-text-primary text-center mb-1">
          Nhà Na Admin
        </h1>
        <p className="text-sm text-text-secondary text-center mb-6">Đăng nhập để quản lý cửa hàng</p>

        <label htmlFor="email" className="block text-sm font-semibold text-text-secondary mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-11 px-4 mb-4 rounded-sm border border-border bg-surface outline-none focus:ring-2 focus:ring-[color:var(--color-focus-ring)]"
          placeholder="admin@banhtrangnhana.com"
        />

        <label htmlFor="password" className="block text-sm font-semibold text-text-secondary mb-1">
          Mật khẩu
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full h-11 px-4 mb-4 rounded-sm border border-border bg-surface outline-none focus:ring-2 focus:ring-[color:var(--color-focus-ring)]"
          placeholder="••••••••"
        />

        {error && <p className="text-sm text-danger mb-4">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-11 rounded-md bg-primary text-white font-semibold shadow-sm hover:bg-primary-hover active:bg-primary-active active:scale-[0.98] transition-all disabled:opacity-40 disabled:active:scale-100 cursor-pointer"
        >
          {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
    </div>
  );
}
