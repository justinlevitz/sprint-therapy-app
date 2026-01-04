
import React, { useState, useEffect, useRef } from 'react';
import { Client, MindfulnessTheme, MediaModality, CompletionState, Note } from '../types';
import { MINDFULNESS_THEMES } from '../constants';
import MindfulnessPlayer from './MindfulnessPlayer';
import { transcribeAudio } from '../services/geminiService';

interface DashboardProps {
  client: Client;
  notes: Note[];
  onAddNote: (text: string) => void;
  onDeleteNote: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ client, notes, onAddNote, onDeleteNote }) => {
  const [selectedTheme, setSelectedTheme] = useState<MindfulnessTheme>(MINDFULNESS_THEMES[0].value);
  const [modality, setModality] = useState<MediaModality>('audio');
  const [completions, setCompletions] = useState<CompletionState>({
    wholeness1: false,
    wholeness2: false,
    wholeness3: false
  });
  const [activeLevel, setActiveLevel] = useState<number | null>(null);
  const [newNote, setNewNote] = useState('');
  const [growthOutcome, setGrowthOutcome] = useState('');
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Load persistence for completions and growth outcome
  useEffect(() => {
    const savedCompletions = localStorage.getItem(`spring_completions_${client.id}`);
    if (savedCompletions) setCompletions(JSON.parse(savedCompletions));

    const savedOutcome = localStorage.getItem(`spring_growth_outcome_${client.id}`);
    if (savedOutcome) setGrowthOutcome(savedOutcome);
  }, [client.id]);

  const handleComplete = (sessionNote?: string) => {
    if (activeLevel) {
      const key = `wholeness${activeLevel}` as keyof CompletionState;
      const newState = { ...completions, [key]: true };
      setCompletions(newState);
      localStorage.setItem(`spring_completions_${client.id}`, JSON.stringify(newState));
      
      if (sessionNote) {
        onAddNote(`[${selectedTheme} Session] ${sessionNote}`);
      }
      
      setActiveLevel(null);
    }
  };

  const handleAddLocalNote = () => {
    if (!newNote.trim()) return;
    onAddNote(newNote);
    setNewNote('');
  };

  const handleGrowthOutcomeBlur = () => {
    localStorage.setItem(`spring_growth_outcome_${client.id}`, growthOutcome);
  };

  const resetMindfulness = () => {
    const fresh = { wholeness1: false, wholeness2: false, wholeness3: false };
    setCompletions(fresh);
    localStorage.setItem(`spring_completions_${client.id}`, JSON.stringify(fresh));
  };

  // Audio Recording Logic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setIsTranscribing(true);
        try {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1];
            const transcription = await transcribeAudio(base64Audio, 'audio/webm');
            onAddNote(`[Voice Note] ${transcription}`);
            setIsTranscribing(false);
          };
        } catch (error) {
          console.error("Recording processing failed", error);
          setIsTranscribing(false);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied or error:", err);
      alert("Could not access microphone. Please check your browser permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="p-6 space-y-8 animate-fadeIn">
      {/* Spring Focus Banner - Updated to dark blue */}
      <section className="bg-indigo-950 rounded-3xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-2 opacity-80">
          <i className="fas fa-seedling text-indigo-400"></i>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-200">Active Focus</span>
        </div>
        <h2 className="text-2xl font-bold mb-3">{client.currentSpring}</h2>
        <p className="text-indigo-200 text-sm leading-relaxed">{client.summary}</p>
      </section>

      {/* Current Sprint Timeline Section */}
      <section className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500">
            <i className="fas fa-route"></i>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Current Sprint</h3>
        </div>

        {/* 3-Week Timeline Visualization */}
        <div className="relative py-4">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full"></div>
          <div className="relative flex justify-between">
            {[1, 2, 3].map((week) => (
              <div key={week} className="flex flex-col items-center gap-2 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm border-2 ${
                  week === 1 ? 'bg-indigo-500 border-indigo-500 text-white' : 
                  week === 2 ? 'bg-white border-indigo-200 text-indigo-400' : 
                  'bg-white border-gray-200 text-gray-300'
                }`}>
                  <i className="fas fa-user-friends text-[10px]"></i>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Week {week}</p>
                  <p className="text-[9px] font-bold text-gray-500">{week === 1 ? 'Start' : week === 2 ? 'Mid' : 'End'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Meaningful Growth Outcome Input */}
        <div className="space-y-3 pt-2">
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
            <i className="fas fa-star text-amber-400"></i>
            Growth Outcome for this Sprint
          </label>
          <textarea
            value={growthOutcome}
            onChange={(e) => setGrowthOutcome(e.target.value)}
            onBlur={handleGrowthOutcomeBlur}
            placeholder="What single meaningful change are we working towards?"
            className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-4 text-sm text-gray-700 focus:border-indigo-300 focus:bg-white transition-all outline-none h-24 resize-none leading-relaxed"
          />
        </div>
      </section>

      {/* Session Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Last Session</p>
          <p className="font-semibold text-gray-800">{client.lastSession}</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Next Session</p>
          <p className="font-semibold text-indigo-700">{client.nextSession}</p>
        </div>
      </div>

      {/* Caring About You (Mindfulness) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Caring About You</h3>
            <p className="text-xs text-gray-500">Pick a theme and choose your modality</p>
          </div>
          <button 
            onClick={resetMindfulness}
            className="text-[10px] font-bold text-gray-400 hover:text-indigo-500"
          >
            RESET ALL
          </button>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <select 
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value as MindfulnessTheme)}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 appearance-none text-gray-700 font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              {MINDFULNESS_THEMES.map(theme => (
                <option key={theme.value} value={theme.value}>{theme.label}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
               <i className="fas fa-chevron-down"></i>
            </div>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-2xl">
            <button 
              onClick={() => setModality('audio')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${modality === 'audio' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
            >
              <i className="fas fa-volume-up mr-2"></i> AUDIO
            </button>
            <button 
              onClick={() => setModality('video')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${modality === 'video' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
            >
              <i className="fas fa-video mr-2"></i> VIDEO
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((level) => {
            const isCompleted = completions[`wholeness${level}` as keyof CompletionState];
            return (
              <button
                key={level}
                disabled={isCompleted}
                onClick={() => setActiveLevel(level)}
                className={`flex flex-col items-center gap-3 p-4 rounded-3xl transition-all ${
                  isCompleted 
                    ? 'bg-gray-100 text-gray-400 grayscale opacity-50' 
                    : 'bg-white border-2 border-indigo-100 text-indigo-500 shadow-sm'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isCompleted ? 'bg-gray-200' : 'bg-indigo-50 animate-pulse'}`}>
                  {isCompleted ? <i className="fas fa-check"></i> : <i className={`fas ${modality === 'video' ? 'fa-film' : 'fa-play'} text-xs`}></i>}
                </div>
                <span className="text-[9px] font-black tracking-widest uppercase">Wholeness {level}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Quick Add Reflection */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Quick Reflection</h3>
          {(isRecording || isTranscribing) && (
            <div className="flex items-center gap-2 text-indigo-500 animate-pulse">
              <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest">
                {isRecording ? 'Recording...' : 'Transcribing...'}
              </span>
            </div>
          )}
        </div>
        
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="relative">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a thought for our next session..."
              className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-100 h-24 resize-none"
            ></textarea>
            
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isTranscribing}
              className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isRecording 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
              } ${isTranscribing ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isRecording ? "Stop Recording" : "Record Audio Reflection"}
            >
              {isTranscribing ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className={`fas ${isRecording ? 'fa-stop' : 'fa-microphone'}`}></i>
              )}
            </button>
          </div>
          
          <button 
            onClick={handleAddLocalNote}
            disabled={!newNote.trim() || isRecording || isTranscribing}
            className="w-full bg-indigo-500 text-white font-bold py-4 rounded-2xl disabled:opacity-50 transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            Save Reflection
          </button>
        </div>

        {/* Show most recent note as preview */}
        {notes.length > 0 && (
          <div className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm relative group opacity-80">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-2">Most Recent Insight</p>
            <p className="text-sm text-gray-700 leading-relaxed font-medium line-clamp-2">{notes[0].text}</p>
          </div>
        )}
      </section>

      {activeLevel && (
        <MindfulnessPlayer 
          theme={selectedTheme} 
          modality={modality}
          level={activeLevel} 
          onComplete={handleComplete}
          onCancel={() => setActiveLevel(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;
