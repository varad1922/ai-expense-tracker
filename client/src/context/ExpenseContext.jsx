import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from './AuthContext';

export const ExpenseContext = createContext();

/**
 * Environment variable (Task 9 — env wiring):
 * VITE_API_URL is set in client/.env and injected by Vite at build time.
 * No file in the codebase hardcodes "http://localhost:5000" anymore.
 */
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
const API_URL  = `${API_BASE}/api/expenses`;

export const ExpenseProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  // ── State (Task 8 — useState patterns) ────────────────────────────────────
  const [expenses, setExpenses]           = useState([]);
  const [searchQuery, setSearchQuery]     = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [notifications, setNotifications] = useState([]);

  // Per-operation loading and error states — granular feedback to the UI
  const [loading, setLoading]   = useState(false);  // initial fetch
  const [error, setError]       = useState(null);
  const [saving, setSaving]     = useState(false);  // add / edit operations
  const [deleting, setDeleting] = useState(null);   // id of expense being deleted

  const categories = ['Food', 'Travel', 'Bills', 'Shopping', 'Entertainment', 'Other'];

  const getHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${user?.token}`,
  }), [user?.token]);

  // ── useEffect: fetch expenses (Task 7 — side effects + AbortController) ───
  //
  // Demonstrates:
  //  - AbortController: cancels the in-flight fetch when the component
  //    unmounts or when `user` changes (e.g. logout while a fetch is pending).
  //    Without this, a stale response could call setExpenses on an unmounted
  //    component, causing a React "can't perform state update" warning.
  //  - Correct dependency array [user]: only re-fetches when the user changes.
  //  - Cleanup function: the returned () => controller.abort() runs before the
  //    next effect execution and on unmount.

  useEffect(() => {
    if (!user?.token) {
      setExpenses([]);
      return;
    }

    const controller = new AbortController(); // AbortController for fetch cancellation
    setLoading(true);
    setError(null);

    const fetchExpenses = async () => {
      try {
        const res = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${user.token}` },
          signal: controller.signal, // link the fetch to the AbortController
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message ?? 'Failed to fetch expenses');
        }

        const data = await res.json();
        // Only update state if the fetch wasn't aborted
        setExpenses(data);
        setError(null);
      } catch (err) {
        if (err.name === 'AbortError') return; // fetch was intentionally cancelled
        console.error('[ExpenseContext] fetch failed:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();

    // Cleanup: abort the fetch when user changes or component unmounts
    return () => controller.abort();
  }, [user]); // dependency array: re-run only when `user` changes

  // ── useEffect: Socket.io real-time updates (Task 7 — cleanup) ─────────────
  //
  // Demonstrates:
  //  - Async dynamic import inside useEffect (socket.io-client is large;
  //    dynamic import avoids it blocking the initial bundle).
  //  - Cleanup: the returned function calls socket.disconnect() so the
  //    WebSocket connection is closed when the user logs out.
  //  - Correct dependency array [user]: reconnects when user changes.

  useEffect(() => {
    if (!user?.token) return;

    let socket;

    const connectSocket = async () => {
      const { io } = await import('socket.io-client');
      socket = io(API_BASE);

      socket.emit('join', user._id);

      const pushNotification = (message) =>
        setNotifications((prev) => [
          {
            id: `${Date.now()}-${Math.random()}`,
            message,
            date: new Date(),
            read: false,
          },
          ...prev,
        ]);

      socket.on('newExpense', (expense) => {
        if (expense?.title) pushNotification(`New expense added: ₹${expense.amount} for ${expense.title}`);
        // Update local state instead of re-fetching the whole list
        setExpenses((prev) => {
          const exists = prev.some((e) => e.id === expense.id);
          return exists ? prev : [expense, ...prev];
        });
      });

      socket.on('updateExpense', (expense) => {
        if (expense?.title) pushNotification(`Expense updated: ${expense.title}`);
        setExpenses((prev) => prev.map((e) => (e.id === expense.id ? expense : e)));
      });

      socket.on('deleteExpense', (id) => {
        pushNotification('An expense was deleted');
        setExpenses((prev) => prev.filter((e) => e.id !== id));
      });
    };

    connectSocket();

    // Cleanup: disconnect socket when user changes or component unmounts
    return () => {
      if (socket) socket.disconnect();
    };
  }, [user]); // dependency array: reconnects on user change

  // ── CRUD operations with optimistic updates (Task 8 — useState patterns) ──
  //
  // Optimistic update pattern:
  //  1. Update local state immediately (instant UI feedback).
  //  2. Send the request to the server.
  //  3. On success: replace the optimistic record with the server's response.
  //  4. On failure: roll back to the previous state.

  const addExpense = async (expenseData) => {
    setSaving(true);

    // Optimistic: create a temporary local record with a placeholder id
    const tempId = `temp-${Date.now()}`;
    const optimisticExpense = { ...expenseData, id: tempId, amount: Number(expenseData.amount) };
    setExpenses((prev) => [optimisticExpense, ...prev]);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(expenseData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to add expense');

      // Replace the optimistic record with the real server record
      setExpenses((prev) => prev.map((e) => (e.id === tempId ? data : e)));
    } catch (err) {
      console.error('[ExpenseContext] addExpense failed:', err.message);
      // Rollback: remove the optimistic record
      setExpenses((prev) => prev.filter((e) => e.id !== tempId));
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const editExpense = async (id, updatedData) => {
    setSaving(true);

    // Optimistic: update immediately in local state
    const previous = expenses.find((e) => e.id === id);
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updatedData, amount: Number(updatedData.amount) } : e))
    );

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updatedData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Failed to update expense');

      // Confirm with the canonical server record
      setExpenses((prev) => prev.map((e) => (e.id === id ? data : e)));
    } catch (err) {
      console.error('[ExpenseContext] editExpense failed:', err.message);
      // Rollback: restore the previous record
      if (previous) {
        setExpenses((prev) => prev.map((e) => (e.id === id ? previous : e)));
      }
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteExpense = async (id) => {
    setDeleting(id);

    // Optimistic: remove immediately
    const previous = expenses.find((e) => e.id === id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? 'Failed to delete expense');
      }
    } catch (err) {
      console.error('[ExpenseContext] deleteExpense failed:', err.message);
      // Rollback: re-insert the expense in its original position
      if (previous) {
        setExpenses((prev) => [previous, ...prev.filter((e) => e.id !== id)]);
      }
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        categories,
        searchQuery,     setSearchQuery,
        filterCategory,  setFilterCategory,
        notifications,   setNotifications,
        loading,         // true during initial fetch
        saving,          // true during add/edit
        deleting,        // id of expense being deleted (null if none)
        error,           setError,
        addExpense,
        editExpense,
        deleteExpense,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};
