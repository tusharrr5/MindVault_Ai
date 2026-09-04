'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { FileText, Printer, Sparkles, TrendingUp, Heart, Target, ShieldAlert, CheckCircle } from 'lucide-react';
import Link from 'next/link';

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

export default function ReportsPage() {
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
        setError(err.message || 'Failed to load report data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchApi, user, authLoading]);

  const handlePrint = () => {
    window.print();
  };

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
        <div className="flex-1 flex items-center justify-center p-8 h-[80vh]">
          <div className="text-center py-16 px-6 bg-white border border-gray-200 rounded-xl border-dashed max-w-lg w-full shadow-sm">
            <FileText className="mx-auto h-12 w-12 text-indigo-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Report Available</h3>
            <p className="text-gray-600 mb-6">
              You need to generate an AI analysis before viewing your report.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto p-4 sm:p-8 bg-gray-50 print:bg-white print:p-0">
        <div className="max-w-4xl mx-auto space-y-8 print:space-y-4">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Comprehensive Report</h1>
              <p className="text-gray-600 mt-1">A detailed breakdown of your psychological and emotional journey.</p>
            </div>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Save as PDF
            </button>
          </div>

          <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-gray-200 print:shadow-none print:border-none print:p-0">
            
            {/* Header / Title (Visible in print) */}
            <div className="text-center mb-10 pb-10 border-b border-gray-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">MindVault AI Analysis Report</h2>
              <p className="text-gray-500">Based on {analysis.totalEntries} journal entries</p>
            </div>

            <div className="space-y-12">
              
              {/* Executive Summary */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-6 h-6 text-indigo-600" />
                  <h3 className="text-xl font-bold text-gray-900">Growth & Progress Summary</h3>
                </div>
                <div className="bg-indigo-50/50 p-6 rounded-xl text-gray-700 leading-relaxed">
                  <p className="mb-4">{analysis.overallGrowth}</p>
                  <p>{analysis.moodChangesOverTime}</p>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Patterns & Themes */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="w-6 h-6 text-emerald-500" />
                    <h3 className="text-xl font-bold text-gray-900">Positive Patterns</h3>
                  </div>
                  <ul className="space-y-3">
                    {analysis.positivePatterns.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldAlert className="w-6 h-6 text-rose-500" />
                    <h3 className="text-xl font-bold text-gray-900">Major Stress Triggers</h3>
                  </div>
                  <ul className="space-y-3">
                    {analysis.stressTriggers.map((t, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-2" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              {/* Dominant Themes */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-6 h-6 text-amber-500" />
                  <h3 className="text-xl font-bold text-gray-900">Recurring Themes</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.emotionalThemes.map((theme, i) => (
                    <span key={i} className="px-4 py-2 bg-amber-50 text-amber-800 rounded-lg text-sm font-medium border border-amber-100">
                      {theme}
                    </span>
                  ))}
                  {analysis.topics.map((topic, i) => (
                    <span key={`t-${i}`} className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium border border-gray-200">
                      {topic}
                    </span>
                  ))}
                </div>
              </section>

              {/* Actionable Recommendations */}
              <section className="print:break-inside-avoid">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-6 h-6 text-indigo-500" />
                  <h3 className="text-xl font-bold text-gray-900">Actionable Recommendations</h3>
                </div>
                <div className="grid gap-4">
                  {analysis.recommendations.map((rec, i) => (
                    <div key={i} className="flex gap-4 p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                      <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold">
                        {i + 1}
                      </div>
                      <p className="text-gray-700 mt-1">{rec}</p>
                    </div>
                  ))}
                </div>
              </section>

            </div>
          </div>
          
        </div>
      </div>
    </DashboardLayout>
  );
}
