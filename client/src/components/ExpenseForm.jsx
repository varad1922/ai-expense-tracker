import { useState, useEffect } from "react";
import { useExpenses } from "../hooks/useExpenses";
import { FiPlus, FiSave } from "react-icons/fi";

const ExpenseForm = ({ currentExpense, clearCurrentExpense }) => {
  const { addExpense, editExpense, categories } = useExpenses();
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "Other",
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (currentExpense) {
      setFormData({
        title: currentExpense.title,
        amount: currentExpense.amount,
        category: currentExpense.category,
        date: currentExpense.date
      });
    }
  }, [currentExpense]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || !formData.date) {
      alert("Please fill all fields");
      return;
    }

    if (currentExpense) {
      editExpense(currentExpense._id, formData);
      clearCurrentExpense();
    } else {
      addExpense(formData);
    }
    
    setFormData({ title: "", amount: "", category: "Other", date: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="glass-panel" style={{ padding: 'var(--space-lg)', position: 'sticky', top: '100px' }}>
      <h3 style={{ marginBottom: 'var(--space-md)', fontSize: 'var(--font-lg)', color: 'white' }}>
        {currentExpense ? 'Edit Expense' : 'Add New Expense'}
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Title</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="e.g., Pizza" 
            value={formData.title} 
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Amount (₹)</label>
          <input 
            type="number" 
            className="form-input" 
            placeholder="e.g., 500" 
            value={formData.amount} 
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select 
            className="form-input" 
            value={formData.category} 
            onChange={(e) => setFormData({...formData, category: e.target.value})}
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 'var(--space-lg)' }}>
          <label className="form-label">Date</label>
          <input 
            type="date" 
            className="form-input" 
            value={formData.date} 
            onChange={(e) => setFormData({...formData, date: e.target.value})}
          />
        </div>
        
        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          {currentExpense ? <><FiSave /> Update Expense</> : <><FiPlus /> Add Expense</>}
        </button>
        {currentExpense && (
          <button 
            type="button" 
            className="btn" 
            onClick={clearCurrentExpense} 
            style={{ width: '100%', marginTop: 'var(--space-sm)', color: 'var(--text-secondary)' }}
          >
            Cancel
          </button>
        )}
      </form>
    </div>
  );
};

export default ExpenseForm;