import { FiSearch, FiFilter } from "react-icons/fi";
import { useExpenses } from "../hooks/useExpenses";

const SearchBar = () => {
  const { searchQuery, setSearchQuery, filterCategory, setFilterCategory, categories } = useExpenses();

  return (
    <div className="flex items-center gap-md" style={{ marginBottom: 'var(--space-lg)' }}>
      <div style={{ position: 'relative', flex: 1 }}>
        <FiSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
        <input 
          type="text" 
          className="form-input" 
          placeholder="Search expenses by title..." 
          style={{ paddingLeft: '44px', background: 'var(--bg-secondary)', border: 'none', borderRadius: 'var(--radius-full)' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div style={{ position: 'relative', width: '200px' }}>
        <FiFilter style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
        <select 
          className="form-input" 
          style={{ paddingLeft: '44px', background: 'var(--bg-secondary)', border: 'none', borderRadius: 'var(--radius-full)', appearance: 'none', cursor: 'pointer' }}
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>
    </div>
  );
};

export default SearchBar;
