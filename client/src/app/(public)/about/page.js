import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-amber-600 font-medium mb-8 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <h1 className="text-4xl font-bold mb-6 text-slate-900">About DineFlow</h1>
        <p className="text-slate-600 text-lg leading-relaxed mb-8">
          DineFlow was designed to bridge the operational gap between customer orders and kitchen workflows. Built as an end-to-end modern Content Management System and order routing engine, it removes order lag and manual paper ticketing in hospitality environments.
        </p>

        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm mb-8">
          <h2 className="text-2xl font-bold mb-4 text-slate-900">Built With a Modern Stack</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'Next.js App Router for high performance rendering',
              'Express.js RESTful API architecture',
              'MongoDB Atlas for structured sub-document schemas',
              'Socket.io for low-latency WebSocket events',
              'Tailwind CSS for responsive dashboard layouts',
              'JWT HttpOnly cookie authentication'
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-3 text-slate-700 text-sm">
                <CheckCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}