import React, { useEffect, useRef } from 'react';

export const TrainPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'Train Yourself - Fast-Paced Chess Tactics & Checkmate Trainer | Marwadi Chess';

    let instance: any = null;
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
    <div className="box-100 bg-E3 main-master snug-top" style={{ marginTop: 0, paddingTop: 0 }}>
      <div className="row body snug-top" style={{ paddingTop: 0, marginTop: 0 }}>
        <div className="box-90 content snug-top" style={{ paddingTop: 0, marginTop: 0, maxWidth: '1200px', margin: '0 auto' }}>
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
