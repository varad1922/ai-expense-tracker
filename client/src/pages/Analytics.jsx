import { useContext } from 'react';
import { ExpenseContext } from '../context/ExpenseContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#8b5cf6', '#6d28d9', '#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

const Analytics = () => {
  const { expenses } = useContext(ExpenseContext);

  // Group by category
  const categoryData = expenses.reduce((acc, expense) => {
    const existing = acc.find(item => item.name === expense.category);
    if (existing) {
      existing.value += expense.amount;
    } else {
      acc.push({ name: expense.category, value: expense.amount });
    }
    return acc;
  }, []);

  return (
    <div className="container" style={{ padding: 'var(--space-xl) 0' }}>
      <h2 style={{ marginBottom: 'var(--space-lg)' }}>Expense Analytics</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
        <div className="glass-panel" style={{ padding: 'var(--space-lg)', height: '400px' }}>
          <h3 style={{ marginBottom: 'var(--space-md)' }}>Spending by Category (Bar)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="name" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: 'var(--bg-secondary)', border: 'none', borderRadius: '8px'}} />
              <Bar dataKey="value" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel" style={{ padding: 'var(--space-lg)', height: '400px' }}>
          <h3 style={{ marginBottom: 'var(--space-md)' }}>Spending by Category (Pie)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{backgroundColor: 'var(--bg-secondary)', border: 'none', borderRadius: '8px'}} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
