'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { kimiChessBrain, ChessGame } from '@/lib/KimiChessBrain';
import ReplayBoard from '@/components/ReplayBoard';
import { FileText, Code, Eye, EyeOff, Loader2 } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  content: string;
  pgn?: string;
  replay_json?: string;
  publishedAt: string;
  author: string;
  tags: string[];
}

export default function ArticlePage() {
  const params = useParams();
  const articleId = params.id as string;
  
  const [article, setArticle] = useState<Article | null>(null);
  const [gameData, setGameData] = useState<ChessGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'article' | 'pgn' | 'json'>('article');
  const [showReplay, setShowReplay] = useState(true);

  useEffect(() => {
    fetchArticle();
  }, [articleId]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      
      // Fetch article data (this would be an API call in production)
      const mockArticle: Article = {
        id: articleId,
        title: "Magnus Carlsen vs Hikaru Nakamura: A Tactical Masterpiece",
        content: `
          <p>In this thrilling encounter between two of the world's best players, Magnus Carlsen and Hikaru Nakamura delivered a game that will be remembered for its tactical brilliance and strategic depth.</p>
          
          <p>The game began with a sharp Sicilian Defense, where both players showed their deep understanding of opening theory. Carlsen, playing White, chose an aggressive approach, while Nakamura responded with precise defensive moves.</p>
          
          <p>The critical moment came on move 23, when Carlsen played a brilliant tactical combination that forced Nakamura into a difficult position. The ensuing endgame was a masterclass in technique, with Carlsen converting his advantage with clinical precision.</p>
          
          <p>This game demonstrates why both players are considered among the greatest of their generation, showcasing not only their tactical prowess but also their ability to handle complex positions under pressure.</p>
        `,
        pgn: `[Event "Norway Chess 2023"]
[Site "Stavanger NOR"]
[Date "2023.06.05"]
[Round "7"]
[White "Carlsen, Magnus"]
[Black "Nakamura, Hikaru"]
[Result "1-0"]
[WhiteElo "2830"]
[BlackElo "2787"]
[ECO "B90"]

1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Be3 e5 7. Nb3 Be6 8. f3 Be7 9. Qd2 O-O 10. O-O-O Nbd7 11. g4 b5 12. g5 Nh5 13. Nd5 Bxd5 14. exd5 f6 15. gxf6 Nxf6 16. h4 Qc7 17. h5 Rfc8 18. h6 g6 19. Bg5 Nxg5 20. Qxg5 Qf7 21. Qxf7+ Kxf7 22. h7 Kg7 23. Nc5! dxc5 24. Bxc5 Rc7 25. Bxe7 Rxe7 26. Rxd6 Re8 27. Rxc6 Rb8 28. Rc7+ Kh8 29. Rxh7+ Kg8 30. Rcg7# 1-0`,
        publishedAt: '2023-06-05T14:30:00Z',
        author: 'Chess Analysis Team',
        tags: ['Carlsen', 'Nakamura', 'Sicilian Defense', 'Tactics', 'Endgame']
      };

      setArticle(mockArticle);

      // Process PGN if available
      if (mockArticle.pgn) {
        const gameAnalysis = await kimiChessBrain.analyzeGame(mockArticle.pgn);
        setGameData(gameAnalysis);
      } else if (mockArticle.replay_json) {
        try {
          const parsedGame = JSON.parse(mockArticle.replay_json);
          setGameData(parsedGame);
        } catch (parseError) {
          console.error('Failed to parse replay JSON:', parseError);
          setError('Failed to load game data');
        }
      }

    } catch (err) {
      console.error('Failed to fetch article:', err);
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h1>
          <p className="text-gray-600">{error || 'The requested article could not be found.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Article Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>By {article.author}</span>
              <span>•</span>
              <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowReplay(!showReplay)}
                className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                {showReplay ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showReplay ? 'Hide' : 'Show'} Replay</span>
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setViewMode('article')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'article'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Article</span>
            </button>
            
            {article.pgn && (
              <button
                onClick={() => setViewMode('pgn')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'pgn'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Code className="w-4 h-4" />
                <span>PGN</span>
              </button>
            )}
            
            {gameData && (
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
            )}
          </div>
        </div>

        {/* Content Based on View Mode */}
        {viewMode === 'article' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Article Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </div>
            </div>

            {/* Game Replay */}
            {showReplay && gameData && (
              <div className="lg:col-span-1">
                <ReplayBoard 
                  gameData={gameData}
                  showAnnotations={true}
                  allowUserAnnotations={true}
                />
              </div>
            )}
          </div>
        )}

        {viewMode === 'pgn' && article.pgn && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">PGN Data</h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
              {article.pgn}
            </pre>
          </div>
        )}

        {viewMode === 'json' && gameData && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Game Analysis JSON</h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
              {JSON.stringify(gameData, null, 2)}
            </pre>
          </div>
        )}

        {/* Full Replay Board (when not in article mode) */}
        {viewMode !== 'article' && showReplay && gameData && (
          <div className="mt-6">
            <ReplayBoard 
              gameData={gameData}
              showAnnotations={true}
              allowUserAnnotations={true}
            />
          </div>
        )}

        {/* Game Analysis Summary */}
        {gameData && !gameData.error && (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Game Analysis</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-1">Opening</h3>
                <p className="text-sm text-blue-700">{gameData.opening.name}</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-1">Result</h3>
                <p className="text-sm text-green-700">{gameData.evaluation.finalResult}</p>
              </div>
              
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-1">Quality</h3>
                <p className="text-sm text-yellow-700 capitalize">{gameData.evaluation.gameQuality}</p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-1">Highlights</h3>
                <p className="text-sm text-purple-700">{gameData.tacticalHighlights.length} tactical moments</p>
              </div>
            </div>

            {/* Opening Description */}
            {gameData.opening.description && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Opening Analysis</h3>
                <p className="text-sm text-gray-700">{gameData.opening.description}</p>
              </div>
            )}

            {/* Tactical Highlights */}
            {gameData.tacticalHighlights.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Key Moments</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {gameData.tacticalHighlights.slice(0, 6).map((highlight, index) => (
                    <div
                      key={index}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setViewMode('article');
                        setShowReplay(true);
                        // In a real implementation, this would scroll to the replay board
                        // and highlight the specific move
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">Move {highlight.moveNumber}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          highlight.type === 'brilliant' ? 'bg-green-100 text-green-800' :
                          highlight.type === 'blunder' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {highlight.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{highlight.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 