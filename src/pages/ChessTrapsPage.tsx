import React, { useEffect, useRef } from 'react';
import { ChessModuleInstance } from '../types/chess';
import './ChessTrapsPage.css';

/**
 * Chess opening traps and tactical tricks analysis page.
 *
 * @returns ChessTrapsPage view component
 *
 * @example
 * ```tsx
 * <Route path="/chesstraps" element={<ChessTrapsPage />} />
 * ```
 */
export const ChessTrapsPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'Chess Opening Traps & Tricks | Marwadi Chess';

    let instance: ChessModuleInstance | null = null;
    const timer = setTimeout(() => {
      const el = document.getElementById('mchessBoardContainer');
      if (el && (window as any).MChessBoard) {
        el.innerHTML = '';
        instance = new (window as any).MChessBoard(el, {
          pgnUrl: '/data/pgn/opening_traps.pgn',
          mode: 'traps',
        });
      }
    }, 50);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="box-100 bg-E3 main-master snug-top mchess-traps-wrapper">
      <div className="row body snug-top">
        <div className="box-90 content snug-top mchess-traps-content">
          <div className="row">
            <div className="col-md-12">
              <div id="mchessBoardContainer" data-pgn="/data/pgn/opening_traps.pgn" data-mode="traps" ref={containerRef}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChessTrapsPage;
