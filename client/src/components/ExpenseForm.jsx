import { useState, useEffect } from "react";
import { useExpenses } from "../hooks/useExpenses";
import { motion } from "framer-motion";
import { FiPlus, FiSave } from "react-icons/fi";

const categoryEmojis = {
  "Food": "🍔 Food",
  "Travel": "✈️ Travel",
  "Bills": "🧾 Bills",
  "Shopping": "🛍️ Shopping",
  "Entertainment": "🍿 Entertainment",
  "Other": "📦 Other"
};

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
      editExpense(currentExpense.id, formData);
      clearCurrentExpense();
    } else {
      addExpense(formData);
    }
    
    setFormData({ title: "", amount: "", category: "Other", date: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="glass-panel" style={{ padding: 'var(--space-lg)', position: 'sticky', top: '100px' }}>
      <h3 style={{ marginBottom: 'var(--space-md)', fontSize: 'var(--font-lg)', color: 'var(--text-primary)' }}>
        {currentExpense ? 'Edit Expense' : 'Add New Expense'}
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Title</label>
          <motion.input 
            whileFocus={{ scale: 1.02, borderColor: 'var(--accent-primary)' }}
            whileHover={{ scale: 1.01 }}
            type="text" 
            className="form-input" 
            placeholder="e.g., Pizza" 
            value={formData.title} 
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Amount (₹)</label>
          <motion.input 
            whileFocus={{ scale: 1.02, borderColor: 'var(--accent-primary)' }}
            whileHover={{ scale: 1.01 }}
            type="number" 
            className="form-input" 
            placeholder="e.g., 500" 
            value={formData.amount} 
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <motion.select 
            whileFocus={{ scale: 1.02, borderColor: 'var(--accent-primary)' }}
            whileHover={{ scale: 1.01 }}
            className="form-input" 
            value={formData.category} 
            onChange={(e) => setFormData({...formData, category: e.target.value})}
          >
            {categories.map(cat => <option key={cat} value={cat}>{categoryEmojis[cat] || cat}</option>)}
          </motion.select>
        </div>
        <div className="form-group" style={{ marginBottom: 'var(--space-lg)' }}>
          <label className="form-label">Date</label>
          <motion.input 
            whileFocus={{ scale: 1.02, borderColor: 'var(--accent-primary)' }}
            whileHover={{ scale: 1.01 }}
            type="date" 
            className="form-input" 
            value={formData.date} 
            onChange={(e) => setFormData({...formData, date: e.target.value})}
          />
        </div>
        
        <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        type="submit" 
        className="btn btn-primary" 
        style={{ width: '100%', marginTop: 'var(--space-md)' }}
      >
        {currentExpense ? 'Update Expense' : 'Add Expense'}
      </motion.button>
      
      {currentExpense && (
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          type="button" 
          className="btn" 
          onClick={clearCurrentExpense}
          style={{ width: '100%', marginTop: 'var(--space-sm)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
        >
          Cancel Edit
        </motion.button>
      )}
    </form>
    </div>
  );
};

export default ExpenseForm;