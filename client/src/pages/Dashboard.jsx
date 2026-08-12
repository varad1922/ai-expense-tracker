import { useState } from 'react';
import DashboardStats from '../components/DashboardStats';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import SearchBar from '../components/SearchBar';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { motion } from 'framer-motion';

/**
 * Dashboard — demonstrates:
 *
 *  useState:
 *   - `currentExpense` lifted up to this page so both ExpenseForm (writes)
 *     and ExpenseList → ExpenseCard (triggers) share the same edit state.
 *     This is the "lifting state up" pattern — the common ancestor owns
 *     the state that two sibling components need to coordinate on.
 *
 *  useEffect (via useDocumentTitle):
 *   - Updates document.title with cleanup on unmount.
 */
const Dashboard = () => {
  // Lifted state: null = add mode, expense object = edit mode
  const [currentExpense, setCurrentExpense] = useState(null);

  // Side effect: set the browser tab title
  useDocumentTitle('Dashboard');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="container"
      style={{ padding: 'var(--space-xl) 0' }}
    >
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: '700', letterSpacing: '-1px', marginBottom: 'var(--space-xs)' }}>
          Overview 📊
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Track and manage your expenses with AI insights 🤖.</p>
      </div>

      <DashboardStats />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 'var(--space-xl)', alignItems: 'start' }}>
        {/* ExpenseForm reads currentExpense to switch between add/edit mode */}
        <div style={{ order: 2 }}>
          <ExpenseForm
            currentExpense={currentExpense}
            clearCurrentExpense={() => setCurrentExpense(null)}
          />
        </div>

        {/* ExpenseList triggers onEdit which lifts state back up to Dashboard */}
        <div style={{ order: 1 }}>
          <SearchBar />
          <ExpenseList onEdit={(expense) => setCurrentExpense(expense)} />
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
