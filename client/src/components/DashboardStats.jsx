import { useExpenses } from "../hooks/useExpenses";
import { FiDollarSign, FiActivity, FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import { motion } from "framer-motion";

const StatCard = ({ title, value, icon, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="glass-panel" 
    style={{ 
      padding: 'var(--space-lg)', 
      display: 'flex', 
      alignItems: 'center', 
      gap: 'var(--space-md)',
    }}
  >
    <div style={{ 
      width: '48px', height: '48px', borderRadius: 'var(--radius-md)', 
      background: `rgba(${color}, 0.1)`, color: `rgb(${color})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>{title}</p>
      <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: '600', color: 'var(--text-primary)' }}>{value}</h3>
    </div>
  </motion.div>
);

const DashboardStats = () => {
  const { expenses } = useExpenses();

  const totalExpenses = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalTransactions = expenses.length;
  const avgExpense = totalTransactions > 0 ? (totalExpenses / totalTransactions).toFixed(2) : 0;
  
  const amounts = expenses.map(e => Number(e.amount));
  const highestExpense = amounts.length > 0 ? Math.max(...amounts) : 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
      <StatCard 
        title="Total Expenses" 
        value={`₹${totalExpenses.toLocaleString()}`} 
        icon={<FiDollarSign size={24} />} 
        color="139, 92, 246" 
        delay={0.1}
      />
      <StatCard 
        title="Transactions" 
        value={totalTransactions} 
        icon={<FiActivity size={24} />} 
        color="59, 130, 246" 
        delay={0.2}
      />
      <StatCard 
        title="Average Expense" 
        value={`₹${avgExpense}`} 
        icon={<FiTrendingDown size={24} />} 
        color="16, 185, 129" 
        delay={0.3}
      />
      <StatCard 
        title="Highest Expense" 
        value={`₹${highestExpense.toLocaleString()}`} 
        icon={<FiTrendingUp size={24} />} 
        color="239, 68, 68" 
        delay={0.4}
      />
    </div>
  );
};

export default DashboardStats;
