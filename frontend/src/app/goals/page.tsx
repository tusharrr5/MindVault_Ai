'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { Target, CheckCircle2, TrendingUp, Sparkles, Plus, Trash2, Edit2, X, Clock, AlertCircle } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High';
  targetDate: string | null;
  progress: number;
  status: 'Not Started' | 'In Progress' | 'Completed';
  linkedJournals?: string[];
  createdAt: string;
  updatedAt: string;
}

interface SuggestedGoal {
  title: string;
  description: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High';
}

interface Journal {
  id: string;
  title: string;
  createdAt: string;
}

export default function GoalsPage() {
  const { fetchApi } = useApi();
  const { user, loading: authLoading } = useAuth();
  
  const [goals, setGoals] = useState<Goal[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestedGoal[]>([]);
  const [recentJournals, setRecentJournals] = useState<Journal[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const suggestionsFetched = useRef(false);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Personal',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    status: 'Not Started' as 'Not Started' | 'In Progress' | 'Completed',
    progress: 0,
    targetDate: '',
    linkedJournals: [] as string[]
  });

  useEffect(() => {
    if (authLoading || !user) return;
    fetchData();
  }, [authLoading, user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [goalsRes, journalsRes] = await Promise.all([
        fetchApi('/goals'),
        fetchApi('/journals')
      ]);
      if (goalsRes.data) setGoals(goalsRes.data);
      if (journalsRes.data) setRecentJournals(journalsRes.data.slice(0, 15)); // top 15 for linking
      
      // Load suggestions asynchronously only once
      if (!suggestionsFetched.current) {
        suggestionsFetched.current = true;
        loadSuggestions();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestions = async () => {
    setLoadingSuggestions(true);
    setSuggestionsError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000); // 22s frontend timeout
    
    try {
      const res = await fetchApi('/goals/suggestions', { 
        method: 'POST',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.data) setSuggestions(res.data);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error(err);
      setSuggestionsError(err.name === 'AbortError' ? 'Request timed out after waiting too long.' : (err.message || 'Failed to load suggestions'));
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleOpenForm = (goal?: Goal) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        title: goal.title,
        description: goal.description || '',
        category: goal.category || 'Personal',
        priority: goal.priority || 'Medium',
        status: goal.status || 'Not Started',
        progress: goal.progress || 0,
        targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString().split('T')[0] : '',
        linkedJournals: goal.linkedJournals || []
      });
    } else {
      setEditingGoal(null);
      setFormData({
        title: '',
        description: '',
        category: 'Personal',
        priority: 'Medium',
        status: 'Not Started',
        progress: 0,
        targetDate: '',
        linkedJournals: []
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingGoal(null);
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        status: formData.status,
        progress: Number(formData.progress),
        targetDate: formData.targetDate || null,
        linkedJournals: formData.linkedJournals
      };

      if (editingGoal) {
        await fetchApi(`/goals/${editingGoal.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await fetchApi('/goals', { method: 'POST', body: JSON.stringify(payload) });
      }
      
      const goalsRes = await fetchApi('/goals');
      if (goalsRes.data) setGoals(goalsRes.data);
      
      handleCloseForm();
    } catch (err: any) {
      alert(err.message || 'Error saving goal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    try {
      await fetchApi(`/goals/${id}`, { method: 'DELETE' });
      setGoals(goals.filter(g => g.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error deleting goal');
    }
  };

  const handleAcceptSuggestion = async (suggestion: SuggestedGoal) => {
    try {
      const payload = {
        title: suggestion.title,
        description: suggestion.description,
        category: suggestion.category,
        priority: suggestion.priority,
        status: 'Not Started',
        progress: 0,
        targetDate: null,
        linkedJournals: []
      };
      await fetchApi('/goals', { method: 'POST', body: JSON.stringify(payload) });
      
      // Remove from suggestions and reload goals
      setSuggestions(suggestions.filter(s => s.title !== suggestion.title));
      const goalsRes = await fetchApi('/goals');
      if (goalsRes.data) setGoals(goalsRes.data);
    } catch (err: any) {
      alert(err.message || 'Error accepting suggestion');
    }
  };

  const toggleLinkedJournal = (journalId: string) => {
    setFormData(prev => ({
      ...prev,
      linkedJournals: prev.linkedJournals.includes(journalId)
        ? prev.linkedJournals.filter(id => id !== journalId)
        : [...prev.linkedJournals, journalId]
    }));
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

  const getPriorityColor = (priority: string) => {
    if (priority === 'High') return 'bg-rose-100 text-rose-800 border-rose-200';
    if (priority === 'Medium') return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  };

  const getStatusColor = (status: string) => {
    if (status === 'Completed') return 'bg-emerald-100 text-emerald-800';
    if (status === 'In Progress') return 'bg-indigo-100 text-indigo-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto p-4 sm:p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Goals</h1>
              <p className="text-gray-600 mt-1">Track your personal growth and turn insights into action.</p>
            </div>
            <button
              onClick={() => handleOpenForm()}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Goal
            </button>
          </div>

          {/* AI Suggestions Section */}
          {suggestionsError && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-6 sm:p-8 flex items-start sm:items-center gap-4 text-red-700 justify-between flex-col sm:flex-row">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-red-900">Failed to load AI suggestions</h3>
                  <p className="text-sm mt-1">{suggestionsError}</p>
                </div>
              </div>
              <button 
                onClick={() => loadSuggestions()}
                className="px-4 py-2 bg-white text-red-700 font-medium text-sm rounded-lg border border-red-200 hover:bg-red-50 transition-colors shadow-sm whitespace-nowrap"
              >
                Try Again
              </button>
            </div>
          )}
          {loadingSuggestions && !suggestionsError && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 sm:p-8 flex justify-center items-center h-32">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
              <span className="ml-3 text-indigo-700 font-medium">Generating personalized goals...</span>
            </div>
          )}
          {!loadingSuggestions && suggestions.length > 0 && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Sparkles className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-indigo-900">AI-Suggested Goals</h2>
                  <p className="text-sm text-indigo-700">Based on your recent journal analysis</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {suggestions.map((suggestion, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-5 shadow-sm border border-indigo-50 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full border ${getPriorityColor(suggestion.priority)}`}>
                        {suggestion.priority} Priority
                      </span>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                        {suggestion.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{suggestion.title}</h3>
                    <p className="text-sm text-gray-600 mb-6 flex-1 line-clamp-3">{suggestion.description}</p>
                    <button
                      onClick={() => handleAcceptSuggestion(suggestion)}
                      className="w-full py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium text-sm rounded-lg transition-colors border border-indigo-100"
                    >
                      Accept Goal
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Goals List */}
          {goals.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 border-dashed p-12 text-center">
              <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Goals Yet</h3>
              <p className="text-gray-500 max-w-sm mx-auto mb-6">Create a new goal manually or accept one of the AI suggestions above to start tracking your progress.</p>
              <button
                onClick={() => handleOpenForm()}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4 mr-2" /> Create First Goal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {goals.map(goal => (
                <div key={goal.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col group hover:shadow-md transition-shadow">
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-wrap gap-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusColor(goal.status)}`}>
                        {goal.status}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getPriorityColor(goal.priority)}`}>
                        {goal.priority}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenForm(goal)} className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-md hover:bg-gray-50">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteGoal(goal.id)} className="p-1.5 text-gray-400 hover:text-rose-600 rounded-md hover:bg-gray-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">{goal.title}</h3>
                  <p className="text-gray-600 text-sm mb-6 flex-1 line-clamp-3">{goal.description}</p>

                  <div className="mt-auto space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm font-medium mb-1.5">
                        <span className="text-gray-700">Progress</span>
                        <span className="text-indigo-600">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full transition-all duration-500 ${goal.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : 'No Target Date'}</span>
                      </div>
                      {goal.linkedJournals && goal.linkedJournals.length > 0 && (
                        <div className="font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {goal.linkedJournals.length} Linked Journal{goal.linkedJournals.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Goal Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
              </h2>
              <button onClick={handleCloseForm} className="text-gray-400 hover:text-gray-600 p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  placeholder="e.g. Meditate daily for 10 minutes"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 resize-none"
                  placeholder="Why is this goal important to you?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    placeholder="e.g. Mental Health"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Target Date</label>
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={e => setFormData({ ...formData, targetDate: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-gray-900">Progress</label>
                  <span className="text-sm font-medium text-indigo-600">{formData.progress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={e => setFormData({ ...formData, progress: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {recentJournals.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Linked Journals</label>
                  <div className="max-h-32 overflow-y-auto bg-gray-50 border border-gray-200 rounded-xl p-2 space-y-1">
                    {recentJournals.map(journal => (
                      <label key={journal.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors border border-transparent hover:border-gray-200">
                        <input
                          type="checkbox"
                          checked={formData.linkedJournals.includes(journal.id)}
                          onChange={() => toggleLinkedJournal(journal.id)}
                          className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium text-gray-900 truncate">{journal.title}</span>
                          <span className="text-xs text-gray-500">{new Date(journal.createdAt).toLocaleDateString()}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={handleCloseForm} 
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : (editingGoal ? 'Update Goal' : 'Create Goal')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
