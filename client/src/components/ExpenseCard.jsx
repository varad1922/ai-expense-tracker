import { FiEdit2, FiTrash2, FiTag, FiCalendar } from "react-icons/fi";
import { useExpenses } from "../hooks/useExpenses";

const ExpenseCard = ({ expense, onEdit }) => {
  const { deleteExpense } = useExpenses();

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Food': return 'var(--warning)';
      case 'Travel': return 'var(--info)';
      case 'Bills': return 'var(--danger)';
      case 'Shopping': return 'var(--accent-tertiary)';
      case 'Entertainment': return 'var(--accent-primary)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="glass-panel" style={{ 
      padding: 'var(--space-md)', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: 'var(--space-sm)',
      transition: 'transform var(--transition-fast)',
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
    >
      <div className="flex items-center gap-md">
        <div style={{ 
          width: '40px', height: '40px', 
          borderRadius: 'var(--radius-full)', 
          background: `rgba(255,255,255,0.05)`,
          border: `1px solid ${getCategoryColor(expense.category)}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: getCategoryColor(expense.category)
        }}>
          <FiTag size={18} />
        </div>
        <div>
          <h4 style={{ fontSize: 'var(--font-md)', fontWeight: '500', color: 'white' }}>{expense.title}</h4>
          <div className="flex items-center gap-sm" style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>
            <span className="flex items-center gap-xs" style={{ background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '10px' }}>
              {expense.category}
            </span>
            <span className="flex items-center gap-xs"><FiCalendar /> {new Date(expense.date).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-md">
        <span style={{ fontSize: 'var(--font-lg)', fontWeight: '600', color: 'white' }}>₹{expense.amount}</span>
        <div className="flex items-center gap-sm">
          <button className="btn-icon" onClick={() => onEdit(expense)} style={{ color: 'var(--info)' }}>
            <FiEdit2 size={16} />
          </button>
          <button className="btn-icon" onClick={() => deleteExpense(expense._id)} style={{ color: 'var(--danger)' }}>
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCard;