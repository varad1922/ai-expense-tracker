import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const Settings = () => {
  const { user, updateProfile, theme, setTheme } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [error, setError] = useState('');
  
  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    const res = await updateProfile(name);
    if (!res.success) {
      setError(res.message);
    }
  };

  return (
    <div className="container" style={{ padding: 'var(--space-xl) 0' }}>
      <h2 style={{ marginBottom: 'var(--space-lg)' }}>Settings</h2>
      
      <div className="glass-panel" style={{ padding: 'var(--space-xl)', maxWidth: '600px' }}>
        <h3 style={{ marginBottom: 'var(--space-md)' }}>Profile Information</h3>
        {error && <div style={{ color: 'var(--danger)', marginBottom: 'var(--space-md)' }}>{error}</div>}
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input 
              type="text" 
              className="form-input" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled
            />
            <small style={{ color: 'var(--text-muted)' }}>Email cannot be changed.</small>
          </div>
          
          <div className="form-group" style={{ marginTop: 'var(--space-lg)' }}>
            <label className="form-label">Theme Preference</label>
            <select 
              className="form-input"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="light">Light Theme</option>
              <option value="dark">Dark Theme</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>Save Changes</button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
