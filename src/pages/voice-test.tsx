// Filename: src/pages/voice-test.tsx
import { useState } from 'react';

export default function VoiceTestPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const testVoice = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/voice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: "Welcome to TheChessWire... where every move tells a story.",
        })
      });
      const data = await response.json();
      
      if (data.success) {
        const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
        await audio.play();
      } else {
        setError(data.error || 'Failed to generate voice');
      }
    } catch (err) {
      setError('Failed to connect to voice API');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Bambai AI Voice Test</h1>
      <button 
        onClick={testVoice}
        disabled={loading}
        style={{ 
          padding: '20px 40px', 
          fontSize: '20px',
          backgroundColor: '#40E0D0',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Generating...' : 'Test Voice'}
      </button>
      {error && <p style={{ color: 'red', marginTop: '20px' }}>{error}</p>}
    </div>
  );
}