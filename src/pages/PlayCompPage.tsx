import React, { useEffect, useRef } from 'react';
import { ChessModuleInstance } from '../types/chess';
import './PlayCompPage.css';

/**
 * Play chess vs computer engine page powered by Stockfish WASM.
 *
 * @returns PlayCompPage view component
 *
 * @example
 * ```tsx
 * <Route path="/playcomp" element={<PlayCompPage />} />
 * ```
 */
export const PlayCompPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'Play Chess vs Computer Engine Online | Marwadi Chess';

    let instance: ChessModuleInstance | null = null;
    const timer = setTimeout(() => {
      const el = document.getElementById('mchessEngineBoardContainer');
      if (el && (window as any).MChessEngineBoard) {
        // Clear any previous child contents
        el.innerHTML = '';
        el.removeAttribute('data-mchess-initialized');
        instance = new (window as any).MChessEngineBoard(el, { mode: 'engine' });
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      if (instance) {
        if (instance.stockfishWorker) {
          try {
            instance.stockfishWorker.terminate();
          } catch (e) {}
        }
        if (instance.clockInterval) {
          clearInterval(instance.clockInterval);
        }
      }
    };
  }, []);

  return (
    <div className="box-100 bg-E3 main-master snug-top mchess-play-comp-wrapper">
      <div className="row body snug-top">
        <div className="box-90 content snug-top mchess-play-comp-content">
          <div className="row">
            <div className="col-md-12">
              <div id="mchessEngineBoardContainer" data-mode="engine" ref={containerRef}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayCompPage;
