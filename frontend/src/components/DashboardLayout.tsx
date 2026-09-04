'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Book, PlusCircle, User as UserIcon, BarChart2, Bot, Lightbulb, Sun, Target, FileText, Shield } from 'lucide-react';
import { useEffect } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-indigo-600">MindVault AI</h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link 
            href="/"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname === '/' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-800 hover:bg-gray-100'}`}
          >
            <Book className="w-5 h-5" />
            My Journals
          </Link>
          <Link 
            href="/dashboard"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname === '/dashboard' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-800 hover:bg-gray-100'}`}
          >
            <BarChart2 className="w-5 h-5" />
            Mood Dashboard
          </Link>
          <Link 
            href="/assistant"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname === '/assistant' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-800 hover:bg-gray-100'}`}
          >
            <Bot className="w-5 h-5" />
            AI Assistant
          </Link>
          <Link 
            href="/insights"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname === '/insights' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-800 hover:bg-gray-100'}`}
          >
            <Lightbulb className="w-5 h-5" />
            Deep Insights
          </Link>
          <Link 
            href="/reflection"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname === '/reflection' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-800 hover:bg-gray-100'}`}
          >
            <Sun className="w-5 h-5" />
            Daily Reflection
          </Link>
          <Link 
            href="/reports"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname === '/reports' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-800 hover:bg-gray-100'}`}
          >
            <FileText className="w-5 h-5" />
            Reports
          </Link>
          <Link 
            href="/goals"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname === '/goals' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-800 hover:bg-gray-100'}`}
          >
            <Target className="w-5 h-5" />
            Goals
          </Link>
          <Link 
            href="/new"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname === '/new' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-800 hover:bg-gray-100'}`}
          >
            <PlusCircle className="w-5 h-5" />
            New Entry
          </Link>
          <div className="pt-4 mt-4 border-t border-gray-200"></div>
          <Link 
            href="/privacy"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${pathname === '/privacy' || pathname === '/privacy-policy' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-800 hover:bg-gray-100'}`}
          >
            <Shield className="w-5 h-5" />
            Privacy Center
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-3 py-2 text-sm text-gray-800 mb-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <UserIcon className="w-5 h-5 text-gray-600" />
            <span className="truncate">{user.email}</span>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}
