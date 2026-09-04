'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Sparkles, TrendingUp, Hash, Activity, FileText } from 'lucide-react';

interface AIAnalysis {
  summary: string;
  mood: string;
  themes: string[];
  insights: string[];
}

interface Journal {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  aiAnalysis?: AIAnalysis;
}

export default function MoodDashboard() {
  const { fetchApi } = useApi();
  const { user, loading: authLoading } = useAuth();
  
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError(err.message || 'Failed to load journal data');
      } finally {
        setLoading(false);
      }
    };
    loadJournals();
  }, [fetchApi, user, authLoading]);

  // Aggregate Data
  const analyzedJournals = journals.filter(j => j.aiAnalysis && j.aiAnalysis.mood);
  
  const getPolarity = (mood: string) => {
    const m = mood.toLowerCase();
    const pos = ['happy', 'joy', 'excited', 'hope', 'calm', 'relax', 'great', 'good', 'peace', 'grateful', 'content', 'optimistic'];
    const neg = ['sad', 'anxious', 'angry', 'frustrat', 'tired', 'stress', 'worried', 'bad', 'depress', 'overwhelm', 'fear'];
    if (pos.some(p => m.includes(p))) return 'positive';
    if (neg.some(n => m.includes(n))) return 'negative';
    return 'neutral';
  };

  // Tally moods
  const moodTally: Record<string, number> = {};
  const polarityTally = { positive: 0, neutral: 0, negative: 0 };

  analyzedJournals.forEach(j => {
    const m = j.aiAnalysis!.mood;
    moodTally[m] = (moodTally[m] || 0) + 1;
    polarityTally[getPolarity(m)] += 1;
  });

  const totalAnalyzed = analyzedJournals.length;
  const uniqueMoods = Object.keys(moodTally).length;
  
  // Sort moods by frequency
  const sortedMoods = Object.entries(moodTally).sort((a, b) => b[1] - a[1]);
  const mostCommonMood = sortedMoods.length > 0 ? sortedMoods[0][0] : 'None yet';
  const recentMood = analyzedJournals.length > 0 ? analyzedJournals[0].aiAnalysis!.mood : 'None yet';

  // Aggregate recent insights
  const recentInsights: string[] = [];
  analyzedJournals.slice(0, 5).forEach(j => {
    if (j.aiAnalysis?.insights) {
      recentInsights.push(...j.aiAnalysis.insights);
    }
  });

  // Limit to top 5 insights for the dashboard display
  const displayInsights = recentInsights.slice(0, 5);

  if (loading || authLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="bg-red-50 text-red-700 p-4 rounded-md">
            {error}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (journals.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center py-16 px-6 bg-white border border-gray-200 rounded-xl border-dashed max-w-lg w-full">
            <Activity className="mx-auto h-12 w-12 text-indigo-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No data yet</h3>
            <p className="text-gray-600 mb-6">
              Your mood dashboard will appear here after you create your first journal entry. 
              Start journaling to unlock your AI emotional analytics!
            </p>
            <Link
              href="/new"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Write Your First Journal
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto p-4 sm:p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mood Dashboard</h1>
              <p className="text-gray-600 mt-1">Analytics and insights across all your journal entries.</p>
            </div>
            {analyzedJournals.length === 0 && (
              <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                Needs Analysis
              </span>
            )}
          </div>

          {analyzedJournals.length === 0 ? (
             <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
               <Sparkles className="mx-auto h-10 w-10 text-indigo-400 mb-3" />
               <h3 className="text-lg font-semibold text-gray-900 mb-1">Unlock Your Mood Analytics</h3>
               <p className="text-gray-600 mb-5 max-w-md mx-auto">
                 You have journal entries, but none have been analyzed by the AI yet. Go to your journals and click &quot;Analyze Entry&quot; to generate your dashboard!
               </p>
               <Link
                 href="/"
                 className="inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
               >
                 Go to My Journals
               </Link>
             </div>
          ) : (
            <>
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-500">Total Entries</h3>
                    <FileText className="w-5 h-5 text-indigo-500" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{journals.length}</p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-500">Most Common Mood</h3>
                    <TrendingUp className="w-5 h-5 text-indigo-500" />
                  </div>
                  <p className="text-xl font-bold text-gray-900 truncate" title={mostCommonMood}>
                    {mostCommonMood}
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-500">Recent Mood</h3>
                    <Activity className="w-5 h-5 text-indigo-500" />
                  </div>
                  <p className="text-xl font-bold text-gray-900 truncate" title={recentMood}>
                    {recentMood}
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-500">Mood Variations</h3>
                    <Hash className="w-5 h-5 text-indigo-500" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{uniqueMoods}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Mood Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Mood Distribution</h3>
                  <div className="space-y-5">
                    {sortedMoods.map(([mood, count]) => {
                      const percentage = Math.round((count / totalAnalyzed) * 100);
                      return (
                        <div key={mood}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-800">{mood}</span>
                            <span className="text-gray-600 font-medium">{percentage}% ({count})</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            <div 
                              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mood Over Time & Insights */}
                <div className="space-y-8">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Overall Polarity</h3>
                    <div className="flex items-center gap-2 mb-6 h-4 w-full rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full transition-all" style={{ width: `${(polarityTally.positive / totalAnalyzed) * 100 || 0}%` }}></div>
                      <div className="bg-gray-300 h-full transition-all" style={{ width: `${(polarityTally.neutral / totalAnalyzed) * 100 || 0}%` }}></div>
                      <div className="bg-rose-500 h-full transition-all" style={{ width: `${(polarityTally.negative / totalAnalyzed) * 100 || 0}%` }}></div>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="text-gray-700">Positive ({polarityTally.positive})</span></div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-300"></div><span className="text-gray-700">Neutral ({polarityTally.neutral})</span></div>
                      <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500"></div><span className="text-gray-700">Negative ({polarityTally.negative})</span></div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Mood Over Time</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                      {analyzedJournals.map(j => (
                        <Link href={`/journal/${j.id}`} key={j.id} className="block group">
                          <div className="flex items-center justify-between border border-gray-100 p-3 rounded-lg hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors">
                            <div className="flex flex-col min-w-0 mr-4">
                              <span className="text-gray-900 font-medium truncate group-hover:text-indigo-700">{j.title}</span>
                              <span className="text-gray-500 text-xs">
                                {new Date(j.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                            <span className="px-3 py-1 bg-white border border-indigo-100 text-indigo-700 rounded-full text-xs font-semibold shrink-0">
                              {j.aiAnalysis!.mood}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-lg font-bold text-indigo-950">Recent Insights</h3>
                    </div>
                    {displayInsights.length > 0 ? (
                      <ul className="space-y-3">
                        {displayInsights.map((insight, i) => (
                          <li key={i} className="flex gap-3 text-sm text-gray-800 bg-white p-3 rounded-lg shadow-sm border border-indigo-50/50 leading-relaxed">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5"></div>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-600">No insights discovered yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
          
        </div>
      </div>
    </DashboardLayout>
  );
}
