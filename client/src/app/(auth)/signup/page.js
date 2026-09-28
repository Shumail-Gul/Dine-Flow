'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { Utensils } from 'lucide-react';

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'admin' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', formData);
      router.push('/login?registered=true');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
        <div className="flex flex-col items-center mb-6">
          <Utensils className="w-10 h-10 text-amber-600 mb-2" />
          <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
          <p className="text-slate-500 text-sm">Join DineFlow to manage your restaurant</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input 
              type="text" 
              required
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-black  focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Account Role</label>
            <select 
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="admin" >Restaurant Manager / Admin</option>
              <option value="kitchen">Kitchen Staff</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-amber-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-amber-700 transition disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-amber-600 font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}