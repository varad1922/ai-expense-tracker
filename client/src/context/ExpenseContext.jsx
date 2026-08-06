import { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";

export const ExpenseContext = createContext();

const API_URL = "http://localhost:5000/api/expenses";

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const { user } = useContext(AuthContext);

  const categories = ["Food", "Travel", "Bills", "Shopping", "Entertainment", "Other"];

  const getHeaders = () => {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${user?.token}`,
    };
  };

  const fetchExpenses = async () => {
    if (!user) return;
    try {
      const res = await fetch(API_URL, { headers: getHeaders() });
      const data = await res.json();
      setExpenses(data);
    } catch (error) {
      console.error("Error fetching expenses", error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [user]);

  const addExpense = async (expense) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: getHeaders(),
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
        headers: getHeaders(),
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
        headers: getHeaders(),
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
