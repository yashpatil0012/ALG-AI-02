'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, FileText, Search, Settings, Sparkles, Upload, Activity } from 'lucide-react';
import { fetchHealth, loadDemoData } from '@/lib/api';

interface NavbarProps {
  onDemoLoaded?: () => void;
  onUploadClick?: () => void;
}

export default function Navbar({ onDemoLoaded, onUploadClick }: NavbarProps) {
  const pathname = usePathname();
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      const data = await fetchHealth();
      setIsBackendHealthy(data.status === 'healthy');
    } catch {
      setIsBackendHealthy(false);
    }
  };

  const handleLoadDemo = async () => {
    setIsDemoLoading(true);
    try {
      await loadDemoData();
      if (onDemoLoaded) onDemoLoaded();
      alert('✓ Demo documents loaded & indexed successfully! Proceed to Investigate or Dashboard.');
    } catch (e) {
      alert('Error loading demo data. Ensure backend API is running.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  const navItems = [
    { name: 'Dashboard', href: '/', icon: Activity },
    { name: 'Document Library', href: '/documents', icon: FileText },
    { name: 'Investigate Q&A', href: '/investigate', icon: Search },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Tagline */}
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-900/30">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">DocIntel AI</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-800/40">
                  ALGOTHON'26
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-none hidden sm:block">
                Ask your documents. Get evidence, not guesses.
              </p>
            </div>
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          {/* Health Badge */}
          <div className="hidden lg:flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800">
            <span
              className={`w-2 h-2 rounded-full ${
                isBackendHealthy === true
                  ? 'bg-emerald-500 animate-pulse'
                  : isBackendHealthy === false
                  ? 'bg-red-500'
                  : 'bg-amber-500'
              }`}
            />
            <span className="text-slate-400 font-mono text-[11px]">
              {isBackendHealthy === true ? 'API Ready' : isBackendHealthy === false ? 'API Offline' : 'Connecting...'}
            </span>
          </div>

          {/* Load Demo Data Button */}
          <button
            onClick={handleLoadDemo}
            disabled={isDemoLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-500 hover:to-rose-500 transition shadow-md shadow-red-950/40 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isDemoLoading ? 'Loading Demo...' : 'Load Demo Data'}</span>
          </button>

          {/* Upload Button */}
          {onUploadClick && (
            <button
              onClick={onUploadClick}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition border border-slate-700"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upload</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
