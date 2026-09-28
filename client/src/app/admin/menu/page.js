'use client';

import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import { 
  Plus, Trash2, Edit2, Check, X, Image as ImageIcon, 
  Search, RefreshCw, FolderPlus, Tag, Layers
} from 'lucide-react';

export default function MenuCMS() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Form & Modal States
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialFormState = {
    name: '',
    description: '',
    price: '',
    categoryId: '',
    imageUrl: '',
    isAvailable: true,
  };

  const [itemForm, setItemForm] = useState(initialFormState);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, itemRes] = await Promise.all([
        api.get('/categories'),
        api.get('/items')
      ]);
      setCategories(catRes.data || []);
      setItems(itemRes.data || []);
    } catch (err) {
      console.error('Error fetching CMS data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered items based on search query & selected category filter
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const itemCatId = typeof item.categoryId === 'object' ? item.categoryId?._id : item.categoryId;
      const matchesCategory = selectedCategoryFilter === 'all' || itemCatId === selectedCategoryFilter;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, selectedCategoryFilter, searchQuery]);

  // Create Category
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const slug = newCategoryName.toLowerCase().replace(/\s+/g, '-');
      await api.post('/categories', { name: newCategoryName, slug, displayOrder: categories.length + 1 });
      setNewCategoryName('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add category');
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id, name) => {
    if (!confirm(`Are you sure you want to delete the category "${name}"?`)) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete category');
    }
  };

  // Toggle Live Availability
  const handleToggleAvailability = async (id, currentStatus) => {
    try {
      await api.patch(`/items/${id}/toggle-availability`, { isAvailable: !currentStatus });
      setItems(items.map(item => item._id === id ? { ...item, isAvailable: !currentStatus } : item));
    } catch (err) {
      // Fallback update route if patch route isn't defined
      try {
        await api.put(`/items/${id}`, { isAvailable: !currentStatus });
        setItems(items.map(item => item._id === id ? { ...item, isAvailable: !currentStatus } : item));
      } catch (fallbackErr) {
        alert('Failed to update availability status');
      }
    }
  };

  // Open modal for editing or creating
  const handleOpenModal = (itemToEdit = null) => {
    if (itemToEdit) {
      setEditingItemId(itemToEdit._id);
      const catId = typeof itemToEdit.categoryId === 'object' ? itemToEdit.categoryId?._id : itemToEdit.categoryId;
      setItemForm({
        name: itemToEdit.name,
        description: itemToEdit.description || '',
        price: itemToEdit.price,
        categoryId: catId || '',
        imageUrl: itemToEdit.imageUrl || '',
        isAvailable: itemToEdit.isAvailable ?? true,
      });
    } else {
      setEditingItemId(null);
      setItemForm({ ...initialFormState, categoryId: categories[0]?._id || '' });
    }
    setShowItemModal(true);
  };

  // Create / Update Menu Item
  const handleSaveItem = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...itemForm,
        price: Number(itemForm.price)
      };

      if (editingItemId) {
        await api.put(`/items/${editingItemId}`, payload);
      } else {
        await api.post('/items', payload);
      }

      setShowItemModal(false);
      setItemForm(initialFormState);
      setEditingItemId(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save menu item');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Menu Item
  const handleDeleteItem = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.delete(`/items/${id}`);
      setItems(items.filter(item => item._id !== id));
    } catch (err) {
      alert('Failed to delete menu item');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 font-sans antialiased">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Menu CMS Management</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">Control categories, item pricing, stock status, and dish details in real-time.</p>
          </div>
          <button 
            onClick={() => handleOpenModal(null)}
            className="flex items-center justify-center gap-2 bg-amber-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-amber-700 transition shadow-lg shadow-amber-600/20"
          >
            <Plus className="w-4 h-4" /> Add New Dish
          </button>
        </div>

        {/* Category Management Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-amber-600" /> Categories Management
          </h3>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <form onSubmit={handleCreateCategory} className="flex gap-2 w-full md:w-auto flex-1">
              <input 
                type="text" 
                placeholder="New Category Name (e.g., Desserts, Cocktails)..."
                className="flex-1 max-w-md border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <button type="submit" className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition flex items-center gap-1.5 whitespace-nowrap">
                <FolderPlus className="w-4 h-4" /> Add Category
              </button>
            </form>

            {/* Existing Category Tags */}
            <div className="flex flex-wrap gap-2 items-center">
              {categories.map((c) => (
                <span key={c._id} className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-2">
                  {c.name}
                  <button onClick={() => handleDeleteCategory(c._id, c.name)} className="text-slate-400 hover:text-red-500 transition">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search items by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                selectedCategoryFilter === 'all' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Items ({items.length})
            </button>
            {categories.map((c) => (
              <button
                key={c._id}
                onClick={() => setSelectedCategoryFilter(c._id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  selectedCategoryFilter === c._id ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Item Management Data Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-12 text-slate-400 gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-amber-500" />
              <span className="text-xs font-semibold">Loading menu items...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs font-medium">
              No items found. Create a new dish to get started!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase text-[11px] font-black tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Dish</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Availability</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item) => {
                    const categoryObj = typeof item.categoryId === 'object' 
                      ? item.categoryId 
                      : categories.find(c => c._id === item.categoryId);

                    return (
                      <tr key={item._id} className="hover:bg-slate-50/80 transition">
                        <td className="px-6 py-4 flex items-center gap-3">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded-xl bg-slate-100" />
                          ) : (
                            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center border border-slate-200">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900">{item.name}</div>
                            <div className="text-xs text-slate-400 max-w-xs truncate">{item.description || 'No description added'}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-100 border border-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-lg font-bold">
                            {categoryObj?.name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-black text-slate-900">
                          ${Number(item.price)?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => handleToggleAvailability(item._id, item.isAvailable)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                              item.isAvailable 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                                : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                            }`}
                          >
                            {item.isAvailable ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                            {item.isAvailable ? 'In Stock' : 'Sold Out'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleOpenModal(item)}
                              className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                              title="Edit item"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteItem(item._id, item.name)}
                              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowItemModal(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-black text-slate-900 mb-4">
              {editingItemId ? 'Edit Menu Item' : 'Create New Menu Item'}
            </h2>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Item Name</label>
                <input 
                  type="text" required 
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
                  value={itemForm.name} 
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                <select 
                  required 
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
                  value={itemForm.categoryId} 
                  onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Price ($)</label>
                  <input 
                    type="number" step="0.01" required 
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
                    value={itemForm.price} 
                    onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Image URL</label>
                  <input 
                    type="text" 
                    placeholder="https://..." 
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
                    value={itemForm.imageUrl} 
                    onChange={(e) => setItemForm({ ...itemForm, imageUrl: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea 
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:ring-2 focus:ring-amber-500/50 focus:outline-none" 
                  rows="3"
                  value={itemForm.description} 
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="isAvailable"
                  checked={itemForm.isAvailable}
                  onChange={(e) => setItemForm({ ...itemForm, isAvailable: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                />
                <label htmlFor="isAvailable" className="text-xs font-bold text-slate-700">
                  Item is currently in stock & available for ordering
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowItemModal(false)} 
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-bold bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition shadow-md shadow-amber-600/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingItemId ? 'Update Dish' : 'Create Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}