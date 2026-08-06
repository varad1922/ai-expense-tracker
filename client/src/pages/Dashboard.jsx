import { useState } from "react";
import DashboardStats from "../components/DashboardStats";
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import SearchBar from "../components/SearchBar";

const Dashboard = () => {
  const [currentExpense, setCurrentExpense] = useState(null);

  return (
    <div className="container" style={{ padding: 'var(--space-xl) 0' }}>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: '700', letterSpacing: '-1px', marginBottom: 'var(--space-xs)' }}>Overview</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Track and manage your expenses with AI insights.</p>
      </div>

      <DashboardStats />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 'var(--space-xl)', alignItems: 'start' }}>
        <div style={{ order: 2 }}>
          <ExpenseForm 
            currentExpense={currentExpense} 
            clearCurrentExpense={() => setCurrentExpense(null)} 
          />
        </div>
        
        <div style={{ order: 1 }}>
          <SearchBar />
          <ExpenseList onEdit={(expense) => setCurrentExpense(expense)} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
