'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { Lightbulb, TrendingUp, Sparkles, Heart, Target, AlertTriangle, ArrowRight, BrainCircuit, LineChart, CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';

interface ComprehensiveAnalysis {
  totalEntries: number;
  primaryMood: string;
  moodDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  emotionalThemes: string[];
  topics: string[];
  stressTriggers: string[];
  positivePatterns: string[];
  behavioralPatterns: string[];
  moodChangesOverTime: string;
  overallGrowth: string;
  recommendations: string[];
}

export default function DeepInsightsPage() {
  const router = useRouter();
  const { fetchApi } = useApi();
  const { user, loading: authLoading } = useAuth();
  const [aiInsights, setAiInsights] = useState<ComprehensiveAnalysis | null>(null);
  const [currentJournalCount, setCurrentJournalCount] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchData = async () => {
      try {
        const [analysisRes, countRes] = await Promise.all([
          fetchApi('/journals/insights', { method: 'GET' }),
          fetchApi('/journals/count', { method: 'GET' })
        ]);
        
        if (analysisRes.data && analysisRes.data.analysis) {
          setAiInsights(analysisRes.data.analysis);
        }
        if (countRes.data && typeof countRes.data.count === 'number') {
          setCurrentJournalCount(countRes.data.count);
        }
      } catch (e) {
        console.error("Failed to fetch data", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchApi, authLoading, user]);

  const handleUpdateAnalysis = async () => {
    setIsUpdating(true);
    try {
      const response = await fetchApi('/journals/insights', { method: 'POST' });
      if (response.data && response.data.analysis) {
        setAiInsights(response.data.analysis);
        setCurrentJournalCount(response.data.totalEntries);
      }
    } catch (e) {
      console.error("Failed to update analysis", e);
    } finally {
      setIsUpdating(false);
    }
  };

  const isStale = currentJournalCount !== null && aiInsights !== null && currentJournalCount > aiInsights.totalEntries;
  const newEntries = currentJournalCount !== null && aiInsights !== null ? currentJournalCount - aiInsights.totalEntries : 0;

  if (loading || authLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!aiInsights) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex items-center justify-center p-8 h-[80vh]">
          <div className="text-center py-16 px-6 bg-white border border-gray-200 rounded-xl border-dashed max-w-lg w-full shadow-sm">
            <Sparkles className="mx-auto h-12 w-12 text-indigo-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Analysis Available</h3>
            <p className="text-gray-600 mb-6">
              Go back to your dashboard and click &quot;Analyze All Journals&quot; to generate deep insights about your entire journal history.
            </p>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="py-6 sm:py-10">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BrainCircuit className="w-8 h-8 text-indigo-600" />
              Comprehensive AI Insights
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <p className="text-sm text-gray-600 bg-indigo-50 text-indigo-700 inline-flex items-center px-3 py-1.5 rounded-full font-medium">
                Based on {aiInsights.totalEntries} journal entries
              </p>

              {isStale && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 border border-amber-200">
                    <AlertTriangle className="w-4 h-4" />
                    {newEntries} new {newEntries === 1 ? 'entry' : 'entries'} since last analysis
                  </span>
                  <button
                    onClick={handleUpdateAnalysis}
                    disabled={isUpdating}
                    className="text-sm text-indigo-600 bg-white border border-indigo-200 px-3 py-1.5 rounded-full font-medium hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {isUpdating ? 'Updating...' : 'Update Analysis'}
                  </button>
                </div>
              )}

              {!isStale && currentJournalCount !== null && (
                <span className="text-sm text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5 border border-emerald-200">
                  <CheckCircle className="w-4 h-4" />
                  Analysis up to date
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Stats & Distribution */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Emotional Overview */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-6">
                  <Heart className="w-5 h-5 text-rose-500" />
                  <h3 className="text-lg font-bold text-gray-900">Emotional Overview</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Analyzed</span>
                    <span className="font-semibold text-gray-900">{aiInsights.totalEntries}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Primary Mood</span>
                    <span className="font-semibold text-gray-900 capitalize">{aiInsights.primaryMood}</span>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-600 block mb-2">Mood Distribution</span>
                    <div className="flex h-3 rounded-full overflow-hidden">
                      <div className="bg-emerald-400" style={{ width: `${aiInsights.moodDistribution.positive}%` }} title="Positive"></div>
                      <div className="bg-gray-300" style={{ width: `${aiInsights.moodDistribution.neutral}%` }} title="Neutral"></div>
                      <div className="bg-rose-400" style={{ width: `${aiInsights.moodDistribution.negative}%` }} title="Negative"></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span className="text-emerald-600 font-medium">{aiInsights.moodDistribution.positive}% Pos</span>
                      <span className="text-gray-500 font-medium">{aiInsights.moodDistribution.neutral}% Neu</span>
                      <span className="text-rose-500 font-medium">{aiInsights.moodDistribution.negative}% Neg</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recurring Themes */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-lg font-bold text-gray-900">Recurring Themes</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {aiInsights.emotionalThemes?.map((theme, idx) => (
                    <div key={`theme-${idx}`} className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center">
                      <span className="text-sm text-indigo-800">{theme}</span>
                    </div>
                  ))}
                  {aiInsights.topics?.map((topic, idx) => (
                    <div key={`topic-${idx}`} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg flex items-center">
                      <span className="text-sm text-gray-800">{topic}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stress Triggers */}
              {aiInsights.stressTriggers?.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-rose-100">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                    <h3 className="text-lg font-bold text-gray-900">Stress Triggers</h3>
                  </div>
                  <ul className="space-y-2">
                    {aiInsights.stressTriggers.map((trigger, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="mt-1 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-rose-400" />
                        {trigger}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

            {/* Right Column: AI Deep Dive */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* High-level AI Insights */}
              <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 p-6 sm:p-8 rounded-xl shadow-md text-white relative overflow-hidden">
                <Sparkles className="absolute top-0 right-0 w-32 h-32 text-white/5 -mt-6 -mr-6" />
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Lightbulb className="w-6 h-6 text-indigo-300" />
                    Behavioral & Growth Analysis
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-indigo-200 text-sm font-semibold uppercase tracking-wider mb-2">Behavioral Patterns</h4>
                      <ul className="space-y-2 mb-4">
                        {aiInsights.behavioralPatterns?.map((pattern, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-indigo-50">
                            <ArrowRight className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                            {pattern}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="bg-white/10 p-5 rounded-lg border border-white/10">
                      <h4 className="text-emerald-300 text-sm font-semibold uppercase tracking-wider mb-2">Growth & Trajectory</h4>
                      <p className="text-indigo-50 leading-relaxed text-sm">{aiInsights.overallGrowth}</p>
                      
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <h5 className="text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-2">Positive Patterns</h5>
                        <ul className="space-y-1">
                          {aiInsights.positivePatterns?.map((pattern, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-indigo-100">
                              <span className="mt-1.5 flex-shrink-0 w-1 h-1 rounded-full bg-emerald-400" />
                              {pattern}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mood Changes Over Time */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <LineChart className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-lg font-bold text-gray-900">Mood Changes Over Time</h3>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {aiInsights.moodChangesOverTime}
                </p>
              </div>

              {/* Actionable Recommendations */}
              <div className="bg-emerald-50 p-6 rounded-xl shadow-sm border border-emerald-100">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-bold text-gray-900">Actionable Recommendations</h3>
                </div>
                <ul className="space-y-3">
                  {aiInsights.recommendations?.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-3 bg-white p-3 rounded-lg border border-emerald-100/50 shadow-sm">
                      <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-gray-700 mt-0.5">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
