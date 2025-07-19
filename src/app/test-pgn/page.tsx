'use client';

import React, { useState } from 'react';
import { kimiChessBrain, ChessGame } from '@/lib/KimiChessBrain';
import ReplayBoard from '@/components/ReplayBoard';
import { Play, Code, Eye, Copy, Download, AlertCircle, CheckCircle } from 'lucide-react';

export default function TestPGNPage() {
  const [pgnInput, setPgnInput] = useState('');
  const [gameData, setGameData] = useState<ChessGame | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'replay' | 'json' | 'preview'>('replay');
  const [copied, setCopied] = useState(false);

  const samplePGN = `[Event "Norway Chess 2023"]
[Site "Stavanger NOR"]
[Date "2023.06.05"]
[Round "7"]
[White "Carlsen, Magnus"]
[Black "Nakamura, Hikaru"]
[Result "1-0"]
[WhiteElo "2830"]
[BlackElo "2787"]
[ECO "B90"]

1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be3 e5 7. Nb3 Be6 8. f3 Be7 9. Qd2 O-O 10. O-O-O Nbd7 11. g4 b5 12. g5 Nh5 13. Nd5 Bxd5 14. exd5 f6 15. gxf6 Nxf6 16. h4 Qc7 17. h5 Rfc8 18. h6 g6 19. Bg5 Nxg5 20. Qxg5 Qf7 21. Qxf7+ Kxf7 22. h7 Kg7 23. Nc5! dxc5 24. Bxc5 Rc7 25. Bxe7 Rxe7 26. Rxd6 Re8 27. Rxc6 Rb8 28. Rc7+ Kh8 29. Rxh7+ Kg8 30. Rcg7# 1-0`;

  const handleAnalyzeGame = async () => {
    if (!pgnInput.trim()) {
      setError('Please enter a PGN to analyze');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const analysis = await kimiChessBrain.analyzeGame(pgnInput);
      setGameData(analysis);
      
      if (analysis.error) {
        setError(analysis.errorReason || 'Analysis failed');
      }
    } catch (err) {
      console.error('Analysis failed:', err);
      setError('Failed to analyze game');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = () => {
    setPgnInput(samplePGN);
    setError(null);
    setGameData(null);
  };

  const handleClear = () => {
    setPgnInput('');
    setError(null);
    setGameData(null);
    setCopied(false);
  };

  const handleCopyJSON = async () => {
    if (gameData) {
      try {
        await navigator.clipboard.writeText(JSON.stringify(gameData, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleDownloadJSON = () => {
    if (gameData) {
      const blob = new Blob([JSON.stringify(gameData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chess-analysis-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PGN Testing Interface</h1>
          <p className="text-gray-600">
            Test and analyze PGN games using KimiChessBrain. Paste a PGN below to generate 
            automated analysis, title, summary, and replay data.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            {/* PGN Input */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">PGN Input</h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleLoadSample}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Load Sample
                  </button>
                  <button
                    onClick={handleClear}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <textarea
                value={pgnInput}
                onChange={(e) => setPgnInput(e.target.value)}
                placeholder="Paste your PGN here..."
                className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {pgnInput.length} characters
                </div>
                
                <button
                  onClick={handleAnalyzeGame}
                  disabled={loading || !pgnInput.trim()}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Analyze Game</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-800 font-medium">Error</span>
                </div>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            )}

            {/* Success Display */}
            {gameData && !gameData.error && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-800 font-medium">Analysis Complete</span>
                </div>
                <p className="text-green-700 mt-1">
                  Successfully analyzed {gameData.moves.length} moves with {gameData.tacticalHighlights.length} tactical highlights.
                </p>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* View Mode Toggle */}
            {gameData && (
              <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => setViewMode('replay')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      viewMode === 'replay'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>Replay</span>
                  </button>
                  
                  <button
                    onClick={() => setViewMode('preview')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      viewMode === 'preview'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>Preview</span>
                  </button>
                  
                  <button
                    onClick={() => setViewMode('json')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      viewMode === 'json'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Code className="w-4 h-4" />
                    <span>JSON</span>
                  </button>
                </div>
              </div>
            )}

            {/* Results Content */}
            {gameData && (
              <>
                {viewMode === 'replay' && (
                  <ReplayBoard 
                    gameData={gameData}
                    showAnnotations={true}
                    allowUserAnnotations={true}
                  />
                )}

                {viewMode === 'preview' && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Generated Content Preview</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Title</h3>
                        <p className="text-gray-700 p-3 bg-gray-50 rounded-lg">{gameData.title}</p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
                        <p className="text-gray-700 p-3 bg-gray-50 rounded-lg">{gameData.summary}</p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Opening</h3>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-gray-700 font-medium">{gameData.opening.name}</p>
                          <p className="text-sm text-gray-600 mt-1">{gameData.opening.description}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Game Statistics</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-600">Total Moves</p>
                            <p className="text-lg font-semibold text-blue-900">{gameData.moves.length}</p>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-600">Tactical Highlights</p>
                            <p className="text-lg font-semibold text-green-900">{gameData.tacticalHighlights.length}</p>
                          </div>
                          <div className="p-3 bg-yellow-50 rounded-lg">
                            <p className="text-sm text-yellow-600">Game Quality</p>
                            <p className="text-lg font-semibold text-yellow-900 capitalize">{gameData.evaluation.gameQuality}</p>
                          </div>
                          <div className="p-3 bg-purple-50 rounded-lg">
                            <p className="text-sm text-purple-600">Result</p>
                            <p className="text-lg font-semibold text-purple-900">{gameData.evaluation.finalResult}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {viewMode === 'json' && (
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-semibold text-gray-900">JSON Output</h2>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleCopyJSON}
                          className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                          <Copy className="w-4 h-4" />
                          <span>{copied ? 'Copied!' : 'Copy'}</span>
                        </button>
                        <button
                          onClick={handleDownloadJSON}
                          className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                    
                    <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono max-h-96 overflow-y-auto">
                      {JSON.stringify(gameData, null, 2)}
                    </pre>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {!gameData && !loading && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-center py-12">
                  <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Analyze</h3>
                  <p className="text-gray-600">
                    Paste a PGN in the input field and click "Analyze Game" to get started.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h3 className="font-medium mb-2">1. Input PGN</h3>
              <p>Paste a valid PGN (Portable Game Notation) into the text area. You can use the sample PGN or paste your own.</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">2. Analyze Game</h3>
              <p>Click "Analyze Game" to process the PGN and generate automated analysis, title, and summary.</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">3. Review Results</h3>
              <p>Switch between Replay, Preview, and JSON views to examine the generated content and game analysis.</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">4. Export Data</h3>
              <p>Copy or download the JSON output for use in articles, databases, or other applications.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 