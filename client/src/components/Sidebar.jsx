import { NavLink } from "react-router-dom";
import { FiHome, FiPieChart, FiSettings, FiMessageSquare } from "react-icons/fi";
import { useContext } from "react";
import { ExpenseContext } from "../context/ExpenseContext";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";

const Sidebar = ({ isOpen }) => {
  const menuItems = [
    { name: "Dashboard", path: "/", icon: <FiHome size={20} /> },
    { name: "Analytics", path: "/analytics", icon: <FiPieChart size={20} /> },
    { name: "AI Assistant", path: "/ai", icon: <FiMessageSquare size={20} /> },
    { name: "Settings", path: "/settings", icon: <FiSettings size={20} /> },
  ];

  const { expenses } = useContext(ExpenseContext) || { expenses: [] };
  const { user } = useContext(AuthContext) || { user: {} };

  // Calculate current month's expenses
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthExpenses = (expenses || []).reduce((acc, expense) => {
    const expenseDate = new Date(expense.date);
    if (expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear) {
      return acc + Number(expense.amount);
    }
    return acc;
  }, 0);

  const budgetLimit = user?.monthlyBudget || 50000;
  const percentageUsed = Math.min(100, Math.round((currentMonthExpenses / budgetLimit) * 100));

  return (
    <aside
      className="glass-panel"
      style={{
        width: isOpen ? '250px' : '0px',
        opacity: isOpen ? 1 : 0,
        height: 'calc(100vh - 72px)',
        position: 'sticky',
        top: '72px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        borderRight: isOpen ? '1px solid var(--glass-border)' : 'none',
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: 'var(--space-lg)' }}>
        <ul className="flex flex-col gap-sm">
          {menuItems.map((item) => (
            <motion.li key={item.name} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <NavLink
                to={item.path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  padding: 'var(--space-sm) var(--space-md)',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  background: isActive ? 'var(--gradient-primary)' : 'transparent',
                  fontWeight: isActive ? '500' : '400',
                  transition: 'all var(--transition-fast)',
                })}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            </motion.li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: 'auto', padding: 'var(--space-lg)' }}>
        <div style={{ padding: 'var(--space-md)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>Monthly Budget (₹{budgetLimit.toLocaleString()})</p>
          <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{ width: `${percentageUsed}%`, height: '100%', background: percentageUsed > 90 ? 'var(--danger)' : percentageUsed > 75 ? 'var(--warning)' : 'var(--success)', transition: 'width 0.5s ease-in-out' }}></div>
          </div>
          <p style={{ fontSize: 'var(--font-xs)', marginTop: 'var(--space-sm)', color: 'white' }}>{percentageUsed}% Used (₹{currentMonthExpenses.toLocaleString()})</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
