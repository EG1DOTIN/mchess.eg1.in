import React, { useEffect, useRef } from 'react';
import { ChessModuleInstance } from '../types/chess';
import './WatchLivePage.css';

/**
 * Live broadcast and ongoing tournament chess games viewer page.
 *
 * @returns WatchLivePage view component
 *
 * @example
 * ```tsx
 * <Route path="/watchlive" element={<WatchLivePage />} />
 * ```
 */
export const WatchLivePage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'Watch Live Chess Games & Tournaments | Marwadi Chess';

    let instance: ChessModuleInstance | null = null;
    const timer = setTimeout(() => {
      const el = document.getElementById('mchessLiveGridContainer');
      if (el && (window as any).MChessLiveGrid) {
        el.innerHTML = '';
        instance = new (window as any).MChessLiveGrid(el);
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      if (instance && instance.destroy) {
        try {
          instance.destroy();
        } catch (e) {}
      }
    };
  }, []);

  return (
    <div className="box-100 bg-E3 main-master snug-top mchess-watchlive-wrapper">
      <div className="row body snug-top">
        <div className="box-90 content snug-top mchess-watchlive-content">
          <div className="row">
            <div className="col-md-12">
              <div id="mchessLiveGridContainer" ref={containerRef}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatchLivePage;
