import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import { ExpenseProvider } from "./context/ExpenseContext";
import "./index.css"; // Ensure styles are imported

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <ExpenseProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar toggleSidebar={toggleSidebar} />
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <Sidebar isOpen={isSidebarOpen} />
            <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-primary)' }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                {/* Placeholder routes for future implementation */}
                <Route path="/analytics" element={<div className="container" style={{ padding: 'var(--space-xl) 0' }}><h2>Analytics (Coming Soon)</h2></div>} />
                <Route path="/ai" element={<div className="container" style={{ padding: 'var(--space-xl) 0' }}><h2>AI Assistant (Coming Soon)</h2></div>} />
                <Route path="/settings" element={<div className="container" style={{ padding: 'var(--space-xl) 0' }}><h2>Settings (Coming Soon)</h2></div>} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </ExpenseProvider>
  );
}

export default App;