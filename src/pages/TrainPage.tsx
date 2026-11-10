import React, { useEffect, useRef } from 'react';
import { ChessModuleInstance } from '../types/chess';
import './TrainPage.css';

/**
 * Fast-paced tactics and checkmate trainer page powered by MChessTrainer.
 *
 * @returns TrainPage view component
 *
 * @example
 * ```tsx
 * <Route path="/train" element={<TrainPage />} />
 * ```
 */
export const TrainPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'Train Yourself - Fast-Paced Chess Tactics & Checkmate Trainer | Marwadi Chess';

    let instance: ChessModuleInstance | null = null;
    const timer = setTimeout(() => {
      const el = document.getElementById('mchessTrainerContainer');
      if (el && (window as any).MChessTrainer) {
        el.innerHTML = '';
        el.removeAttribute('data-mchess-trainer-init');
        instance = new (window as any).MChessTrainer(el, {
          pgnPath: '/data/pgn/train.pgn',
        });
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      if (instance) {
        if (instance.clockTimer) {
          clearInterval(instance.clockTimer);
        }
        if (instance.stockfishWorker) {
          try {
            instance.stockfishWorker.terminate();
          } catch (e) {}
        }
      }
    };
  }, []);

  return (
    <div className="box-100 bg-E3 main-master snug-top mchess-train-wrapper">
      <div className="row body snug-top">
        <div className="box-90 content snug-top mchess-train-content">
          <div className="row">
            <div className="col-md-12">
              <div id="mchessTrainerContainer" data-pgn="/data/pgn/train.pgn" ref={containerRef}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainPage;
