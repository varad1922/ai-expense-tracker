import { Link } from "react-router-dom";
import { useContext } from 'react';
import { FiMenu, FiBell, FiUser, FiLogOut } from "react-icons/fi";
import { AuthContext } from '../context/AuthContext';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: 'var(--space-md) var(--space-xl)',
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--glass-border)',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        <button onClick={toggleSidebar} className="btn-icon">
          <FiMenu size={24} />
        </button>
        <h1 style={{ fontSize: 'var(--font-lg)', fontWeight: 600, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Nexus Expense AI
        </h1>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        <button className="btn-icon">
          <FiBell size={20} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', background: 'var(--bg-secondary)', padding: 'var(--space-xs) var(--space-sm)', borderRadius: 'var(--radius-full)' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiUser size={16} color="white" />
          </div>
          <span style={{ fontSize: 'var(--font-sm)', fontWeight: 500 }}>{user?.name || 'User'}</span>
        </div>
        <button onClick={logout} className="btn-icon" title="Logout">
          <FiLogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;