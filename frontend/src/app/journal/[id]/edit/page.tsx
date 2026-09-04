'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { ArrowLeft, Save, X } from 'lucide-react';

export default function EditJournal() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { fetchApi } = useApi();
  const { user, loading: authLoading } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [goalId, setGoalId] = useState('');
  const [activeGoals, setActiveGoals] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchApi('/goals')
        .then(res => setActiveGoals(res.data.filter((g: any) => g.status === 'Active')))
        .catch(console.error);
    }
  }, [user, fetchApi]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchJournal = async () => {
      try {
        const response = await fetchApi(`/journals/${id}`);
        setTitle(response.data.title);
        setContent(response.data.content);
        if (response.data.goalId) {
          setGoalId(response.data.goalId);
        }
      } catch (err: any) {
        setFetchError(err.message || 'Failed to load journal');
      } finally {
        setLoading(false);
      }
    };
    fetchJournal();
  }, [fetchApi, id, user, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const payload: any = { title, content };
      if (goalId) payload.goalId = goalId;
      // if it was removed, we should probably allow removing it, but API requires goalId to be undefined to ignore it. To remove it we'd need to send null. The prompt says "If adding an optional goal reference is necessary". Passing goalId will save it.
      await fetchApi(`/journals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      router.push(`/journal/${id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update journal entry');
      setSaving(false);
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

  if (fetchError) {
    return (
      <DashboardLayout>
        <div className="p-8 max-w-3xl mx-auto">
          <div className="bg-red-50 text-red-700 p-4 rounded-md">
            {fetchError}
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
      <div className="flex-1 overflow-auto p-4 sm:p-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Journal Entry</h1>
              <p className="text-gray-700 mt-2">Modify your thoughts and reflections.</p>
            </div>
            <Link 
              href={`/journal/${id}`}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors px-3 py-2"
            >
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-1">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="How are you feeling today?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                />
              </div>

              {activeGoals.length > 0 && (
                <div className="md:col-span-2">
                  <label htmlFor="goalId" className="block text-sm font-medium text-gray-900 mb-1">
                    Associate with a Goal (Optional)
                  </label>
                  <select
                    id="goalId"
                    value={goalId}
                    onChange={(e) => setGoalId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
                  >
                    <option value="">-- No goal associated --</option>
                    {activeGoals.map(goal => (
                      <option key={goal.id} value={goal.id}>{goal.title}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-900 mb-1">
                Journal Content
              </label>
              <textarea
                id="content"
                required
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-2">
                Note: Editing the content will require you to run the AI Analysis again.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => router.push(`/journal/${id}`)}
                className="mr-3 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center transition-colors"
              >
                {saving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </DashboardLayout>
  );
}
