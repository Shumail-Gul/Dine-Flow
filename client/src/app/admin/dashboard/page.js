'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { 
  TrendingUp, 
  ShoppingBag, 
  UtensilsCrossed, 
  DollarSign, 
  Clock, 
  ChevronRight,
  RefreshCw 
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeOrdersCount: 0,
    popularItem: 'Loading...',
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const ordersRes = await api.get('/orders');
      const orders = ordersRes.data || [];

      // Calculate simple metrics
      const revenue = orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
      const active = orders.filter(o => o.status === 'pending' || o.status === 'preparing');
      
      setStats({
        totalRevenue: revenue.toFixed(2),
        totalOrders: orders.length,
        activeOrdersCount: active.length,
        popularItem: 'Margherita Pizza', // Placeholder or calculated from order logs
      });
      setRecentOrders(orders.slice(0, 5)); // Get 5 latest orders
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar Nav */}
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="flex items-center gap-2 font-bold text-xl text-amber-500 mb-8">
            <UtensilsCrossed className="w-6 h-6" />
            <span>DineFlow CMS</span>
          </div>
          <nav className="space-y-2">
            <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium">
              <TrendingUp className="w-4 h-4" /> Dashboard
            </Link>
            <Link href="/admin/menu" className="flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg text-sm font-medium transition">
              <UtensilsCrossed className="w-4 h-4" /> Menu Builder
            </Link>
            <Link href="/kitchen" className="flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg text-sm font-medium transition">
              <Clock className="w-4 h-4" /> Kitchen Display
            </Link>
          </nav>
        </div>
        <div className="border-t border-slate-800 pt-4 text-xs text-slate-500">
          Logged in as Manager
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Analytics Overview</h1>
            <p className="text-slate-500 text-sm">Real-time performance metrics and store summary</p>
          </div>
          <button 
            onClick={fetchDashboardData} 
            className="flex items-center gap-2 bg-white border border-slate-300 px-4 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Total Revenue</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">${stats.totalRevenue}</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Total Orders</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{stats.totalOrders}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Active Orders</p>
              <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{stats.activeOrdersCount}</h3>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase font-semibold">Top Seller</p>
              <h3 className="text-lg font-bold text-slate-900 mt-1 truncate max-w-[120px]">{stats.popularItem}</h3>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
            <Link href="/kitchen" className="text-amber-600 hover:underline text-sm font-medium flex items-center gap-1">
              View KDS Board <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-semibold">
                <tr>
                  <th className="px-4 py-3">Table #</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-slate-400">No recent orders found.</td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-900">Table {order.tableNumber}</td>
                      <td className="px-4 py-3">{order.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">${order.totalAmount?.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase ${
                          order.status === 'served' ? 'bg-emerald-100 text-emerald-800' :
                          order.status === 'preparing' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}