'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import api from '@/lib/api';
import { 
  ShoppingCart, Utensils, Plus, Minus, Search, 
  X, Trash2, AlertCircle
} from 'lucide-react';

export default function PublicMenu() {
  const searchParams = useSearchParams();
  const adminId = searchParams.get('adminId');

  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [tableNumber, setTableNumber] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItemForModal, setSelectedItemForModal] = useState(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminId) {
      setLoading(false);
      return;
    }

    const fetchMenu = async () => {
      setLoading(true);
      try {
        const [catRes, itemRes] = await Promise.all([
          api.get(`/categories?adminId=${adminId}`),
          api.get(`/items?adminId=${adminId}`)
        ]);
        setCategories(catRes.data || []);
        setItems(itemRes.data || []);
      } catch (err) {
        console.error('Error fetching public menu:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [adminId]);

  // Filter items by category and search term
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const catId = typeof item.categoryId === 'object' ? item.categoryId?._id : item.categoryId;
      const matchesCategory = selectedCategory === 'all' || catId === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  const openItemModal = (item) => {
    if (!item.isAvailable) return;
    setSelectedItemForModal(item);
    setModalQuantity(1);
    setSpecialInstructions('');
  };

  const addItemFromModal = () => {
    if (!selectedItemForModal) return;
    
    const existingIndex = cart.findIndex(i => 
      i._id === selectedItemForModal._id && i.instructions === specialInstructions
    );

    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += modalQuantity;
      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        {
          ...selectedItemForModal,
          quantity: modalQuantity,
          unitPrice: Number(selectedItemForModal.price),
          instructions: specialInstructions,
          selectedModifiers: specialInstructions ? [specialInstructions] : []
        }
      ]);
    }
    setSelectedItemForModal(null);
  };

  const updateCartQuantity = (index, delta) => {
    const newCart = [...cart];
    newCart[index].quantity += delta;
    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1);
    }
    setCart(newCart);
  };

  const calculateTotal = () => {
    return cart.reduce((acc, curr) => acc + (curr.unitPrice * curr.quantity), 0).toFixed(2);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return alert('Your cart is empty!');
    if (!adminId) return alert('Missing restaurant identifier.');

    setIsSubmitting(true);
    try {
      const orderPayload = {
        adminId, // Multi-tenant binding
        tableNumber: Number(tableNumber || 1),
        items: cart.map(i => ({
          menuItemId: i._id,
          name: i.name,
          unitPrice: Number(i.unitPrice),
          quantity: Number(i.quantity),
          selectedModifiers: i.selectedModifiers || []
        })),
        totalAmount: Number(calculateTotal())
      };

      await api.post('/orders', orderPayload);
      alert('Order submitted successfully! The kitchen has received your order.');
      setCart([]);
      setIsCartOpen(false);
    } catch (err) {
      console.error('Order Error Details:', err.response?.data);
      const errorMessage = err.response?.data?.message || 'Failed to place order. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!adminId) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md border border-slate-200 space-y-3">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Restaurant Identifier Missing</h2>
          <p className="text-xs text-slate-500">
            Please scan the QR code at your table or use a valid restaurant link with an admin identifier (e.g., <code>?adminId=YOUR_ADMIN_ID</code>).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-32 font-sans antialiased">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-3.5 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 font-black text-xl text-amber-600">
            <div className="bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
              <Utensils className="w-5 h-5 text-amber-600" />
            </div>
            <span className="tracking-tight text-slate-900 font-extrabold">DineFlow</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <span className="text-slate-500">Table:</span>
            <input 
              type="number" 
              min="1" 
              className="w-12 bg-white border border-slate-300 rounded-lg p-1 text-center font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={tableNumber} 
              onChange={(e) => setTableNumber(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-5">
        {/* Search Bar */}
        <div className="relative mb-5">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search dishes or ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          <button 
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
              selectedCategory === 'all' 
                ? 'bg-amber-600 text-white shadow-amber-600/20' 
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Items
          </button>
          {categories.map(c => (
            <button 
              key={c._id}
              onClick={() => setSelectedCategory(c._id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                selectedCategory === c._id 
                  ? 'bg-amber-600 text-white shadow-amber-600/20' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Item Grid */}
        {loading ? (
          <div className="py-20 text-center text-xs font-bold text-slate-400">Loading menu...</div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center text-xs font-bold text-slate-400">No menu items found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mt-4">
            {filteredItems.map(item => (
              <div 
                key={item._id} 
                onClick={() => openItemModal(item)}
                className={`bg-white border border-slate-200 rounded-2xl p-4 flex gap-4 shadow-sm hover:shadow-md transition cursor-pointer relative overflow-hidden ${
                  !item.isAvailable ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''
                }`}
              >
                <img 
                  src={item.imageUrl || 'https://via.placeholder.com/150'} 
                  alt={item.name} 
                  className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl flex-shrink-0 bg-slate-100"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-900 text-base leading-snug">{item.name}</h3>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 font-normal">{item.description}</p>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="font-black text-amber-600 text-base">
                      ${Number(item.price)?.toFixed(2)}
                    </span>
                    {item.isAvailable ? (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          openItemModal(item);
                        }}
                        className="flex items-center gap-1 bg-slate-900 hover:bg-amber-600 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    ) : (
                      <span className="text-[11px] text-red-500 font-bold bg-red-50 px-2.5 py-1 rounded-lg border border-red-100">
                        Sold Out
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Item Details & Customization Modal */}
      {selectedItemForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedItemForModal(null)}
              className="absolute right-4 top-4 bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>

            <img 
              src={selectedItemForModal.imageUrl || 'https://via.placeholder.com/200'} 
              alt={selectedItemForModal.name} 
              className="w-full h-48 object-cover rounded-2xl mb-4 bg-slate-100"
            />

            <h2 className="text-xl font-black text-slate-900">{selectedItemForModal.name}</h2>
            <p className="text-xs text-slate-500 mt-1">{selectedItemForModal.description}</p>

            {/* Special Instructions Field */}
            <div className="mt-5">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Special Instructions / Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Extra spicy, sauce on the side..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
              <span className="text-sm font-bold text-slate-900">Quantity</span>
              <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                  className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-200 font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-black text-sm text-slate-900">{modalQuantity}</span>
                <button 
                  onClick={() => setModalQuantity(modalQuantity + 1)}
                  className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-200 font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Modal Add Button */}
            <button
              onClick={addItemFromModal}
              className="w-full mt-6 bg-amber-600 hover:bg-amber-700 text-white py-3.5 rounded-xl font-extrabold text-sm transition shadow-lg shadow-amber-600/20 flex items-center justify-between px-5"
            >
              <span>Add to Order</span>
              <span>${(Number(selectedItemForModal.price) * modalQuantity).toFixed(2)}</span>
            </button>
          </div>
        </div>
      )}

      {/* Slide-over Cart View Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-600" />
                <h2 className="font-black text-slate-900 text-base">Your Cart Order</h2>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
                  <div className="flex-1 pr-3">
                    <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                    {item.instructions && (
                      <p className="text-[11px] text-amber-600 font-medium italic mt-0.5">
                        Note: {item.instructions}
                      </p>
                    )}
                    <span className="text-xs font-extrabold text-slate-700 mt-1 block">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-white border border-slate-200 p-1 rounded-xl">
                    <button 
                      onClick={() => updateCartQuantity(index, -1)}
                      className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200"
                    >
                      {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-red-500" /> : <Minus className="w-3 h-3" />}
                    </button>
                    <span className="w-5 text-center font-bold text-xs text-slate-900">{item.quantity}</span>
                    <button 
                      onClick={() => updateCartQuantity(index, 1)}
                      className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 hover:bg-slate-200"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="flex justify-between items-center text-slate-600 text-sm font-semibold">
                <span>Subtotal</span>
                <span className="text-slate-900 font-black">${calculateTotal()}</span>
              </div>
              <button 
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-3.5 rounded-xl text-sm transition shadow-lg shadow-amber-600/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting Order...' : 'Confirm & Send to Kitchen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sticky Action Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-xl mx-auto z-40">
          <div className="bg-slate-900 text-white p-3.5 pl-5 rounded-2xl shadow-2xl flex items-center justify-between border border-slate-800 backdrop-blur-lg">
            <div 
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="relative">
                <ShoppingCart className="w-6 h-6 text-amber-500" />
                <span className="absolute -top-2 -right-2 bg-amber-500 text-slate-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Total Amount</p>
                <p className="font-black text-base leading-tight">${calculateTotal()}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCartOpen(true)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3.5 py-2.5 rounded-xl text-xs font-bold transition"
              >
                View Items
              </button>
              <button 
                onClick={handleCheckout} 
                disabled={isSubmitting}
                className="bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded-xl font-black text-xs transition disabled:opacity-50 shadow-md shadow-amber-600/30"
              >
                {isSubmitting ? 'Sending...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      )} 
    </div>
  );
}