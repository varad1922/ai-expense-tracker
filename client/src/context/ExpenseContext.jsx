import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";

export const ExpenseContext = createContext();

const API_URL = "http://localhost:5000/api/expenses";

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [notifications, setNotifications] = useState([]);
  const { user } = useContext(AuthContext);

  const categories = ["Food", "Travel", "Bills", "Shopping", "Entertainment", "Other"];

  const getHeaders = () => {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user?.token}`,
    };
  };

  const fetchExpenses = async () => {
    if (!user || !user.token) return;
    
    try {
      const res = await fetch('http://localhost:5000/api/expenses', {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to fetch');
      
      setExpenses(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [user]);

  useEffect(() => {
    if (user && user.token) {
      import('socket.io-client').then(({ io }) => {
        const socket = io('http://localhost:5000');
        
        socket.emit('join', user._id);
        
        socket.on('newExpense', (expense) => {
          if (expense && expense.title) {
            setNotifications(prev => [{
              id: Date.now().toString() + Math.random(),
              message: `New expense added: ₹${expense.amount} for ${expense.title}`,
              date: new Date(),
              read: false
            }, ...prev]);
          }
          fetchExpenses();
        });
        
        socket.on('updateExpense', (expense) => {
          if (expense && expense.title) {
            setNotifications(prev => [{
              id: Date.now().toString() + Math.random(),
              message: `Expense updated: ${expense.title}`,
              date: new Date(),
              read: false
            }, ...prev]);
          }
          fetchExpenses();
        });
        
        socket.on('deleteExpense', (id) => {
          setNotifications(prev => [{
            id: Date.now().toString() + Math.random(),
            message: `An expense was deleted`,
            date: new Date(),
            read: false
          }, ...prev]);
          fetchExpenses();
        });

        return () => socket.disconnect();
      });
    }
  }, [user]);

  const addExpense = async (expense) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(expense),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add expense');
      setExpenses((prev) => [data, ...prev]);
    } catch (error) {
      console.error("Error adding expense", error);
    }
  };

  const editExpense = async (id, updatedExpense) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(updatedExpense),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to edit expense');
      setExpenses((prev) =>
        prev.map((exp) => (exp.id === id ? data : exp))
      );
    } catch (error) {
      console.error("Error updating expense", error);
    }
  };

  const deleteExpense = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    } catch (error) {
      console.error("Error deleting expense", error);
    }
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        categories,
        searchQuery,
        setSearchQuery,
        filterCategory,
        setFilterCategory,
        notifications,
        setNotifications,
        addExpense,
        editExpense,
        deleteExpense,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};
