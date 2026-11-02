import React, { useEffect, useRef } from 'react';

export const PgnGamesPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'PGN Chess Games Database & Grandmaster Archives | Marwadi Chess';

    let instance: any = null;
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
    <div className="box-100 bg-E3 main-master snug-top" style={{ marginTop: 0, paddingTop: 0 }}>
      <div className="row body snug-top" style={{ paddingTop: 0, marginTop: 0 }}>
        <div className="box-90 content snug-top" style={{ paddingTop: 0, marginTop: 0, maxWidth: '1200px', margin: '0 auto' }}>
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
