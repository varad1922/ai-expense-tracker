import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { motion } from 'framer-motion';

/**
 * Settings page — demonstrates useState patterns:
 *
 *  - Multiple independent useState calls for each field (alternative to a
 *    single form object — appropriate when fields have independent validation
 *    logic and are not reused across forms).
 *  - `status` state for async feedback: idle → saving → success/error
 *    (replaces alert() with an inline message, showing state-driven UI).
 *  - Controlled inputs: every input has a value + onChange pair so React is
 *    the single source of truth for the form (no uncontrolled DOM state).
 */
const Settings = () => {
  const { user, updateProfile } = useContext(AuthContext);

  const [name, setName]               = useState(user?.name ?? '');
  const [theme, setTheme]             = useState(user?.theme ?? 'light');
  const [monthlyBudget, setMonthlyBudget] = useState(user?.monthlyBudget ?? 50000);

  // Status state — drives UI feedback without an alert() popup
  const [status, setStatus] = useState('idle'); // 'idle' | 'saving' | 'success' | 'error'
  const [statusMsg, setStatusMsg] = useState('');

  useDocumentTitle('Settings');

  const handleSave = async (e) => {
    e.preventDefault();
    if (monthlyBudget < 0) {
      setStatus('error');
      setStatusMsg('Monthly budget cannot be negative.');
      return;
    }

    setStatus('saving');
    setStatusMsg('');

    const result = await updateProfile(name, theme, monthlyBudget);

    if (result.success) {
      setStatus('success');
      setStatusMsg('Settings saved successfully!');
    } else {
      setStatus('error');
      setStatusMsg(result.message ?? 'Failed to save settings.');
    }

    // Reset status after 3 seconds so the message disappears automatically
    setTimeout(() => setStatus('idle'), 3000);
  };

  const statusColor = {
    success: 'var(--success)',
    error:   'var(--danger)',
    saving:  'var(--text-muted)',
    idle:    'transparent',
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
          {/* Controlled input: value bound to `name` state */}
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Email is read-only — no state setter, just display */}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={user?.email ?? ''}
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
              <option value="system">System Default</option>
            </select>
          </div>

          {/* Status message — state-driven, no alert() */}
          {status !== 'idle' && (
            <p style={{ color: statusColor[status], fontSize: 'var(--font-sm)', marginTop: 'var(--space-sm)' }}>
              {status === 'saving' ? 'Saving…' : statusMsg}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={status === 'saving'}
            style={{ marginTop: 'var(--space-md)', opacity: status === 'saving' ? 0.7 : 1 }}
          >
            {status === 'saving' ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default Settings;
