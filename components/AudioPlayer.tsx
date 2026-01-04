
import React, { useState, useEffect, useRef } from 'react';
import { generateMindfulnessAudio, decodePCM, createAudioBuffer } from '../services/geminiService';
import { MindfulnessTheme } from '../types';

interface AudioPlayerProps {
  theme: MindfulnessTheme;
  level: number;
  onComplete: () => void;
  onCancel: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ theme, level, onComplete, onCancel }) => {
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const initAudio = async () => {
      try {
        setLoading(true);
        const base64 = await generateMindfulnessAudio(theme, level);
        const bytes = decodePCM(base64);
        
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        const buffer = await createAudioBuffer(bytes, audioContextRef.current);
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        
        source.onended = () => {
          setPlaying(false);
          onComplete();
        };
        
        sourceRef.current = source;
        setLoading(false);
        
        // Start playing automatically for a better experience
        handlePlay();
      } catch (err) {
        setError("Unable to load meditation. Please check your connection.");
        setLoading(false);
      }
    };

    initAudio();

    return () => {
      if (sourceRef.current) sourceRef.current.stop();
      if (audioContextRef.current) audioContextRef.current.close();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [theme, level]);

  const handlePlay = () => {
    if (sourceRef.current && !playing) {
      sourceRef.current.start();
      setPlaying(true);
      startTimeRef.current = Date.now();
      
      const duration = sourceRef.current.buffer?.duration || 60;
      timerRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const p = (elapsed / duration) * 100;
        setProgress(Math.min(p, 100));
        if (p >= 100 && timerRef.current) clearInterval(timerRef.current);
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-6 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 text-center space-y-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Wholeness {level}</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="w-32 h-32 bg-indigo-50 rounded-full mx-auto flex items-center justify-center text-indigo-500 mb-4 animate-pulse">
           <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-leaf'} text-5xl`}></i>
        </div>

        <p className="text-gray-600 italic">
          {loading ? 'Preparing your custom mindfulness session...' : `Theme: ${theme}`}
        </p>

        {!loading && !error && (
          <div className="space-y-4">
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-500 h-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 uppercase tracking-widest">Breathing in... Breathing out...</p>
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="pt-4">
          <button 
            onClick={onCancel}
            className="px-8 py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors"
          >
            End Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
