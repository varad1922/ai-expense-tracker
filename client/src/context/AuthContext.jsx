import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

/**
 * Environment variable (Task 9):
 * All API calls use VITE_API_URL from the .env file — no hardcoded URLs.
 */
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // ── useEffect: rehydrate user from localStorage on mount ──────────────────
  //
  // Demonstrates:
  //  - Empty dependency array [] — runs exactly once on mount (like componentDidMount).
  //  - No cleanup needed here because localStorage.getItem is synchronous and
  //    the effect does not set up any subscription or timer.
  //  - The `loading` guard in the return prevents child routes from flashing
  //    a redirect to /login before we've confirmed the user is logged in.

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // Corrupted JSON in localStorage — clear it
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []); // [] — only run on mount, never again

  // ── useEffect: apply theme class to <body> ─────────────────────────────────
  //
  // Demonstrates:
  //  - [user?.theme] dependency — re-runs whenever the user's theme changes.
  //  - DOM side effect (classList mutation) must live in useEffect, not render.
  //  - Cleanup: removes the class when theme changes away from 'dark' or user
  //    logs out (user becomes null). Without cleanup, the dark class would
  //    linger after logout.

  useEffect(() => {
    if (user?.theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }

    // Cleanup: always remove the class before the next effect run / unmount
    return () => {
      document.body.classList.remove('dark');
    };
  }, [user?.theme]); // only re-runs when theme changes

  // ── Auth helpers ───────────────────────────────────────────────────────────
  // All use async/await + try/catch and return a consistent { success, message }
  // shape so callers never need to handle thrown exceptions.

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Login failed');

      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Registration failed');

      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const updateProfile = async (name, theme, monthlyBudget) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ name, theme, monthlyBudget }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'Update failed');

      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, loading }}>
      {/* Don't render children until the localStorage check is done */}
      {!loading && children}
    </AuthContext.Provider>
  );
};
