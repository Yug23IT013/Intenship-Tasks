import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../api/api';
import ProductCard from '../components/ProductCard';
import { CATEGORIES } from '../data/products';
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi';

const SORT_OPTIONS = [
  { value: 'default',     label: 'Default' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Top Rated' },
  { value: 'discount',   label: 'Biggest Discount' },
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState('default');
  const [filterOpen, setFilterOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState(1500);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const search   = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'all';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = {
          ...(search && { search }),
          ...(category !== 'all' && { category }),
          ...(onlyInStock && { inStock: true }),
          ...(maxPrice < 1500 && { maxPrice }),
          ...(sort !== 'default' && { sort }),
        };
        const res = await getProducts(params);
        setProducts(res.data.data);
        setPagination(res.data.pagination);
      } catch (err) {
        console.error('Failed to load products:', err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [search, category, sort, maxPrice, onlyInStock]);

  const setCategory = (id) => {
    const params = new URLSearchParams(searchParams);
    if (id === 'all') params.delete('category');
    else params.set('category', id);
    params.delete('search');
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchParams({});
    setSort('default');
    setMaxPrice(1500);
    setOnlyInStock(false);
  };

  const currentCat = CATEGORIES.find(c => c.id === category);

  return (
    <div className="products-page">
      <div className="products-header">
        <div>
          <h1 className="page-title">
            {search ? `Results for "${search}"` : currentCat?.label ?? 'All Products'}
          </h1>
          <p className="page-subtitle">
            {loading ? 'Loading…' : `${products.length} product${products.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
        <div className="products-controls">
          <button className="btn-filter" id="open-filter-btn" onClick={() => setFilterOpen(!filterOpen)}>
            <FiFilter size={14} /> Filters
          </button>
          <div className="sort-wrap">
            <FiChevronDown className="sort-icon" size={14} />
            <select id="sort-select" value={sort} onChange={e => setSort(e.target.value)} className="sort-select">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="products-layout">
        {/* Sidebar */}
        <aside className={`sidebar ${filterOpen ? 'open' : ''}`} id="filter-sidebar">
          <div className="sidebar-header">
            <h3>Filters</h3>
            <button className="sidebar-close" id="close-filter-btn" onClick={() => setFilterOpen(false)}><FiX /></button>
          </div>
          <div className="filter-section">
            <h4 className="filter-label">Category</h4>
            <ul className="cat-filter-list">
              {CATEGORIES.map(cat => (
                <li key={cat.id}>
                  <button className={`cat-filter-btn ${category === cat.id ? 'active' : ''}`} id={`filter-cat-${cat.id}`} onClick={() => setCategory(cat.id)}>
                    {cat.icon} {cat.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="filter-section">
            <h4 className="filter-label">Max Price: ₹{maxPrice}</h4>
            <input id="price-range-slider" type="range" min="0" max="1500" step="50" value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} className="price-slider" />
            <div className="price-labels"><span>₹0</span><span>₹1500</span></div>
          </div>
          <div className="filter-section">
            <label className="checkbox-label" htmlFor="in-stock-filter">
              <input id="in-stock-filter" type="checkbox" checked={onlyInStock} onChange={e => setOnlyInStock(e.target.checked)} />
              In Stock Only
            </label>
          </div>
          <button className="btn-clear-filters" id="clear-filters-btn" onClick={clearFilters}>
            <FiX size={13} /> Clear All Filters
          </button>
        </aside>

        {/* Grid */}
        <div className="products-grid-wrap">
          {loading ? (
            <div className="empty-products"><p>Loading products…</p></div>
          ) : products.length === 0 ? (
            <div className="empty-products">
              <span>😕</span>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search term</p>
              <button className="btn-primary" id="reset-filters-btn" onClick={clearFilters}>Reset Filters</button>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
