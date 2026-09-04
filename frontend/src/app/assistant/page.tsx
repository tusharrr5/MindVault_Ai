'use client';

import { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useApi } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { Bot, Send, Sparkles, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const SUGGESTED_QUESTIONS = [
  "What has been making me happy recently?",
  "Why have I been feeling tired lately?",
  "What patterns do you notice in my journals?",
  "How has my mood changed recently?",
  "What have I been worried about?",
  "Give me some suggestions based on my recent journal entries."
];

export default function AIAssistant() {
  const { fetchApi } = useApi();
  const { user, loading: authLoading } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent, customQuestion?: string) => {
    if (e) e.preventDefault();
    
    const question = customQuestion || inputValue;
    if (!question.trim() || isLoading) return;

    const newMessages = [...messages, { role: 'user', text: question } as Message];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchApi('/journals/assistant', {
        method: 'POST',
        body: JSON.stringify({
          message: question,
          history: messages // Pass existing context history
        }),
      });
      
      setMessages([...newMessages, { role: 'model', text: response.data.response }]);
    } catch (err: any) {
      setError(err.message || 'Failed to communicate with AI Assistant');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
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
      <div className="flex flex-col h-full bg-white relative">
        
        {/* Header */}
        <div className="flex-none p-4 sm:p-6 border-b border-gray-100 bg-white z-10 sticky top-0 shadow-sm">
          <div className="flex items-center gap-3 max-w-4xl mx-auto w-full">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Bot className="w-6 h-6 text-indigo-700" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Personal AI Assistant</h1>
              <p className="text-sm text-gray-500">Ask questions about your journal history</p>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50">
          <div className="max-w-4xl mx-auto space-y-6 pb-20">
            
            {messages.length === 0 ? (
              <div className="text-center py-10 px-4">
                <Sparkles className="mx-auto h-12 w-12 text-indigo-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Hello, {user?.email?.split('@')[0] || 'there'}!</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  I'm your personal MindVault AI Assistant. I have secure access to your journal entries and can help you uncover patterns, track moods, and gain deeper self-awareness.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto text-left">
                  {SUGGESTED_QUESTIONS.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSubmit(undefined, q)}
                      className="p-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all text-left flex items-start gap-2"
                    >
                      <span className="text-indigo-400 mt-0.5">•</span>
                      <span>{q}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'model' && (
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 border border-indigo-200">
                        <Bot className="w-4 h-4 text-indigo-700" />
                      </div>
                    )}
                    
                    <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-sm' 
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                    }`}>
                      <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
                        {msg.text}
                      </div>
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 border border-gray-300">
                        <UserIcon className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-4 justify-start">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 border border-indigo-200">
                      <Bot className="w-4 h-4 text-indigo-700" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-5 py-4 shadow-sm flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="text-red-700 hover:underline">Dismiss</button>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="flex-none p-4 sm:p-6 bg-white border-t border-gray-200">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-3 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything about your journals..."
              className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-full focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-5 pr-12 py-3.5 shadow-sm transition-colors"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-indigo-600 text-white rounded-full hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
          <div className="text-center mt-3">
            <p className="text-xs text-gray-500">
              AI answers are based securely on your personal journal history.
            </p>
          </div>
        </div>
        
      </div>
    </DashboardLayout>
  );
}
