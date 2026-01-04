
import React, { useState, useEffect, useRef } from 'react';
import { generateMindfulnessAudio, generateMindfulnessVideo, decodePCM, createAudioBuffer } from '../services/geminiService';
import { MindfulnessTheme, MediaModality } from '../types';

interface MindfulnessPlayerProps {
  theme: MindfulnessTheme;
  modality: MediaModality;
  level: number;
  onComplete: (note?: string) => void;
  onCancel: () => void;
}

const MindfulnessPlayer: React.FC<MindfulnessPlayerProps> = ({ theme, modality, level, onComplete, onCancel }) => {
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Centering your focus...');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [sessionNote, setSessionNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    const messages = [
      'Finding your inner stillness...',
      'Creating a peaceful space for you...',
      'Almost ready to begin...',
      'Taking a deep breath together...'
    ];
    let msgIdx = 0;
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % messages.length;
      setLoadingMessage(messages[msgIdx]);
    }, 3000);

    const initMedia = async () => {
      try {
        setLoading(true);
        if (modality === 'video') {
          // Check for API key selection for Veo
          if (!(window as any).aistudio?.hasSelectedApiKey()) {
            await (window as any).aistudio?.openSelectKey();
          }
          const url = await generateMindfulnessVideo(theme);
          setVideoUrl(url);
        } else {
          const base64 = await generateMindfulnessAudio(theme, level);
          const bytes = decodePCM(base64);
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          const buffer = await createAudioBuffer(bytes, audioContextRef.current);
          const source = audioContextRef.current.createBufferSource();
          source.buffer = buffer;
          source.connect(audioContextRef.current.destination);
          source.onended = () => {}; // We let user decide when to end to finish notes
          sourceRef.current = source;
          source.start();
        }
        setLoading(false);
      } catch (err) {
        setError("Generation took a little long. Please try again or switch to Audio.");
        setLoading(false);
      }
    };

    initMedia();

    return () => {
      clearInterval(interval);
      if (sourceRef.current) sourceRef.current.stop();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [theme, level, modality]);

  const handleFinish = () => {
    onComplete(sessionNote.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col overflow-hidden animate-slideUp">
      {/* Header */}
      <div className="p-6 flex justify-between items-center bg-white/80 backdrop-blur-md border-b">
        <div>
          <h3 className="font-bold text-gray-900">Wholeness {level}: {theme}</h3>
          <p className="text-xs text-indigo-500 font-medium uppercase tracking-tight">{modality} Session</p>
        </div>
        <button onClick={onCancel} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
          <i className="fas fa-times"></i>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[40vh] p-10 space-y-6">
            <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-indigo-600 font-medium text-center animate-pulse">{loadingMessage}</p>
            <p className="text-xs text-gray-400 text-center">Video sessions take about 10-20 seconds to generate</p>
          </div>
        ) : error ? (
          <div className="p-10 text-center space-y-4">
             <i className="fas fa-exclamation-circle text-4xl text-amber-400"></i>
             <p className="text-gray-600">{error}</p>
             <button onClick={onCancel} className="px-6 py-2 bg-indigo-500 text-white rounded-full">Go Back</button>
          </div>
        ) : (
          <div className="p-6 space-y-8">
            {/* Media Area */}
            <div className="aspect-[9/16] max-h-[50vh] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl mx-auto relative group">
              {modality === 'video' && videoUrl ? (
                <video 
                  src={videoUrl} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-6 bg-gradient-to-br from-indigo-500 to-purple-600">
                  <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                    <i className="fas fa-volume-up text-5xl text-white"></i>
                  </div>
                  <p className="text-white/80 text-sm font-medium">Listening to Inner {theme}...</p>
                </div>
              )}
            </div>

            {/* Note Taking Area */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <i className="fas fa-pen-nib text-indigo-400"></i>
                <h4 className="font-bold text-gray-800">Thoughts & Reflections</h4>
              </div>
              <textarea
                autoFocus
                value={sessionNote}
                onChange={(e) => setSessionNote(e.target.value)}
                placeholder="What are you feeling right now? Any insights for our next session?"
                className="w-full h-40 bg-indigo-50/50 border-2 border-indigo-100 rounded-3xl p-5 text-gray-700 focus:ring-4 focus:ring-indigo-100 outline-none transition-all resize-none placeholder:text-gray-400"
              />
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-5 bg-indigo-600 text-white font-bold rounded-[2rem] shadow-xl shadow-indigo-100 active:scale-95 transition-all"
            >
              Complete & Save Reflection
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MindfulnessPlayer;
