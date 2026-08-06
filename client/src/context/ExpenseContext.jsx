import { createContext, useState, useEffect } from "react";

export const ExpenseContext = createContext();

const API_URL = "http://localhost:5000/api/expenses";

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const categories = ["Food", "Travel", "Bills", "Shopping", "Entertainment", "Other"];

  const fetchExpenses = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setExpenses(data);
    } catch (error) {
      console.error("Error fetching expenses", error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const addExpense = async (expense) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expense),
      });
      const data = await res.json();
      setExpenses((prev) => [data, ...prev]);
    } catch (error) {
      console.error("Error adding expense", error);
    }
  };

  const editExpense = async (id, updatedExpense) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedExpense),
      });
      const data = await res.json();
      setExpenses((prev) =>
        prev.map((exp) => (exp._id === id ? data : exp))
      );
    } catch (error) {
      console.error("Error updating expense", error);
    }
  };

  const deleteExpense = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      setExpenses((prev) => prev.filter((exp) => exp._id !== id));
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
        addExpense,
        editExpense,
        deleteExpense,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};
