import Link from 'next/link';
import { Utensils, QrCode, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl text-amber-600">
          <Utensils className="w-6 h-6" />
          <span>DineFlow</span>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="/about" className="hover:text-amber-600 transition">About Us</Link>
          <Link href="/menu" className="hover:text-amber-600 transition">Public Menu</Link>
          <Link href="/login" className="hover:text-amber-600 transition">Login</Link>
          <Link 
            href="/signup" 
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
          Next-Gen Restaurant CMS
        </span>
        <h1 className="text-5xl font-extrabold mt-4 mb-6 leading-tight text-slate-900">
          Streamline Your Menu Management & <br />
          <span className="text-amber-600">Real-Time Kitchen Orders</span>
        </h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto mb-8">
          DineFlow gives restaurant owners total control over multi-category menus, dynamic item modifiers, and live kitchen order display updates in real time.
        </p>
        <div className="flex justify-center gap-4">
          <Link 
            href="/signup" 
            className="flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-amber-700 transition"
          >
            Start Free Trial <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            href="/menu" 
            className="bg-white border border-slate-300 px-6 py-3 rounded-lg text-lg font-medium text-slate-700 hover:bg-slate-100 transition"
          >
            View Demo Menu
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-white py-16 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-xl border border-slate-100 bg-slate-50">
            <QrCode className="w-10 h-10 text-amber-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Digital Menu CMS</h3>
            <p className="text-slate-600 text-sm">
              Manage categories, modifiers, and instant sold-out toggles from an intuitive admin panel.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-slate-100 bg-slate-50">
            <Clock className="w-10 h-10 text-amber-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Live Kitchen Display</h3>
            <p className="text-slate-600 text-sm">
              Push incoming customer orders directly to kitchen screens instantly via WebSockets.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-slate-100 bg-slate-50">
            <ShieldCheck className="w-10 h-10 text-amber-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Role-Based Control</h3>
            <p className="text-slate-600 text-sm">
              Differentiate access levels between store managers, kitchen chefs, and public guests securely.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}