import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { FiHome, FiPieChart, FiSettings, FiMessageSquare } from "react-icons/fi";
import { ExpenseContext } from "../context/ExpenseContext";

const Sidebar = ({ isOpen }) => {
  const { expenses } = useContext(ExpenseContext);
  
  const menuItems = [
    { name: "Dashboard", path: "/", icon: <FiHome size={20} /> },
    { name: "Analytics", path: "/analytics", icon: <FiPieChart size={20} /> },
    { name: "AI Assistant", path: "/ai", icon: <FiMessageSquare size={20} /> },
    { name: "Settings", path: "/settings", icon: <FiSettings size={20} /> },
  ];

  // Calculate current month's expenses
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
  }).reduce((acc, curr) => acc + curr.amount, 0);

  const budget = 2000; // Mock budget
  const budgetPercentage = Math.min((monthlyExpenses / budget) * 100, 100).toFixed(0);

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
            <li key={item.name}>
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
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: 'auto', padding: 'var(--space-lg)' }}>
        <div style={{ padding: 'var(--space-md)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', textAlign: 'center' }}>
          <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-sm)' }}>Monthly Budget ($2000)</p>
          <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div style={{ width: `${budgetPercentage}%`, height: '100%', background: budgetPercentage > 90 ? 'var(--danger)' : 'var(--success)', transition: 'width 0.5s ease' }}></div>
          </div>
          <p style={{ fontSize: 'var(--font-xs)', marginTop: 'var(--space-sm)', color: 'var(--text-primary)' }}>{budgetPercentage}% Used (${monthlyExpenses.toFixed(0)})</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
