'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';

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

export default function JournalDetail() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { fetchApi } = useApi();
  const { user, loading: authLoading } = useAuth();
  
  const [journal, setJournal] = useState<Journal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchJournal = async () => {
      try {
        const response = await fetchApi(`/journals/${id}`);
        setJournal(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load journal');
      } finally {
        setLoading(false);
      }
    };
    fetchJournal();
  }, [fetchApi, id, user, authLoading]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const response = await fetchApi(`/journals/${id}/analyze`, { method: 'POST' });
      setJournal((prev) => prev ? { ...prev, aiAnalysis: response.data } : null);
    } catch (err: any) {
      setAnalysisError(err.message || 'Failed to generate AI analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this journal?\n\nThis action cannot be undone. This journal entry will be permanently removed.")) return;
    setIsDeleting(true);
    try {
      await fetchApi(`/journals/${id}`, { method: 'DELETE' });
      router.push('/');
    } catch (err: any) {
      alert(err.message || 'Failed to delete journal');
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    router.push(`/journal/${id}/edit`);
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

  if (error || !journal) {
    return (
      <DashboardLayout>
        <div className="p-8 max-w-4xl mx-auto">
          <div className="bg-red-50 text-red-700 p-4 rounded-md">
            {error || 'Journal not found'}
          </div>
          <Link href="/" className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Journals
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto p-8 bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Journal Content (Left 2 columns) */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Journals
              </Link>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center text-sm text-gray-600 hover:text-indigo-600 transition-colors px-3 py-1.5 border border-gray-200 rounded-md hover:border-indigo-200 bg-white"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center text-sm text-red-600 hover:text-red-700 transition-colors px-3 py-1.5 border border-red-100 rounded-md hover:bg-red-50 bg-white disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
            
            <article>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{journal.title}</h1>
              <time className="text-sm text-gray-500 mb-8 block">
                {new Date(journal.createdAt).toLocaleDateString(undefined, { 
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                })}
              </time>
              
              <div className="prose max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">
                {journal.content}
              </div>
            </article>
          </div>

          {/* AI Analysis Sidebar (Right 1 column) */}
          <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-gray-100 pt-8 lg:pt-0 lg:pl-8">
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-6 sticky top-8">
              <div className="flex items-center gap-2 mb-4 text-indigo-900">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-lg">AI Analysis</h3>
              </div>
              
              {!journal.aiAnalysis ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-600 mb-4">
                    Unlock insights, themes, and emotional analysis for this entry.
                  </p>
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full flex justify-center items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-70 transition-colors"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : 'Analyze Entry'}
                  </button>
                  {analysisError && (
                    <p className="mt-3 text-xs text-red-600 bg-red-50 p-2 rounded">{analysisError}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-6 text-sm">
                  {/* Summary */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Summary</h4>
                    <p className="text-gray-700">{journal.aiAnalysis.summary}</p>
                  </div>
                  
                  {/* Mood */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Detected Mood</h4>
                    <span className="inline-block px-2.5 py-1 bg-white border border-indigo-200 text-indigo-800 rounded-full text-xs font-medium">
                      {journal.aiAnalysis.mood}
                    </span>
                  </div>
                  
                  {/* Themes */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Key Themes</h4>
                    <div className="flex flex-wrap gap-2">
                      {journal.aiAnalysis.themes.map((theme, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Insights */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Insights</h4>
                    <ul className="list-disc pl-4 space-y-1 text-gray-700">
                      {journal.aiAnalysis.insights.map((insight, i) => (
                        <li key={i}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
