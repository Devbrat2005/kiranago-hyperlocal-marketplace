import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ onClick, label = 'Back', className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 shadow-sm text-slate-700 hover:text-slate-950 font-extrabold text-xs transition-all active:scale-95 group ${className}`}
      aria-label="Go back to previous page"
    >
      <ArrowLeft className="w-4 h-4 text-emerald-600 group-hover:-translate-x-1 transition-transform" />
      <span>{label}</span>
    </button>
  );
}
