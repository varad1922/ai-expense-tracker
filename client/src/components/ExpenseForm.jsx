import { useEffect } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { useFormState } from '../hooks/useFormState';
import { motion } from 'framer-motion';

/**
 * ExpenseForm — demonstrates:
 *
 *  useState (via useFormState hook):
 *   - Single object state for all form fields (spread updates)
 *   - Per-field error state
 *   - isDirty derived state (shows cancel only when form has changed)
 *   - reset() with new initial values when entering edit mode
 *
 *  useEffect:
 *   - [currentExpense] dependency: syncs form state when parent passes an
 *     expense to edit. Calls reset(newValues) which is the functional-updater
 *     equivalent — always operates on the latest initialValues snapshot.
 *   - Cleanup is implicit: because we only call setValues (no timers/subs),
 *     the effect is safe to re-run on every currentExpense change.
 */

const categoryEmojis = {
  Food:          '🍔 Food',
  Travel:        '✈️ Travel',
  Bills:         '🧾 Bills',
  Shopping:      '🛍️ Shopping',
  Entertainment: '🍿 Entertainment',
  Other:         '📦 Other',
};

const today = new Date().toISOString().split('T')[0];

const INITIAL_VALUES = {
  title:    '',
  amount:   '',
  category: 'Other',
  date:     today,
};

const ExpenseForm = ({ currentExpense, clearCurrentExpense }) => {
  const { addExpense, editExpense, categories, saving } = useExpenses();

  // useFormState encapsulates all the useState / functional-updater patterns
  const { values, errors, handleChange, setError, reset, isDirty } = useFormState(INITIAL_VALUES);

  // ── useEffect: sync form when switching into edit mode ────────────────────
  // Dependency: [currentExpense] — only re-runs when the parent selects a
  // different expense to edit. Without the dependency array it would run on
  // every render, resetting the form while the user is typing.
  useEffect(() => {
    if (currentExpense) {
      reset({
        title:    currentExpense.title,
        amount:   String(currentExpense.amount),
        category: currentExpense.category,
        // Normalise to YYYY-MM-DD for the date input
        date: currentExpense.date
          ? new Date(currentExpense.date).toISOString().split('T')[0]
          : today,
      });
    } else {
      reset(); // clear form when edit is cancelled
    }
  }, [currentExpense]); // eslint-disable-line react-hooks/exhaustive-deps

  const validate = () => {
    let valid = true;
    if (!values.title.trim()) {
      setError('title', 'Title is required');
      valid = false;
    }
    if (!values.amount || isNaN(Number(values.amount)) || Number(values.amount) <= 0) {
      setError('amount', 'Enter a valid positive amount');
      valid = false;
    }
    if (!values.date) {
      setError('date', 'Date is required');
      valid = false;
    }
    return valid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (currentExpense) {
      editExpense(currentExpense.id, values);
      clearCurrentExpense();
    } else {
      addExpense(values);
    }

    reset();
  };

  const inputStyle = (field) => ({
    borderColor: errors[field] ? 'var(--danger)' : undefined,
  });

  return (
    <div className="glass-panel" style={{ padding: 'var(--space-lg)', position: 'sticky', top: '100px' }}>
      <h3 style={{ marginBottom: 'var(--space-md)', fontSize: 'var(--font-lg)', color: 'var(--text-primary)' }}>
        {currentExpense ? 'Edit Expense' : 'Add New Expense'}
      </h3>

      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="form-group">
          <label className="form-label">Title</label>
          <motion.input
            whileFocus={{ scale: 1.02, borderColor: 'var(--accent-primary)' }}
            type="text"
            className="form-input"
            placeholder="e.g., Pizza"
            value={values.title}
            onChange={handleChange('title')}
            style={inputStyle('title')}
          />
          {errors.title && (
            <small style={{ color: 'var(--danger)', fontSize: 'var(--font-xs)' }}>{errors.title}</small>
          )}
        </div>

        {/* Amount */}
        <div className="form-group">
          <label className="form-label">Amount (₹)</label>
          <motion.input
            whileFocus={{ scale: 1.02, borderColor: 'var(--accent-primary)' }}
            type="number"
            className="form-input"
            placeholder="e.g., 500"
            value={values.amount}
            onChange={handleChange('amount')}
            style={inputStyle('amount')}
            min="0"
          />
          {errors.amount && (
            <small style={{ color: 'var(--danger)', fontSize: 'var(--font-xs)' }}>{errors.amount}</small>
          )}
        </div>

        {/* Category */}
        <div className="form-group">
          <label className="form-label">Category</label>
          <motion.select
            whileFocus={{ scale: 1.02, borderColor: 'var(--accent-primary)' }}
            className="form-input"
            value={values.category}
            onChange={handleChange('category')}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{categoryEmojis[cat] ?? cat}</option>
            ))}
          </motion.select>
        </div>

        {/* Date */}
        <div className="form-group" style={{ marginBottom: 'var(--space-lg)' }}>
          <label className="form-label">Date</label>
          <motion.input
            whileFocus={{ scale: 1.02, borderColor: 'var(--accent-primary)' }}
            type="date"
            className="form-input"
            value={values.date}
            onChange={handleChange('date')}
            style={inputStyle('date')}
          />
          {errors.date && (
            <small style={{ color: 'var(--danger)', fontSize: 'var(--font-xs)' }}>{errors.date}</small>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          className="btn btn-primary"
          disabled={saving}
          style={{ width: '100%', marginTop: 'var(--space-md)', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Saving…' : currentExpense ? 'Update Expense' : 'Add Expense'}
        </motion.button>

        {/* Show cancel only when editing OR when the form has been touched */}
        {(currentExpense || isDirty) && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            className="btn"
            onClick={() => { reset(); clearCurrentExpense?.(); }}
            style={{
              width: '100%',
              marginTop: 'var(--space-sm)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
            }}
          >
            {currentExpense ? 'Cancel Edit' : 'Clear'}
          </motion.button>
        )}
      </form>
    </div>
  );
};

export default ExpenseForm;
