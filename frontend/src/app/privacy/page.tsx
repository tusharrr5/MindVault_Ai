'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Shield, Database, Brain, Download, Trash2, FileText, ChevronRight, AlertTriangle } from 'lucide-react';

interface Journal {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  aiAnalysis?: any;
}

export default function PrivacyCenter() {
  const { fetchApi } = useApi();
  const { user, loading: authLoading } = useAuth();
  
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const [exportMessage, setExportMessage] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    fetchApi('/journals')
      .then(res => setJournals(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [fetchApi, user, authLoading]);

  // Compute stats
  const totalJournals = journals.length;
  const approxSizeKB = Math.round(JSON.stringify(journals).length / 1024);
  
  const sortedDates = journals.map(j => new Date(j.createdAt).getTime()).sort((a,b) => a - b);
  const oldestEntry = sortedDates.length > 0 ? new Date(sortedDates[0]).toLocaleDateString() : 'N/A';
  const newestEntry = sortedDates.length > 0 ? new Date(sortedDates[sortedDates.length - 1]).toLocaleDateString() : 'N/A';

  const handleExportJSON = () => {
    try {
      const dataStr = JSON.stringify(journals, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `mindvault-journals-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      setExportMessage('Your journal data has been exported successfully.');
      setTimeout(() => setExportMessage(null), 5000);
    } catch (e) {
      alert("Failed to export JSON");
    }
  };

  const handleExportCSV = () => {
    try {
      if (journals.length === 0) return;
      
      // Basic CSV generation
      const headers = ['ID', 'Title', 'Content', 'Created At', 'Updated At', 'AI Mood'];
      
      const rows = journals.map(j => {
        const escapeCell = (val: string) => `"${val.replace(/"/g, '""')}"`;
        return [
          j.id,
          escapeCell(j.title || ''),
          escapeCell(j.content || ''),
          j.createdAt,
          j.updatedAt,
          j.aiAnalysis?.mood || ''
        ].join(',');
      });
      
      const csvContent = [headers.join(','), ...rows].join('\n');
      const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
      const exportFileDefaultName = `mindvault-journals-${new Date().toISOString().split('T')[0]}.csv`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      setExportMessage('Your journal data has been exported successfully.');
      setTimeout(() => setExportMessage(null), 5000);
    } catch (e) {
      alert("Failed to export CSV");
    }
  };

  const handleDeleteAll = async () => {
    if (deleteConfirmation !== 'DELETE') return;
    
    setIsDeleting(true);
    setDeleteError(null);
    setDeleteSuccess(false);
    
    try {
      await fetchApi('/journals/all', { method: 'DELETE' });
      setJournals([]);
      setDeleteSuccess(true);
      setDeleteConfirmation('');
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete journals.');
    } finally {
      setIsDeleting(false);
    }
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

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto p-4 sm:p-8 bg-gray-50 flex flex-col justify-between">
        <div className="max-w-6xl mx-auto w-full space-y-8 pb-12">
          
          {/* 1. Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Shield className="w-8 h-8 text-indigo-600" />
              Privacy Center
            </h1>
            <p className="text-gray-600 mt-2 max-w-2xl text-lg">
              Control your data, understand how MindVault AI uses it, and manage your journal privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: Data Info & Explanations */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* 2. Your Data Card */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Database className="w-6 h-6 text-indigo-500" /> Your Data
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <span className="text-sm text-gray-500 font-medium">Journal Entries</span>
                    <div className="mt-2 text-3xl font-black text-gray-900">{totalJournals}</div>
                  </div>
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <span className="text-sm text-gray-500 font-medium">Approx. Data Size</span>
                    <div className="mt-2 text-3xl font-black text-gray-900">{approxSizeKB} KB</div>
                  </div>
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <span className="text-sm text-gray-500 font-medium">Oldest Entry</span>
                    <div className="mt-2 text-lg font-bold text-indigo-600 truncate">{oldestEntry}</div>
                  </div>
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <span className="text-sm text-gray-500 font-medium">Newest Entry</span>
                    <div className="mt-2 text-lg font-bold text-indigo-600 truncate">{newestEntry}</div>
                  </div>
                </div>
              </div>

              {/* 3. How Your Data Is Stored */}
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                  <Database className="w-5 h-5 text-indigo-500" /> How Your Data Is Stored
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Firebase Authentication</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Manages account identity and secure sign-in. Your identity is verified on every request.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Cloud Firestore</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Stores journals, goals, reflections, and app data securely in the cloud.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">User Isolation</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      User data is strictly linked to the authenticated account and protected from other users via Firestore Security Rules. The application only requests the authenticated user's data.
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. How AI Analysis Works */}
              <div className="bg-indigo-50 rounded-xl p-6 sm:p-8 shadow-sm border border-indigo-100">
                <h2 className="text-lg font-bold text-indigo-900 mb-6 flex items-center gap-2 border-b border-indigo-200/50 pb-4">
                  <Brain className="w-5 h-5 text-indigo-600" /> How AI Analysis Works
                </h2>
                
                <div className="space-y-4">
                  <p className="text-sm text-indigo-900 leading-relaxed">
                    MindVault AI uses Google Gemini to generate insights. Data is carefully minimized before analysis.
                  </p>
                  
                  <ul className="text-sm text-indigo-800 space-y-3 list-disc pl-5 opacity-90">
                    <li>Relevant journal content/metadata is sent <strong>only</strong> when an AI feature requires it (e.g., clicking &quot;Analyze Entry&quot; or viewing the Reports page).</li>
                    <li>Account credentials, passwords, and user identities are <strong>not</strong> sent to Gemini.</li>
                    <li>Gemini requests are handled safely through our secure backend server.</li>
                    <li>API credentials remain server-side and are never exposed to the frontend.</li>
                  </ul>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Controls & Danger Zone */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* 5. Data Controls */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Export My Journals</h2>
                <p className="text-sm text-gray-500 mb-6">Download all your journals in your preferred format.</p>
                
                {exportMessage && (
                  <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 rounded-md text-sm border border-emerald-200 font-medium">
                    {exportMessage}
                  </div>
                )}

                <div className="space-y-3">
                  <button 
                    onClick={handleExportJSON}
                    disabled={journals.length === 0}
                    className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:bg-white group"
                  >
                    <div className="flex items-center gap-2 font-semibold text-gray-900 group-hover:text-indigo-700">
                      <Download className="w-4 h-4" /> Download as JSON
                    </div>
                    <div className="text-xs text-gray-500 mt-1 ml-6">For backup and portability</div>
                  </button>

                  <button 
                    onClick={handleExportCSV}
                    disabled={journals.length === 0}
                    className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:bg-white group"
                  >
                    <div className="flex items-center gap-2 font-semibold text-gray-900 group-hover:text-indigo-700">
                      <Download className="w-4 h-4" /> Download as CSV
                    </div>
                    <div className="text-xs text-gray-500 mt-1 ml-6">For spreadsheets</div>
                  </button>
                </div>
              </div>

              {/* 6. Danger Zone */}
              <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-red-200">
                <h2 className="text-lg font-bold text-red-700 mb-1 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Danger Zone
                </h2>
                <p className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-6">Irreversible actions</p>
                
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 mb-1">Delete All Journal Data</h3>
                  <p className="text-sm text-gray-700 font-medium">
                    This will permanently delete ALL your journals. This action cannot be undone.
                  </p>
                </div>
                
                {deleteSuccess && (
                  <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 font-medium rounded-md text-sm border border-emerald-200">
                    All journal data has been deleted.
                  </div>
                )}
                
                {deleteError && (
                  <div className="mb-4 p-3 bg-red-50 text-red-800 font-medium rounded-md text-sm border border-red-200">
                    {deleteError}
                  </div>
                )}

                <div className="bg-red-50 p-4 rounded-lg border border-red-200 space-y-4">
                  <label className="block text-sm font-bold text-red-900 leading-relaxed">
                    Type <span className="font-mono bg-red-200 px-1.5 py-0.5 rounded text-red-900">DELETE</span> below to confirm:
                  </label>
                  <input 
                    type="text" 
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="DELETE"
                    className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 font-medium placeholder-gray-500 bg-white"
                  />
                  <button 
                    onClick={handleDeleteAll}
                    disabled={deleteConfirmation !== 'DELETE' || isDeleting}
                    className="w-full flex justify-center items-center px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isDeleting ? 'Deleting...' : 'Delete All Journals'}
                  </button>
                </div>
              </div>

              {/* 7. Privacy Policy */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col">
                <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-500" /> Privacy Policy
                </h2>
                <p className="text-sm text-gray-600 mb-5">
                  Read our full technical privacy policy to understand all details.
                </p>
                <Link href="/privacy-policy" className="inline-flex justify-center items-center px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors">
                  Read Privacy Policy <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

            </div>

          </div>
        </div>

        {/* 8. Footer */}
        <div className="mt-8 pt-8 pb-4 text-center border-t border-gray-200">
          <p className="text-sm font-medium text-gray-400">
            MindVault AI &bull; Your thoughts. Your growth. Your vault.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
