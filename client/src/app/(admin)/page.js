'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function AdminDashboard() {
  const router = Router();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Automatically includes Authorization: Bearer <token>
        const { data } = await api.get('/orders');
        setOrders(data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        if (err.response?.status === 401) {
          // Token expired or missing -> redirect to login
          localStorage.removeItem('userInfo');
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <p>Total Orders Received: {orders.length}</p>
      )}
    </div>
  );
}