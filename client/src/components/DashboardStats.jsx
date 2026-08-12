import { useExpenses } from '../hooks/useExpenses';
import { FiDollarSign, FiActivity, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Card from './ui/Card';

/**
 * DashboardStats — demonstrates React component composition at two levels:
 *
 *  1. StatCard: a locally-scoped presentational sub-component that composes
 *     the Card compound component with its Header/Body slots. It knows nothing
 *     about where its data comes from — pure UI.
 *
 *  2. DashboardStats: the container that computes derived state from expenses
 *     and passes it down, separating data logic from display logic.
 */

/**
 * StatCard — composes <Card> slots to render a single metric tile.
 * The icon, label, value, and colour are passed as props; layout lives here.
 */
const StatCard = ({ title, value, icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
  >
    {/* Using Card compound component — Header slot for title, Body slot for value */}
    <Card style={{ padding: 0 }}>
      <Card.Body style={{ padding: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        {/* Icon badge */}
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            background: `rgba(${color}, 0.12)`,
            color: `rgb(${color})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        {/* Text — composed inside Card.Body alongside the icon */}
        <div>
          <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: '2px' }}>
            {title}
          </p>
          <h3 style={{ fontSize: 'var(--font-xl)', fontWeight: '600', color: 'var(--text-primary)' }}>
            {value}
          </h3>
        </div>
      </Card.Body>
    </Card>
  </motion.div>
);

/**
 * DashboardStats — computes all metrics and renders four StatCards.
 * Separating computation (here) from presentation (StatCard) is the
 * "smart vs dumb component" composition pattern.
 */
const DashboardStats = () => {
  const { expenses } = useExpenses();

  const totalExpenses   = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalTransactions = expenses.length;
  const avgExpense      = totalTransactions > 0 ? (totalExpenses / totalTransactions).toFixed(2) : 0;
  const amounts         = expenses.map((e) => Number(e.amount));
  const highestExpense  = amounts.length > 0 ? Math.max(...amounts) : 0;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-xl)',
      }}
    >
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
        value={`₹${Number(avgExpense).toLocaleString()}`}
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
