import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  AlertCircle, 
  Plus, 
  X, 
  Trash2, 
  Edit3, 
  Check, 
  DollarSign, 
  Package, 
  Tag, 
  Inbox,
  Loader2
} from 'lucide-react';
import { api } from '../services/api';
import type { InventoryItem } from '../services/api';

export const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showFiltersDropdown, setShowFiltersDropdown] = useState(false);
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeDropdownSku, setActiveDropdownSku] = useState<string | null>(null);
  
  // Form state
  const [formSku, setFormSku] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Electronics');
  const [formStock, setFormStock] = useState('50');
  const [formPrice, setFormPrice] = useState('99.99');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Quick Edit Stock State
  const [quickEditSku, setQuickEditSku] = useState<string | null>(null);
  const [quickStockVal, setQuickStockVal] = useState(0);

  // Toast State
  const [toasts, setToasts] = useState<{ id: number; message: string; type?: 'success' | 'info' | 'error' }[]>([]);

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Fetch Inventory from DB
  const loadInventory = async () => {
    setLoading(true);
    try {
      const data = await api.getInventory();
      setInventory(data);
    } catch (err) {
      addToast('Failed to sync with backend server. Using offline cache.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  // Filter Categories in current dataset
  const categories = ['All', ...new Set(inventory.map(item => item.category))];
  const statuses = ['All', 'In Stock', 'Low Stock', 'Out of Stock'];

  // Handle Search and Filters
  const filteredData = inventory.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (item.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Handle Create Product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    if (!formSku.trim() || !formName.trim()) {
      setFormError('SKU and Name are required.');
      setSubmitting(false);
      return;
    }

    const priceNum = parseFloat(formPrice);
    const stockNum = parseInt(formStock);

    if (isNaN(priceNum) || priceNum < 0) {
      setFormError('Please enter a valid price.');
      setSubmitting(false);
      return;
    }

    if (isNaN(stockNum) || stockNum < 0) {
      setFormError('Please enter a valid stock level.');
      setSubmitting(false);
      return;
    }

    // Determine status
    let status = 'In Stock';
    if (stockNum === 0) status = 'Out of Stock';
    else if (stockNum <= 35) status = 'Low Stock';

    const newItem: InventoryItem = {
      sku: formSku.trim().toUpperCase(),
      name: formName.trim(),
      category: formCategory,
      stock: stockNum,
      price: priceNum,
      status: status
    };

    try {
      const savedItem = await api.createInventoryItem(newItem);
      // Update local state
      setInventory(prev => [savedItem, ...prev]);
      addToast(`Product ${savedItem.sku} created successfully!`);
      // Reset form
      setFormSku('');
      setFormName('');
      setFormCategory('Electronics');
      setFormStock('50');
      setFormPrice('99.99');
      setShowAddModal(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create product SKU on backend.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (sku: string) => {
    try {
      await api.deleteInventoryItem(sku);
      setInventory(prev => prev.filter(item => (item.sku || item.id) !== sku));
      addToast(`SKU ${sku} deleted successfully!`, 'info');
    } catch (err) {
      addToast('Could not delete item from server.', 'error');
    }
    setActiveDropdownSku(null);
  };

  // Handle Update Stock
  const handleUpdateStockSubmit = async (sku: string) => {
    const item = inventory.find(i => (i.sku || i.id) === sku);
    if (!item) return;

    let status = 'In Stock';
    if (quickStockVal === 0) status = 'Out of Stock';
    else if (quickStockVal <= 35) status = 'Low Stock';

    const updatedItem: InventoryItem = {
      ...item,
      stock: quickStockVal,
      status: status
    };

    try {
      const result = await api.updateInventoryItem(sku, updatedItem);
      setInventory(prev => prev.map(i => (i.sku || i.id) === sku ? result : i));
      addToast(`Stock for SKU ${sku} updated to ${quickStockVal}`);
    } catch (err) {
      addToast('Failed to update stock on backend.', 'error');
    }
    setQuickEditSku(null);
    setActiveDropdownSku(null);
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast Overlay */}
      <div className="fixed bottom-6 right-6 z-50 space-y-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className={`backdrop-blur-xl border p-4 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-medium pointer-events-auto min-w-[300px] ${
                toast.type === 'error' ? 'bg-red-500/15 border-red-500/20 text-red-500' :
                toast.type === 'info' ? 'bg-blue-500/15 border-blue-500/20 text-blue-400' :
                'bg-emerald-500/15 border-emerald-500/20 text-emerald-400'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                toast.type === 'error' ? 'bg-red-500/20 text-red-500' :
                toast.type === 'info' ? 'bg-blue-500/20 text-blue-500' :
                'bg-emerald-500/20 text-emerald-500'
              }`}>
                {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
              </div>
              <p className="flex-1 text-foreground">{toast.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-sm text-foreground/50 mt-1">Real-time control over warehouse inventory units and price points</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filters Toggle Button */}
          <button 
            onClick={() => setShowFiltersDropdown(!showFiltersDropdown)}
            className={`px-4 py-2 border rounded-xl text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer ${
              showFiltersDropdown || selectedCategory !== 'All' || selectedStatus !== 'All'
                ? 'bg-primary/10 border-primary text-primary' 
                : 'bg-background border-border text-foreground hover:bg-foreground/5'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters {(selectedCategory !== 'All' || selectedStatus !== 'All') && '•'}
          </button>
          
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-medium shadow-lg shadow-primary/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            Add Product
          </button>
        </div>
      </div>

      {/* Slide-out Category & Status Filter Bar */}
      <AnimatePresence>
        {showFiltersDropdown && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-card border border-border rounded-2xl shadow-inner p-4 flex flex-wrap gap-6"
          >
            <div>
              <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">Category Filter</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                      selectedCategory === cat 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-background border border-border text-foreground/70 hover:bg-foreground/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">Stock Status Filter</label>
              <div className="flex flex-wrap gap-2">
                {statuses.map(st => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                      selectedStatus === st 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-background border border-border text-foreground/70 hover:bg-foreground/5'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Table Panel */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input 
              type="text"
              placeholder="Search by SKU, Name or Category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-foreground/40"
            />
          </div>
          {loading && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-background/50 text-foreground/60 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">Product Info</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Stock Level</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <AnimatePresence mode="popLayout">
                {filteredData.map((item) => {
                  const skuKey = item.sku || item.id || '';
                  const itemPrice = typeof item.price === 'number' ? `$${item.price.toFixed(2)}` : item.price;
                  return (
                    <motion.tr 
                      layoutId={`row-${skuKey}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, x: -30 }}
                      transition={{ duration: 0.2 }}
                      key={skuKey} 
                      className="hover:bg-foreground/[0.01] transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-foreground">{item.name}</td>
                      <td className="px-6 py-4 text-foreground/70 font-mono text-xs">{skuKey}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-foreground/5 border border-border/50 rounded-lg text-xs font-medium">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {quickEditSku === skuKey ? (
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="number" 
                              value={quickStockVal} 
                              onChange={(e) => setQuickStockVal(Math.max(0, parseInt(e.target.value) || 0))}
                              className="w-16 px-2 py-1 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <button 
                              onClick={() => handleUpdateStockSubmit(skuKey)}
                              className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setQuickEditSku(null)}
                              className="p-1 text-foreground/40 hover:bg-foreground/5 rounded-lg transition-colors cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-background border border-border/30 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${
                                  item.stock > 100 ? 'bg-emerald-500' : item.stock > 0 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min((item.stock / 500) * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-foreground/70 font-medium">{item.stock}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          item.status === 'In Stock' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                          item.status === 'Low Stock' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 
                          'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}>
                          {item.status === 'Low Stock' && <AlertCircle className="w-3.5 h-3.5" />}
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-foreground/70 font-medium font-mono text-sm">{itemPrice}</td>
                      <td className="px-6 py-4 text-right relative">
                        <button 
                          onClick={() => setActiveDropdownSku(activeDropdownSku === skuKey ? null : skuKey)}
                          className="p-1.5 text-foreground/40 hover:text-foreground rounded-lg hover:bg-foreground/5 transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        
                        {/* Dropdown Action Overlay */}
                        <AnimatePresence>
                          {activeDropdownSku === skuKey && (
                            <>
                              <div className="fixed inset-0 z-30" onClick={() => setActiveDropdownSku(null)} />
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                className="absolute right-6 mt-1 w-44 bg-card border border-border rounded-xl shadow-xl z-40 p-1 divide-y divide-border/50 text-left"
                              >
                                <div className="py-1">
                                  <button 
                                    onClick={() => {
                                      setQuickEditSku(skuKey);
                                      setQuickStockVal(item.stock);
                                      setActiveDropdownSku(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs text-foreground/80 hover:bg-foreground/5 flex items-center gap-2 rounded-lg cursor-pointer transition-colors"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                                    Edit Stock Level
                                  </button>
                                </div>
                                <div className="py-1">
                                  <button 
                                    onClick={() => handleDeleteProduct(skuKey)}
                                    className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 flex items-center gap-2 rounded-lg cursor-pointer transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete SKU Item
                                  </button>
                                </div>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
          
          {filteredData.length === 0 && !loading && (
            <div className="p-12 text-center text-foreground/50 flex flex-col items-center justify-center gap-2">
              <Inbox className="w-10 h-10 text-foreground/20" />
              <span>No products found matching active query filters</span>
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal (Glassmorphic design) */}
      <AnimatePresence>
        {showAddModal && (
          <>
            {/* Modal backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              {/* Modal Body */}
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg bg-card/95 border border-border/80 rounded-3xl p-6 md:p-8 shadow-2xl relative z-50 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Package className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-foreground">Create New SKU Record</h3>
                  </div>
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="p-1.5 text-foreground/40 hover:text-foreground hover:bg-foreground/5 rounded-xl transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {formError && (
                  <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleAddProduct} className="space-y-5 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-foreground/80 mb-1.5">SKU ID (Unique)</label>
                      <input 
                        type="text" 
                        placeholder="SKU-8022"
                        value={formSku}
                        onChange={(e) => setFormSku(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground/80 mb-1.5">Category</label>
                      <select 
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
                        disabled={submitting}
                      >
                        <option value="Electronics">Electronics</option>
                        <option value="Furniture">Furniture</option>
                        <option value="Smart Home">Smart Home</option>
                        <option value="Networking">Networking</option>
                        <option value="Apparel">Apparel</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground/80 mb-1.5">Product Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Ergonomic Bluetooth Keyboard"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-foreground/80 mb-1.5">Initial Stock Level</label>
                      <div className="relative">
                        <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                        <input 
                          type="number" 
                          min="0"
                          placeholder="150"
                          value={formStock}
                          onChange={(e) => setFormStock(e.target.value)}
                          className="w-full pl-10 pr-4 bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                          required
                          disabled={submitting}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground/80 mb-1.5">Price (USD)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                        <input 
                          type="number" 
                          step="0.01"
                          min="0"
                          placeholder="129.99"
                          value={formPrice}
                          onChange={(e) => setFormPrice(e.target.value)}
                          className="w-full pl-10 pr-4 bg-background border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                          required
                          disabled={submitting}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
                    <button 
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-medium hover:bg-foreground/5 transition-colors cursor-pointer"
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-sm shadow-lg shadow-primary/20 transition-all flex items-center gap-2 cursor-pointer"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creating SKU...
                        </>
                      ) : (
                        'Save Record'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

