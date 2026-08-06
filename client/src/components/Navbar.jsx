import { Link } from "react-router-dom";
import { FiMenu, FiUser, FiBell } from "react-icons/fi";

const Navbar = ({ toggleSidebar }) => {
  return (
    <nav className="glass-panel navbar flex items-center justify-between" style={{ padding: 'var(--space-md) var(--space-lg)', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--glass-border)' }}>
      <div className="flex items-center gap-md">
        <button className="btn-icon" onClick={toggleSidebar}>
          <FiMenu size={24} />
        </button>
        <Link to="/" className="logo flex items-center gap-sm">
          <div style={{ width: '32px', height: '32px', background: 'var(--gradient-primary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>AI</div>
          <span style={{ fontSize: 'var(--font-lg)', fontWeight: '600', letterSpacing: '-0.5px' }}>ExpenseTracker</span>
        </Link>
      </div>

      <div className="flex items-center gap-sm">
        <button className="btn-icon">
          <FiBell size={20} />
        </button>
        <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-full)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'var(--space-sm)' }}>
          <FiUser size={20} color="var(--text-secondary)" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;