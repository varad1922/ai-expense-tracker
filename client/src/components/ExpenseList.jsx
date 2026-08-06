import { useExpenses } from "../hooks/useExpenses";
import ExpenseCard from "./ExpenseCard";

const ExpenseList = ({ onEdit }) => {
  const { expenses, searchQuery, filterCategory } = useExpenses();

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "All" || expense.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <h3 style={{ marginBottom: 'var(--space-md)', fontSize: 'var(--font-lg)', color: 'white' }}>Recent Expenses</h3>
      {filteredExpenses.length === 0 ? (
        <div className="glass-panel" style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p>No expenses found. Add some to get started!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
          {filteredExpenses.map((expense) => (
            <ExpenseCard key={expense._id} expense={expense} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpenseList;