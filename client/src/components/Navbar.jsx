import { Link } from "react-router-dom";
import { useContext, useState, useRef, useEffect } from 'react';
import { FiMenu, FiBell, FiUser, FiLogOut } from "react-icons/fi";
import { AuthContext } from '../context/AuthContext';
import { ExpenseContext } from '../context/ExpenseContext';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);
  const { notifications, setNotifications } = useContext(ExpenseContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    if (setNotifications) {
      setNotifications(prev => prev.map(n => ({...n, read: true})));
    }
  };

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
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button className="btn-icon" onClick={() => setShowNotifications(!showNotifications)}>
            <FiBell size={20} />
            {unreadCount > 0 && (
              <span style={{ position: 'absolute', top: 0, right: 0, background: 'var(--danger)', color: 'white', fontSize: '10px', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {unreadCount}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="glass-panel" style={{ 
              position: 'absolute', top: '100%', right: '0', width: '300px', 
              marginTop: 'var(--space-sm)', padding: 'var(--space-md)', 
              zIndex: 20, maxHeight: '400px', overflowY: 'auto' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                <h3 style={{ fontSize: 'var(--font-md)', fontWeight: 600, color: 'var(--text-primary)' }}>Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} style={{ background: 'none', border: 'none', color: 'var(--info)', fontSize: 'var(--font-xs)', cursor: 'pointer' }}>
                    Mark all as read
                  </button>
                )}
              </div>
              
              {(!notifications || notifications.length === 0) ? (
                <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>No new notifications</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                  {notifications.map(n => (
                    <div key={n.id} style={{ 
                      padding: 'var(--space-sm)', 
                      background: n.read ? 'transparent' : 'rgba(139, 92, 246, 0.1)',
                      borderRadius: 'var(--radius-sm)',
                      borderLeft: n.read ? '2px solid transparent' : '2px solid var(--accent-primary)'
                    }}>
                      <p style={{ fontSize: 'var(--font-sm)', margin: 0, color: 'var(--text-primary)' }}>{n.message}</p>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(n.date).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
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