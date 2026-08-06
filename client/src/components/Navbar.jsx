import { Link } from "react-router-dom";
import { useContext, useState, useRef, useEffect } from 'react';
import { FiMenu, FiBell, FiUser, FiLogOut } from "react-icons/fi";
import { AuthContext } from '../context/AuthContext';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout, notifications } = useContext(AuthContext);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.length;

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
          <button className="btn-icon" onClick={() => setShowNotifs(!showNotifs)}>
            <FiBell size={20} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: 0,
                right: 0,
                background: 'var(--danger)',
                color: 'white',
                fontSize: '10px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {unreadCount}
              </span>
            )}
          </button>
          
          {showNotifs && (
            <div className="glass-panel" style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              width: '280px',
              marginTop: 'var(--space-sm)',
              padding: 'var(--space-sm) 0',
              zIndex: 20
            }}>
              <h3 style={{ padding: '0 var(--space-md)', fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>Notifications</h3>
              {notifications.length === 0 ? (
                <div style={{ padding: 'var(--space-md)', textAlign: 'center', color: 'var(--text-muted)' }}>No new notifications</div>
              ) : (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {notifications.map(notif => (
                    <div key={notif.id} style={{ padding: 'var(--space-sm) var(--space-md)', borderBottom: '1px solid var(--glass-border)', fontSize: 'var(--font-sm)' }}>
                      <div>{notif.message}</div>
                      <small style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                        {new Date(notif.time).toLocaleTimeString()}
                      </small>
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