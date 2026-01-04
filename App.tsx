
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import History from './components/History';
import { MOCK_CLIENTS } from './constants';
import { Client, AppTab, Note } from './types';

const App: React.FC = () => {
  const [code, setCode] = useState('');
  const [activeClient, setActiveClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<AppTab>('today');
  const [error, setError] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const savedCode = localStorage.getItem('therapy_client_code');
    if (savedCode) {
      const client = MOCK_CLIENTS.find(c => c.code === savedCode);
      if (client) {
        setActiveClient(client);
        // Load notes for this specific client
        const savedNotes = localStorage.getItem(`spring_notes_${client.id}`);
        if (savedNotes) setNotes(JSON.parse(savedNotes));
      }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const client = MOCK_CLIENTS.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (client) {
      setActiveClient(client);
      localStorage.setItem('therapy_client_code', client.code);
      const savedNotes = localStorage.getItem(`spring_notes_${client.id}`);
      if (savedNotes) setNotes(JSON.parse(savedNotes));
      setError('');
    } else {
      setError('Invalid access code. Please check with your therapist.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('therapy_client_code');
    setActiveClient(null);
    setCode('');
    setNotes([]);
    setActiveTab('today');
  };

  const handleAddNote = (text: string) => {
    if (!activeClient) return;
    const note: Note = {
      id: Date.now().toString(),
      text,
      timestamp: Date.now()
    };
    const updated = [note, ...notes];
    setNotes(updated);
    localStorage.setItem(`spring_notes_${activeClient.id}`, JSON.stringify(updated));
  };

  const handleDeleteNote = (id: string) => {
    if (!activeClient) return;
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    localStorage.setItem(`spring_notes_${activeClient.id}`, JSON.stringify(updated));
  };

  if (!activeClient) {
    return (
      <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2rem] p-10 shadow-2xl text-center space-y-8 border border-white">
          <div className="w-24 h-24 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto text-indigo-500 shadow-inner">
             <i className="fas fa-shield-heart text-4xl"></i>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-500 text-sm">Please enter your unique client code to access your therapy companion.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input 
                type="text" 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="ENTER UNIQUE CODE"
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none text-center font-bold tracking-widest text-gray-800 transition-all placeholder:font-normal placeholder:tracking-normal"
              />
            </div>
            {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
            <button 
              type="submit"
              className="w-full py-4 bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-600 active:scale-[0.98] transition-all"
            >
              Access Companion
            </button>
          </form>

          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Secure • Private • Personalized</p>
        </div>
      </div>
    );
  }

  return (
    <Layout 
      clientName={activeClient.name} 
      onLogout={handleLogout} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    >
      {activeTab === 'today' && (
        <Dashboard 
          client={activeClient} 
          notes={notes}
          onAddNote={handleAddNote}
          onDeleteNote={handleDeleteNote}
        />
      )}
      {activeTab === 'history' && (
        <History 
          client={activeClient} 
          notes={notes} 
          onDeleteNote={handleDeleteNote} 
        />
      )}
      {activeTab === 'tools' && (
        <div className="p-8 text-center space-y-6 animate-fadeIn">
          <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto text-indigo-500">
             <i className="fas fa-wrench text-3xl"></i>
          </div>
          <h2 className="text-xl font-bold">Therapy Toolbox</h2>
          <p className="text-gray-500 text-sm italic">Coming soon: personalized exercises and worksheets assigned by your therapist.</p>
        </div>
      )}
    </Layout>
  );
};

export default App;
