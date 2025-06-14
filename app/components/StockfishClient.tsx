'use client';

import { useEffect, useState, useCallback } from 'react';

interface Analysis {
  bestMove: string | null;
  evaluation: number | null;
  depth: number;
  nodes: number;
  pv: string[];
}

export default function StockfishClient({ fen }: { fen: string }) {
  const [analysis, setAnalysis] = useState<Analysis>({
    bestMove: null,
    evaluation: null,
    depth: 0,
    nodes: 0,
    pv: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [engine, setEngine] = useState<any>(null);

  const initializeEngine = useCallback(async () => {
    try {
      const stockfish = await import('stockfish.wasm');
      const engine = stockfish.default();
      
      engine.onmessage = (event: any) => {
        const line = typeof event === 'string' ? event : event.data;
        
        if (line.startsWith('bestmove')) {
          const [, move, , ponder] = line.split(' ');
          setAnalysis(prev => ({ ...prev, bestMove: move }));
        } else if (line.startsWith('info')) {
          const parts = line.split(' ');
          const depthIndex = parts.indexOf('depth');
          const scoreIndex = parts.indexOf('score');
          const nodesIndex = parts.indexOf('nodes');
          const pvIndex = parts.indexOf('pv');
          
          if (depthIndex !== -1) {
            const depth = parseInt(parts[depthIndex + 1]);
            let evaluation = null;
            
            if (scoreIndex !== -1) {
              const scoreType = parts[scoreIndex + 1];
              const scoreValue = parseInt(parts[scoreIndex + 2]);
              evaluation = scoreType === 'cp' ? scoreValue / 100 : scoreValue;
            }
            
            const nodes = nodesIndex !== -1 ? parseInt(parts[nodesIndex + 1]) : 0;
            const pv = pvIndex !== -1 ? parts.slice(pvIndex + 1) : [];
            
            setAnalysis(prev => ({
              ...prev,
              depth,
              evaluation,
              nodes,
              pv,
            }));
          }
        }
      };

      setEngine(engine);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to initialize Stockfish engine');
      setIsLoading(false);
      console.error('Stockfish initialization error:', err);
    }
  }, []);

  useEffect(() => {
    initializeEngine();
    return () => {
      if (engine) {
        engine.postMessage('quit');
      }
    };
  }, [initializeEngine]);

  useEffect(() => {
    if (engine && !isLoading) {
      setAnalysis(prev => ({
        ...prev,
        bestMove: null,
        evaluation: null,
        depth: 0,
        nodes: 0,
        pv: [],
      }));
      
      engine.postMessage('uci');
      engine.postMessage('setoption name MultiPV value 3');
      engine.postMessage(`position fen ${fen}`);
      engine.postMessage('go depth 20');
    }
  }, [engine, fen, isLoading]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-600">Loading Stockfish engine...</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Position Analysis</h3>
        <p className="text-sm text-gray-600 mb-2">
          <strong>FEN:</strong> {fen}
        </p>
      </div>
      
      <div className="space-y-2">
        <div>
          <strong>Best Move:</strong>{' '}
          <span className="font-mono">{analysis.bestMove || 'Calculating...'}</span>
        </div>
        
        {analysis.evaluation !== null && (
          <div>
            <strong>Evaluation:</strong>{' '}
            <span className={analysis.evaluation > 0 ? 'text-green-600' : 'text-red-600'}>
              {analysis.evaluation > 0 ? '+' : ''}{analysis.evaluation.toFixed(2)}
            </span>
          </div>
        )}
        
        <div>
          <strong>Depth:</strong> {analysis.depth}
        </div>
        
        {analysis.pv.length > 0 && (
          <div>
            <strong>Principal Variation:</strong>{' '}
            <span className="font-mono">{analysis.pv.join(' ')}</span>
          </div>
        )}
        
        <div className="text-sm text-gray-500">
          <strong>Nodes:</strong> {analysis.nodes.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
