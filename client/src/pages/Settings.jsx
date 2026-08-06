import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

const Settings = () => {
  const { user } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  
  const handleSave = (e) => {
    e.preventDefault();
    alert('Settings saved! (Mock implementation)');
  };

  return (
    <div className="container" style={{ padding: 'var(--space-xl) 0' }}>
      <h2 style={{ marginBottom: 'var(--space-lg)' }}>Settings</h2>
      
      <div className="glass-panel" style={{ padding: 'var(--space-xl)', maxWidth: '600px' }}>
        <h3 style={{ marginBottom: 'var(--space-md)' }}>Profile Information</h3>
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
            <select className="form-input">
              <option value="light">Light Theme (Active)</option>
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
