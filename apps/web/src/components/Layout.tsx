import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function Layout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getInitials = (email: string) => {
    return email.slice(0, 2).toUpperCase();
  };

  const getUserName = () => {
    return user?.user_metadata?.full_name || user?.email || 'User';
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">⚡</div>
          <h1>Starter</h1>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
            📊 Dashboard
          </NavLink>
          <div style={{ flex: 1 }} />
          <button onClick={handleSignOut}>
            🚪 Sign out
          </button>
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">
            {getInitials(user?.email || 'U')}
          </div>
          <div className="user-info">
            <div className="user-name">{getUserName()}</div>
            <div className="user-email">{user?.email}</div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
