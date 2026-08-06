import { createContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem("expenses");
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const categories = ["Food", "Travel", "Bills", "Shopping", "Entertainment", "Other"];

  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  const addExpense = (expense) => {
    const newExpense = {
      _id: uuidv4(),
      ...expense,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const editExpense = (id, updatedExpense) => {
    setExpenses((prev) =>
      prev.map((exp) =>
        exp._id === id
          ? { ...exp, ...updatedExpense, updatedAt: new Date().toISOString() }
          : exp
      )
    );
  };

  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((exp) => exp._id !== id));
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
        addExpense,
        editExpense,
        deleteExpense,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};
