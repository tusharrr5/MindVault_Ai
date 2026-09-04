'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Sun, Heart, Target, Sparkles, ArrowRight } from 'lucide-react';

interface ComprehensiveAnalysis {
  overallGrowth: string;
  positivePatterns: string[];
  behavioralPatterns: string[];
  stressTriggers?: string[];
  recommendations: string[];
}

export default function DailyReflection() {
  const { fetchApi } = useApi();
  const { user, loading: authLoading } = useAuth();
  
  const [analysis, setAnalysis] = useState<ComprehensiveAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;

    const loadData = async () => {
      try {
        const response = await fetchApi('/journals/insights');
        if (response.data && response.data.analysis) {
          setAnalysis(response.data.analysis);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load reflection data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchApi, user, authLoading]);

  if (loading || authLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!analysis) {
    return (
      <DashboardLayout>
        <div className="flex-1 overflow-auto p-4 sm:p-8 bg-gray-50">
          <div className="max-w-3xl mx-auto text-center py-20">
            <Sun className="mx-auto h-16 w-16 text-indigo-300 mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Daily Reflection</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Your daily reflection is generated based on your complete journal history. Please analyze your journals first to unlock this feature.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const appreciate = analysis.positivePatterns[0] || "Your consistent effort to track your days and emotions.";
  const focus = analysis.behavioralPatterns[0] || analysis.stressTriggers?.[0] || "Maintaining a balanced perspective amidst daily challenges.";
  const actionable = analysis.recommendations[0] || "Take five minutes today to breathe deeply and reset your focus.";

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto p-4 sm:p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Daily Reflection</h1>
            <p className="text-gray-600 mt-1">Your AI-curated moments for mindfulness and growth.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-8 sm:p-10 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Sun className="w-8 h-8 text-indigo-200" />
                <h2 className="text-2xl font-bold">Today&apos;s Reflection</h2>
              </div>
              <p className="text-lg leading-relaxed text-indigo-50 font-medium">
                {analysis.overallGrowth}
              </p>
            </div>
            
            <div className="p-8 sm:p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Appreciate */}
                <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
                  <div className="flex items-center gap-3 mb-3">
                    <Heart className="w-6 h-6 text-emerald-600" />
                    <h3 className="text-lg font-bold text-emerald-900">One thing to appreciate</h3>
                  </div>
                  <p className="text-emerald-800">{appreciate}</p>
                </div>

                {/* Focus */}
                <div className="bg-amber-50 rounded-xl p-6 border border-amber-100">
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="w-6 h-6 text-amber-600" />
                    <h3 className="text-lg font-bold text-amber-900">One thing to focus on</h3>
                  </div>
                  <p className="text-amber-800">{focus}</p>
                </div>

              </div>

              {/* Actionable Suggestion */}
              <div className="bg-indigo-50 rounded-xl p-6 sm:p-8 border border-indigo-100 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                <div className="w-16 h-16 shrink-0 bg-indigo-200 rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-indigo-900 mb-2">Short Actionable Suggestion</h3>
                  <p className="text-indigo-800 text-lg">{actionable}</p>
                </div>
              </div>

              <div className="pt-4 flex justify-center">
                <Link
                  href="/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Write a new journal entry <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
