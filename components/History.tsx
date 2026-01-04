
import React, { useState } from 'react';
import { Client, Note } from '../types';
import { summarizeNotes } from '../services/geminiService';

interface HistoryProps {
  client: Client;
  notes: Note[];
  onDeleteNote: (id: string) => void;
}

const History: React.FC<HistoryProps> = ({ client, notes, onDeleteNote }) => {
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ranges = [
    { label: 'Last Session', value: 'last_session' },
    { label: 'Last Month', value: 'last_month' },
    { label: '3 Months', value: '3_months' },
    { label: 'All Time', value: 'all' },
  ];

  const handleSummarize = async (range: string) => {
    if (notes.length === 0) {
      setError("No notes found to summarize.");
      return;
    }

    setIsSummarizing(true);
    setError(null);
    setSummary(null);
    setShowSummaryModal(true);

    try {
      // Filter notes based on range (simplified logic for prototype)
      let filteredNotes = notes;
      const now = Date.now();
      const monthMs = 30 * 24 * 60 * 60 * 1000;

      if (range === 'last_session') {
        filteredNotes = notes.length > 0 ? [notes[0]] : [];
      } else if (range === 'last_month') {
        filteredNotes = notes.filter(n => now - n.timestamp < monthMs);
      } else if (range === '3_months') {
        filteredNotes = notes.filter(n => now - n.timestamp < (monthMs * 3));
      }

      const result = await summarizeNotes(filteredNotes, range);
      setSummary(result);
    } catch (err) {
      setError("Failed to generate summary. Please try again.");
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="p-6 space-y-8 animate-fadeIn">
      {/* Sessions Summary Tool */}
      <section className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <i className="fas fa-robot"></i>
          </div>
          <div>
            <h3 className="font-bold text-lg">AI Reflection</h3>
            <p className="text-xs text-indigo-100">Summarize your growth journey</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {ranges.map(range => (
            <button
              key={range.value}
              onClick={() => handleSummarize(range.label)}
              className="bg-white/10 hover:bg-white/20 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all border border-white/10 active:scale-95"
            >
              {range.label}
            </button>
          ))}
        </div>
      </section>

      {/* Timeline of Notes */}
      <section className="space-y-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <i className="fas fa-stream text-indigo-400"></i>
          Session History
        </h3>

        <div className="relative border-l-2 border-indigo-100 ml-4 pl-8 space-y-8">
          {/* Mock Session marker for "Next" */}
          <div className="relative">
            <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-indigo-500 border-4 border-white shadow-sm ring-2 ring-indigo-50"></div>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">Upcoming Session</p>
            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 border-dashed">
              <p className="text-sm font-bold text-indigo-800">{client.nextSession}</p>
            </div>
          </div>

          {notes.length > 0 ? (
            notes.map((note, idx) => (
              <div key={note.id} className="relative animate-fadeIn" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-white border-4 border-indigo-100 shadow-sm"></div>
                <div className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm relative group">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      {new Date(note.timestamp).toLocaleDateString()} at {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <button 
                      onClick={() => onDeleteNote(note.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <i className="fas fa-trash-alt text-[10px]"></i>
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">
                    {note.text}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-10 text-center">
              <p className="text-gray-400 text-sm italic">No reflections recorded yet.</p>
            </div>
          )}

          {/* Last Session marker */}
          <div className="relative opacity-60">
             <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-gray-200 border-4 border-white"></div>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Previous Session</p>
             <p className="text-sm font-bold text-gray-600">{client.lastSession}</p>
          </div>
        </div>
      </section>

      {/* Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl space-y-6 animate-slideUp">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-xl text-gray-900">AI Reflection</h4>
              <button onClick={() => setShowSummaryModal(false)} className="text-gray-400">
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>

            <div className="min-h-[200px] bg-indigo-50/30 rounded-3xl p-6 overflow-y-auto max-h-[60vh]">
              {isSummarizing ? (
                <div className="flex flex-col items-center justify-center h-40 space-y-4">
                  <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
                  <p className="text-sm text-indigo-600 font-bold animate-pulse">Reading your notes...</p>
                </div>
              ) : error ? (
                <p className="text-red-500 text-sm text-center">{error}</p>
              ) : (
                <div className="prose prose-sm text-gray-700 leading-relaxed whitespace-pre-line font-medium">
                  {summary}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowSummaryModal(false)}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
