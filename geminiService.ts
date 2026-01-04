
import { GoogleGenAI, Modality } from "@google/genai";
import { MindfulnessTheme, Note } from '../types';

export const generateMindfulnessAudio = async (theme: MindfulnessTheme, level: number): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompts = {
    1: `Focus on your breath. Inhale calm, exhale tension.`,
    2: `Notice the space around you. Feel the quiet strength within your core.`,
    3: `You are whole and complete as you are. Carry this peace into your day.`
  };

  const fullPrompt = `Narrate a short mindfulness exercise for the theme "${theme}". Focus on: "${prompts[level as keyof typeof prompts]}". Speak slowly and gently.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: fullPrompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data");
    
    return base64Audio;
  } catch (error) {
    console.error("Audio generation failed:", error);
    throw error;
  }
};

export const generateMindfulnessVideo = async (theme: MindfulnessTheme): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const promptMap = {
    'Peace': 'A slow-motion close-up of sunlight filtering through lush green leaves, gentle breeze, ethereal atmosphere, 4k cinematic.',
    'Compassion': 'A glowing, warm golden light radiating softly from a blooming lotus flower on calm water, peaceful, high quality.',
    'Resilience': 'An ancient, sturdy mountain peak during a soft sunrise, wispy clouds moving slowly, majestic and stable, 4k.'
  };

  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: promptMap[theme] || 'A relaxing abstract flow of colors and light',
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '9:16'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed");
    
    return `${downloadLink}&key=${process.env.API_KEY}`;
  } catch (error) {
    console.error("Video generation failed:", error);
    throw error;
  }
};

export const summarizeNotes = async (notes: Note[], range: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const notesText = notes.map(n => `[${new Date(n.timestamp).toLocaleDateString()}] ${n.text}`).join('\n');
  
  const prompt = `You are an empathetic therapy assistant. Below are my therapy notes and reflections for the timeframe: "${range}". 
  Please provide a thoughtful, encouraging summary of my themes, progress, and areas of focus. 
  Keep the tone supportive and concise (max 200 words). Use bullet points for key insights if helpful.
  
  NOTES:
  ${notesText}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    return response.text || "I couldn't generate a summary at this time.";
  } catch (error) {
    console.error("Summarization failed:", error);
    throw error;
  }
};

export const transcribeAudio = async (base64Data: string, mimeType: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = "Please transcribe this therapy reflection audio accurately. Only return the transcribed text without any extra comments.";
  
  const audioPart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [audioPart, { text: prompt }] },
    });
    return response.text?.trim() || "No transcription available.";
  } catch (error) {
    console.error("Transcription failed:", error);
    throw error;
  }
};

export const decodePCM = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const createAudioBuffer = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000
): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length;
  const buffer = ctx.createBuffer(1, frameCount, sampleRate);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
};
