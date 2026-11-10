import React, { useEffect, useRef } from 'react';
import { ChessModuleInstance } from '../types/chess';
import './PgnGamesPage.css';

/**
 * PGN chess games database and Grandmaster archives viewer page.
 *
 * @returns PgnGamesPage view component
 *
 * @example
 * ```tsx
 * <Route path="/pgngames" element={<PgnGamesPage />} />
 * ```
 */
export const PgnGamesPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'PGN Chess Games Database & Grandmaster Archives | Marwadi Chess';

    let instance: ChessModuleInstance | null = null;
    const timer = setTimeout(() => {
      const el = document.getElementById('mchessBoardContainer');
      if (el && (window as any).MChessBoard) {
        el.innerHTML = '';
        instance = new (window as any).MChessBoard(el, {
          pgnUrl: '/data/pgn/pgn_games.pgn',
          mode: 'master',
        });
      }
    }, 50);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="box-100 bg-E3 main-master snug-top mchess-pgn-wrapper">
      <div className="row body snug-top">
        <div className="box-90 content snug-top mchess-pgn-content">
          <div className="row">
            <div className="col-md-12">
              <div id="mchessBoardContainer" data-pgn="/data/pgn/pgn_games.pgn" data-mode="master" ref={containerRef}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PgnGamesPage;
