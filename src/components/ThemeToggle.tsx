"use client";

import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative inline-flex h-10 w-20 items-center justify-center rounded-full border-2 transition-all duration-500 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/50",
        theme === 'dark' 
          ? "bg-slate-800 border-slate-600 hover:bg-slate-700" 
          : "bg-white border-blue-200 hover:bg-blue-50"
      )}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {/* Background Track */}
      <div className={cn(
        "absolute inset-1 rounded-full transition-all duration-500",
        theme === 'dark' ? "bg-slate-700" : "bg-blue-100"
      )} />
      
      {/* Toggle Circle */}
      <div className={cn(
        "absolute top-1 h-8 w-8 rounded-full shadow-lg transition-all duration-500 flex items-center justify-center",
        theme === 'dark' 
          ? "left-11 bg-slate-900 border border-slate-600" 
          : "left-1 bg-white border border-blue-200"
      )}>
        {theme === 'dark' ? (
          <Moon className="h-4 w-4 text-blue-400 transition-all duration-300" />
        ) : (
          <Sun className="h-4 w-4 text-amber-500 transition-all duration-300" />
        )}
      </div>
      
      {/* Icons in background */}
      <div className="absolute inset-0 flex items-center justify-between px-2">
        <Sun className={cn(
          "h-4 w-4 transition-all duration-300",
          theme === 'light' ? "text-amber-500 opacity-100" : "text-slate-400 opacity-50"
        )} />
        <Moon className={cn(
          "h-4 w-4 transition-all duration-300",
          theme === 'dark' ? "text-blue-400 opacity-100" : "text-slate-400 opacity-50"
        )} />
      </div>
    </button>
  );
} 