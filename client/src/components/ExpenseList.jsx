import { useExpenses } from "../hooks/useExpenses";
import ExpenseCard from "./ExpenseCard";
import { motion, AnimatePresence } from "framer-motion";

const ExpenseList = ({ onEdit }) => {
  const { expenses, searchQuery, filterCategory } = useExpenses();

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "All" || expense.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
  };

  return (
    <div>
      <h3 style={{ marginBottom: 'var(--space-md)', fontSize: 'var(--font-lg)', color: 'white' }}>Recent Expenses</h3>
      {filteredExpenses.length === 0 ? (
        <div className="glass-panel" style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p>No expenses found. Add some to get started!</p>
        </div>
      ) : (
        <motion.div 
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {filteredExpenses.map((expense) => (
              <motion.div key={expense.id} variants={itemVariants} exit="exit" layout>
                <ExpenseCard expense={expense} onEdit={onEdit} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default ExpenseList;