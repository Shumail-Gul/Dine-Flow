'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { socket, connectSocket, disconnectSocket } from '@/lib/socket';
import { Clock, CheckCircle2, AlertCircle, ChefHat, RefreshCw, Volume2, VolumeX } from 'lucide-react';

export default function KitchenDisplayPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active'); // 'active', 'pending', 'preparing', 'ready'
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Play audio alert on new incoming order
  const playAlertSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders');
        setOrders(data);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // Connect WebSocket and setup listeners
    connectSocket();

    socket.on('new_order', (newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);
      playAlertSound();
    });

    socket.on('order_status_updated', (updatedOrder) => {
      setOrders((prev) =>
        prev.map((order) => (order._id === updatedOrder._id ? updatedOrder : order))
      );
    });

    return () => {
      socket.off('new_order');
      socket.off('order_status_updated');
      disconnectSocket();
    };
  }, [soundEnabled]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      // Optimistic UI update
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
      await api.put(`/orders/${orderId}`, { status: newStatus });
    } catch (err) {
      console.error('Failed to update status:', err);
      // Revert fetch on failure
      const { data } = await api.get('/orders');
      setOrders(data);
    }
  };

  const getElapsedTime = (createdAt) => {
    const mins = Math.floor((new Date() - new Date(createdAt)) / 60000);
    return mins < 0 ? 0 : mins;
  };

  const statusColors = {
    pending: 'bg-red-500/20 text-red-400 border-red-500/30',
    preparing: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    ready: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    served: 'bg-slate-700/50 text-slate-400 border-slate-600',
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === 'active') return o.status !== 'served' && o.status !== 'cancelled';
    return o.status === filter;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Header Bar */}
      <header className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-amber-500">
            <ChefHat className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Kitchen Display System (KDS)
            </h1>
            <p className="text-xs text-slate-400">Live order management & ticket tracking</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-amber-400'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            {soundEnabled ? 'Audio On' : 'Audio Muted'}
          </button>

          <button
            onClick={async () => {
              setLoading(true);
              const { data } = await api.get('/orders');
              setOrders(data);
              setLoading(false);
            }}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 transition flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="flex gap-2 my-6 overflow-x-auto">
        {['active', 'pending', 'preparing', 'ready', 'served'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition whitespace-nowrap ${
              filter === tab
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            {tab === 'active' ? 'Active Orders' : tab}
            <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-slate-950/40">
              {
                orders.filter((o) =>
                  tab === 'active' ? o.status !== 'served' && o.status !== 'cancelled' : o.status === tab
                ).length
              }
            </span>
          </button>
        ))}
      </div>

      {/* Grid Display */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px] text-slate-500 gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-amber-500" />
          <span>Loading live kitchen queue...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[350px] border border-dashed border-slate-800 rounded-2xl bg-slate-900/30 text-slate-500">
          <CheckCircle2 className="w-12 h-12 text-slate-700 mb-2" />
          <p className="text-sm font-medium">No orders found in this view</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredOrders.map((order) => {
            const elapsedMins = getElapsedTime(order.createdAt);
            const isDelayed = elapsedMins > 15 && order.status !== 'served';

            return (
              <div
                key={order._id}
                className={`bg-slate-900 border rounded-2xl flex flex-col justify-between overflow-hidden shadow-xl transition-all ${
                  isDelayed ? 'border-red-500/50 ring-1 ring-red-500/20' : 'border-slate-800'
                }`}
              >
                {/* Order Header */}
                <div>
                  <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/40">
                    <div>
                      <span className="text-xs text-slate-400 font-semibold">Table</span>
                      <h2 className="text-xl font-black text-white">#{order.tableNumber}</h2>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 justify-end">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{elapsedMins}m ago</span>
                      </div>
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border mt-1 ${
                          statusColors[order.status] || 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div className="p-4 space-y-3 max-h-[260px] overflow-y-auto">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-start justify-between text-sm gap-2">
                        <div className="flex gap-2.5">
                          <span className="font-extrabold text-amber-500 bg-amber-500/10 w-6 h-6 rounded-lg flex items-center justify-center text-xs flex-shrink-0">
                            {item.quantity}x
                          </span>
                          <div>
                            <p className="font-semibold text-slate-200">{item.name}</p>
                            {item.selectedModifiers?.length > 0 && (
                              <p className="text-[11px] text-slate-400 italic">
                                {item.selectedModifiers.join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Action Buttons */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/80 gap-2 flex">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => updateStatus(order._id, 'preparing')}
                      className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md shadow-amber-600/20"
                    >
                      Start Preparing
                    </button>
                  )}

                  {order.status === 'preparing' && (
                    <button
                      onClick={() => updateStatus(order._id, 'ready')}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-md shadow-emerald-600/20"
                    >
                      Mark Ready
                    </button>
                  )}

                  {order.status === 'ready' && (
                    <button
                      onClick={() => updateStatus(order._id, 'served')}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition border border-slate-700"
                    >
                      Complete & Serve
                    </button>
                  )}

                  {order.status === 'served' && (
                    <div className="w-full py-2 text-center text-xs text-slate-500 font-medium">
                      Order Completed
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}