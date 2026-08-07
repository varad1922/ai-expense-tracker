import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Settings = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [theme, setTheme] = useState(user?.theme || 'light');
  const [monthlyBudget, setMonthlyBudget] = useState(user?.monthlyBudget || 50000);
  
  const handleSave = async (e) => {
    e.preventDefault();
    const result = await updateProfile(name, theme, monthlyBudget);
    if (result.success) {
      alert('Settings saved successfully!');
    } else {
      alert('Failed to save settings: ' + result.message);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="container" 
      style={{ padding: 'var(--space-xl) 0' }}
    >
      <h2 style={{ marginBottom: 'var(--space-lg)' }}>Settings ⚙️</h2>
      
      <div className="glass-panel" style={{ padding: 'var(--space-xl)', maxWidth: '600px' }}>
        <h3 style={{ marginBottom: 'var(--space-md)' }}>Profile Information 👤</h3>
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
          
          <div className="form-group" style={{ marginTop: 'var(--space-md)' }}>
            <label className="form-label">Monthly Budget (₹)</label>
            <input 
              type="number" 
              className="form-input" 
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(Number(e.target.value))}
              min="0"
            />
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
    </motion.div>
  );
};

export default Settings;
