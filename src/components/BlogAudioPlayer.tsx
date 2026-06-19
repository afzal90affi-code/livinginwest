"use client";
import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, Sparkles } from 'lucide-react';

interface BlogAudioPlayerProps {
  title: string;
  content: string; // Is m blog ka poora text pass hoga
}

export default function BlogAudioPlayer({ title, content }: BlogAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      // Clean content: HTML tags ya extra spaces hatane k liye
      const cleanContent = content.replace(/<[^>]*>/g, '').trim();
      
      // Poora narration text tayar karna (Interesting Intro k sath)
      const fullNarration = `Welcome to Living In West. Here is an exclusive audio story titled: ${title}. ${cleanContent}. Thank you for listening.`;
      
      const speech = new SpeechSynthesisUtterance(fullNarration);
      
      // 🎙️ Premium Voice Configuration
      speech.lang = 'en-US'; // USA English Accent
      speech.rate = 0.95;    // Thori si slow speed takay sunne m professional aur maza aaye
      speech.pitch = 1.0;    // Natural human tone base

      speech.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };

      setUtterance(speech);
    }

    // Safely stop audio if user changes the page
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [title, content]);

  const handlePlayPause = () => {
    if (!utterance) return;

    if (!isPlaying) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.cancel(); // Pehle se chalti voice clear karein
        window.speechSynthesis.speak(utterance);
      }
      setIsPlaying(true);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleReset = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  return (
    <div className="my-6 p-4 bg-white border border-gray-200 rounded-sm shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 max-w-2xl">
      
      {/* Text Info */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-black text-white rounded-full">
          <Volume2 className="w-4 h-4 animate-pulse" />
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-widest text-amber-500 font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> AI Audio Vlog NARRATOR
          </span>
          <h4 className="font-serif text-sm font-bold text-gray-900 mt-0.5">Listen to this story instead of reading</h4>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <button 
          onClick={handlePlayPause}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs uppercase tracking-wider font-semibold rounded-sm transition-all border ${
            isPlaying 
              ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
              : 'bg-black border-black text-white hover:bg-gray-800'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" /> Pause
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" /> {isPaused ? "Resume" : "Listen Now"}
            </>
          )}
        </button>

        {/* Reset Button */}
        {(isPlaying || isPaused) && (
          <button 
            onClick={handleReset}
            className="p-2 border border-gray-200 rounded-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            title="Reset Audio"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

    </div>
  );
}