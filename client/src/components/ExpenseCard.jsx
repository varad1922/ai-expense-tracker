import { useState } from 'react';
import { FiEdit2, FiTrash2, FiTag, FiCalendar } from 'react-icons/fi';
import { useExpenses } from '../hooks/useExpenses';
import { motion } from 'framer-motion';
import Modal from './ui/Modal';

/**
 * ExpenseCard — demonstrates:
 *
 *  useState:
 *   - `showConfirm` boolean to control the delete confirmation Modal.
 *     Keeping it local (not in context) is correct because no other component
 *     needs to know if *this* card is in confirm-delete mode.
 *
 *  Component composition:
 *   - Uses the Modal compound component: <Modal>, <Modal.Header>,
 *     <Modal.Body>, <Modal.Footer> — caller decides content, Modal
 *     decides backdrop/animation/portal behaviour.
 *
 *  getCategoryColor is a closure:
 *   - The function closes over the switch table and returns a CSS variable
 *     string. It has no side effects and doesn't need to be recreated on
 *     every render, so it's defined outside the component.
 */

// Defined outside the component — pure function, no closure over component state
const getCategoryColor = (category) => {
  switch (category) {
    case 'Food':          return 'var(--warning)';
    case 'Travel':        return 'var(--info)';
    case 'Bills':         return 'var(--danger)';
    case 'Shopping':      return 'var(--accent-tertiary)';
    case 'Entertainment': return 'var(--accent-primary)';
    default:              return 'var(--text-muted)';
  }
};

const ExpenseCard = ({ expense, onEdit }) => {
  const { deleteExpense, deleting } = useExpenses();
  const [showConfirm, setShowConfirm] = useState(false); // local UI state

  const isDeleting = deleting === expense.id;

  const handleConfirmDelete = () => {
    deleteExpense(expense.id);
    setShowConfirm(false);
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="glass-panel"
        style={{
          padding: 'var(--space-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-sm)',
          opacity: isDeleting ? 0.5 : 1,
          transition: 'opacity 0.2s',
        }}
      >
        {/* Left: icon + title + meta */}
        <div className="flex items-center gap-md">
          <div
            style={{
              width: '40px', height: '40px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${getCategoryColor(expense.category)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: getCategoryColor(expense.category),
            }}
          >
            <FiTag size={18} />
          </div>

          <div>
            <h4 style={{ fontSize: 'var(--font-md)', fontWeight: '500', color: 'var(--text-primary)' }}>
              {expense.title || 'Untitled Expense'}
            </h4>
            <div className="flex items-center gap-sm" style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>
              <span style={{ background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '10px' }}>
                {expense.category || 'Other'}
              </span>
              <span className="flex items-center gap-xs">
                <FiCalendar />
                {expense.date ? new Date(expense.date).toLocaleDateString() : 'No Date'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: amount + action buttons */}
        <div className="flex items-center gap-md">
          <span style={{ fontSize: 'var(--font-lg)', fontWeight: '600', color: 'var(--text-primary)' }}>
            ₹{expense.amount || 0}
          </span>

          <div className="flex items-center gap-sm">
            <button
              className="btn-icon"
              onClick={() => onEdit(expense)}
              style={{ color: 'var(--info)' }}
              aria-label="Edit expense"
            >
              <FiEdit2 size={16} />
            </button>
            <button
              className="btn-icon"
              onClick={() => setShowConfirm(true)}
              disabled={isDeleting}
              style={{ color: 'var(--danger)', opacity: isDeleting ? 0.5 : 1 }}
              aria-label="Delete expense"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Delete confirmation — compound component composition */}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} size="sm">
        <Modal.Header onClose={() => setShowConfirm(false)}>Delete Expense</Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to delete{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{expense.title}</strong>?
            This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn"
            onClick={() => setShowConfirm(false)}
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          >
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleConfirmDelete} style={{ background: 'var(--danger)' }}>
            Delete
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ExpenseCard;
