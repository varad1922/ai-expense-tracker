import { useContext } from 'react';
import { ExpenseContext } from '../context/ExpenseContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import Card from '../components/ui/Card';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

/**
 * Analytics page — demonstrates React component composition via the
 * Card compound component (<Card>, <Card.Header>, <Card.Body>, <Card.Footer>).
 *
 * Each chart lives inside a Card that:
 *  - Uses <Card.Header> for the title (reads variant from context, no prop-drilling)
 *  - Uses <Card.Body> for chart content
 *  - Uses <Card.Footer> to show the data count
 *  - Supports the `collapsible` prop so users can hide charts they don't need
 */

const COLORS = ['#8b5cf6', '#6d28d9', '#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

const Analytics = () => {
  const { expenses } = useContext(ExpenseContext);

  // Derive category totals — no extra fetch, purely computed from context state
  const categoryData = expenses.reduce((acc, expense) => {
    const existing = acc.find((item) => item.name === expense.category);
    if (existing) {
      existing.value += expense.amount;
    } else {
      acc.push({ name: expense.category, value: expense.amount });
    }
    return acc;
  }, []);

  // Monthly trend — group by YYYY-MM
  const monthlyData = expenses.reduce((acc, expense) => {
    const month = new Date(expense.date).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short',
    });
    const existing = acc.find((item) => item.month === month);
    if (existing) {
      existing.amount += expense.amount;
    } else {
      acc.push({ month, amount: expense.amount });
    }
    return acc;
  }, []).slice(-6); // last 6 months

  const hasExpenses = expenses.length > 0;
  const totalSpend = expenses.reduce((s, e) => s + e.amount, 0);

  useDocumentTitle('Analytics');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="container"
      style={{ padding: 'var(--space-xl) 0' }}
    >
      <h2 style={{ marginBottom: 'var(--space-lg)' }}>Expense Analytics 📈</h2>

      {!hasExpenses ? (
        /* ── Empty state — simple Card usage (just children, no slots) ── */
        <Card>
          <Card.Body
            style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--text-secondary)' }}
          >
            <p style={{ fontSize: 'var(--font-xl)', marginBottom: 'var(--space-sm)' }}>
              No Data Available 📉
            </p>
            <p>Add some expenses to see your spending analytics and charts!</p>
          </Card.Body>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>

          {/* ── Row 1: two charts side by side ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>

            {/* Bar chart — Card with Header + Body + Footer slots */}
            <Card variant="accent" collapsible>
              <Card.Header>Spending by Category (Bar)</Card.Header>
              <Card.Body style={{ height: '320px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" />
                    <YAxis stroke="var(--text-secondary)" />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{
                        backgroundColor: 'var(--bg-secondary)',
                        border: 'none',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="value" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card.Body>
              <Card.Footer>{categoryData.length} categories · ₹{totalSpend.toLocaleString()} total</Card.Footer>
            </Card>

            {/* Pie chart — Card with render prop */}
            <Card variant="accent" collapsible>
              <Card.Header>Spending by Category (Pie)</Card.Header>
              {/* render prop: receives `isCollapsed` from Card context */}
              <Card.Body
                style={{ height: '320px' }}
                render={() => (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={110}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {categoryData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-secondary)',
                          border: 'none',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              />
              <Card.Footer>{expenses.length} transactions</Card.Footer>
            </Card>
          </div>

          {/* ── Row 2: monthly trend — full width, collapsible ── */}
          {monthlyData.length > 0 && (
            <Card collapsible defaultCollapsed={false}>
              <Card.Header>Monthly Spend Trend</Card.Header>
              <Card.Body style={{ height: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" stroke="var(--text-secondary)" />
                    <YAxis stroke="var(--text-secondary)" />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{
                        backgroundColor: 'var(--bg-secondary)',
                        border: 'none',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="amount" fill="var(--success)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card.Body>
              <Card.Footer>Last {monthlyData.length} months</Card.Footer>
            </Card>
          )}

        </div>
      )}
    </motion.div>
  );
};

export default Analytics;
