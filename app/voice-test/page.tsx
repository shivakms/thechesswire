// app/voice-test/page.tsx

"use client";

import { useState, useEffect } from 'react';

export default function VoiceTest() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<number>(0);
  const [text, setText] = useState("Hi, this is Bambai AI Voice speaking to you. Welcome to TheChessWire and let's begin our journey.");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Auto-select a female voice
      const femaleVoiceIndex = availableVoices.findIndex(voice => {
        const name = voice.name.toLowerCase();
        return (
          name.includes("female") ||
          name.includes("woman") ||
          name.includes("samantha") ||
          name.includes("victoria") ||
          name.includes("karen") ||
          name.includes("nicole") ||
          name.includes("zira") ||
          name.includes("susan") ||
          name.includes("hazel") ||
          name.includes("helena") ||
          (name.includes("google") && name.includes("female")) ||
          (voice.lang.startsWith("en") && name.includes("female"))
        );
      });

      if (femaleVoiceIndex !== -1) {
        setSelectedVoice(femaleVoiceIndex);
        console.log("Selected female voice:", availableVoices[femaleVoiceIndex].name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [isClient]);

  const speak = () => {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    if (voices[selectedVoice]) {
      utterance.voice = voices[selectedVoice];
    }
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    
    window.speechSynthesis.speak(utterance);
  };

  if (!isClient) {
    return <div className="p-8 bg-gray-900 text-white min-h-screen">Loading...</div>;
  }

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl mb-8">Voice Test Page</h1>
      
      <div className="space-y-4 max-w-2xl">
        <div>
          <label className="block mb-2">Select Voice ({voices.length} available):</label>
          <select 
            value={selectedVoice} 
            onChange={(e) => setSelectedVoice(Number(e.target.value))}
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
          >
            {voices.map((voice, index) => (
              <option key={index} value={index}>
                {voice.name} ({voice.lang}) {voice.name.toLowerCase().includes("female") ? "👩" : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2">Selected Voice Details:</label>
          <div className="p-2 bg-gray-800 rounded text-sm">
            {voices[selectedVoice] && (
              <>
                <p>Name: {voices[selectedVoice].name}</p>
                <p>Language: {voices[selectedVoice].lang}</p>
                <p>Local: {voices[selectedVoice].localService ? "Yes" : "No"}</p>
              </>
            )}
          </div>
        </div>

        <div>
          <label className="block mb-2">Text to speak:</label>
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
            rows={3}
          />
        </div>

        <button 
          onClick={speak}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded font-bold"
        >
          🔊 Speak Now
        </button>

        <div className="mt-8 p-4 bg-gray-800 rounded">
          <h2 className="font-bold mb-2">Available Female Voices:</h2>
          <ul className="text-sm space-y-1">
            {voices.filter(v => {
              const name = v.name.toLowerCase();
              return name.includes("female") || name.includes("woman") || 
                     name.includes("samantha") || name.includes("victoria") ||
                     name.includes("zira") || name.includes("hazel");
            }).map((voice, index) => (
              <li key={index}>👩 {voice.name} ({voice.lang})</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
