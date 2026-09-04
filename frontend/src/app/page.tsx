'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Search, FileText, AlertCircle, Filter, X, Loader2, Sparkles } from 'lucide-react';

interface AIAnalysis {
  mood: string;
  themes: string[];
}

interface Journal {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  aiAnalysis?: AIAnalysis;
}

export default function Dashboard() {
  const router = useRouter();
  const { fetchApi } = useApi();
  const { user, loading: authLoading } = useAuth();
  
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzingAll, setIsAnalyzingAll] = useState(false);

  const handleAnalyzeAll = async () => {
    setIsAnalyzingAll(true);
    try {
      await fetchApi('/journals/insights', { method: 'POST' });
      router.push('/insights');
    } catch (err: any) {
      setError(err.message || 'Failed to analyze journals. Please try again.');
      setIsAnalyzingAll(false);
    }
  };
  
  // Filter and Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState('All');
  const [selectedTheme, setSelectedTheme] = useState('All');
  const [dateRange, setDateRange] = useState('all'); // 'all', 'today', 'week', 'month'
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'oldest'

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    const loadJournals = async () => {
      try {
        const response = await fetchApi('/journals');
        setJournals(response.data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load journals');
      } finally {
        setLoading(false);
      }
    };
    loadJournals();
  }, [fetchApi, user, authLoading]);

  // Derived filter options
  const uniqueMoods = useMemo(() => {
    const moods = journals.map(j => j.aiAnalysis?.mood).filter(Boolean) as string[];
    return Array.from(new Set(moods)).sort();
  }, [journals]);

  const uniqueThemes = useMemo(() => {
    const themes = journals.flatMap(j => j.aiAnalysis?.themes || []);
    return Array.from(new Set(themes)).sort();
  }, [journals]);

  // Apply filters and sorting
  const filteredJournals = useMemo(() => {
    let result = [...journals];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        j => j.title.toLowerCase().includes(q) || j.content.toLowerCase().includes(q)
      );
    }

    // Mood
    if (selectedMood !== 'All') {
      result = result.filter(j => j.aiAnalysis?.mood === selectedMood);
    }

    // Theme
    if (selectedTheme !== 'All') {
      result = result.filter(j => j.aiAnalysis?.themes?.includes(selectedTheme));
    }

    // Date Range
    if (dateRange !== 'all') {
      const now = new Date();
      result = result.filter(j => {
        const date = new Date(j.createdAt);
        if (dateRange === 'today') {
          return date.toDateString() === now.toDateString();
        }
        if (dateRange === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return date >= weekAgo;
        }
        if (dateRange === 'month') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return date >= monthAgo;
        }
        return true;
      });
    }

    // Sort
    result.sort((a, b) => {
      const tA = new Date(a.createdAt).getTime();
      const tB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? tB - tA : tA - tB;
    });

    return result;
  }, [journals, searchQuery, selectedMood, selectedTheme, dateRange, sortOrder]);

  const hasActiveFilters = searchQuery !== '' || selectedMood !== 'All' || selectedTheme !== 'All' || dateRange !== 'all' || sortOrder !== 'newest';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedMood('All');
    setSelectedTheme('All');
    setDateRange('all');
    setSortOrder('newest');
  };

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto p-4 sm:p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Journals</h1>
              <p className="text-sm text-gray-600 mt-1">Reflect on your thoughts and experiences.</p>
            </div>
            <div className="flex items-center gap-3">
              {journals.length > 0 && (
                <button
                  onClick={handleAnalyzeAll}
                  disabled={isAnalyzingAll}
                  className="inline-flex items-center px-4 py-2 border border-indigo-200 shadow-sm text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                >
                  {isAnalyzingAll ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze All Journals
                    </>
                  )}
                </button>
              )}
              <Link
                href="/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                New Entry
              </Link>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 space-y-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search journal entries by title or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center text-sm text-gray-500 gap-2 mr-2 hidden sm:flex">
                <Filter className="w-4 h-4" />
                <span>Filters:</span>
              </div>
              
              <select
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value)}
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 transition-colors"
              >
                <option value="All">All Moods</option>
                {uniqueMoods.map(mood => (
                  <option key={mood} value={mood}>{mood}</option>
                ))}
              </select>

              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 transition-colors max-w-[150px] sm:max-w-none truncate"
              >
                <option value="All">All Themes</option>
                {uniqueThemes.map(theme => (
                  <option key={theme} value={theme}>{theme}</option>
                ))}
              </select>

              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 transition-colors"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Past 7 Days</option>
                <option value="month">Past 30 Days</option>
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 transition-colors ml-auto sm:ml-0"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
            
            {(hasActiveFilters || !loading) && (
              <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-4">
                <span className="text-sm text-gray-600 font-medium">
                  {filteredJournals.length} {filteredJournals.length === 1 ? 'entry' : 'entries'} found
                </span>
                {hasActiveFilters && (
                  <button 
                    onClick={clearFilters}
                    className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Journal Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Error loading journals</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          ) : filteredJournals.length === 0 ? (
            <div className="text-center py-20 bg-white border border-gray-200 rounded-lg border-dashed">
              <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">No journals found</h3>
              <p className="mt-1 text-sm text-gray-600 max-w-sm mx-auto">
                {hasActiveFilters 
                  ? "We couldn't find any entries matching your current filters. Try adjusting them or clearing your search." 
                  : "You haven't written any journal entries yet. Get started by creating your first one."}
              </p>
              <div className="mt-6 flex justify-center gap-3">
                {hasActiveFilters ? (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    {journals.length > 0 && (
                      <button
                        onClick={handleAnalyzeAll}
                        disabled={isAnalyzingAll}
                        className="inline-flex items-center px-4 py-2 border border-indigo-200 shadow-sm text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                      >
                        {isAnalyzingAll ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Analyze All
                          </>
                        )}
                      </button>
                    )}
                    <Link
                      href="/new"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      New Entry
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredJournals.map((journal) => (
                <Link href={`/journal/${journal.id}`} key={journal.id} className="block group h-full">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 group-hover:shadow-md group-hover:border-indigo-300 transition-all h-full flex flex-col">
                    
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-indigo-700" title={journal.title}>
                        {journal.title}
                      </h3>
                      {journal.aiAnalysis?.mood && (
                        <span className="shrink-0 ml-2 px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-xs font-medium truncate max-w-[80px]" title={journal.aiAnalysis.mood}>
                          {journal.aiAnalysis.mood}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-4 line-clamp-3 flex-1 leading-relaxed">
                      {journal.content}
                    </p>
                    
                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {new Date(journal.createdAt).toLocaleDateString(undefined, { 
                          year: 'numeric', month: 'short', day: 'numeric' 
                        })}
                      </span>
                      {journal.aiAnalysis?.themes && journal.aiAnalysis.themes.length > 0 && (
                        <span className="truncate max-w-[120px]" title={journal.aiAnalysis.themes.join(', ')}>
                          {journal.aiAnalysis.themes[0]} {journal.aiAnalysis.themes.length > 1 && `+${journal.aiAnalysis.themes.length - 1}`}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
