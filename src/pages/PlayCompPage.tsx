import React, { useEffect, useRef } from 'react';

export const PlayCompPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'Play Chess vs Computer Engine Online | Marwadi Chess';

    let instance: any = null;
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
    <div className="box-100 bg-E3 main-master snug-top" style={{ marginTop: 0, paddingTop: 0 }}>
      <div className="row body snug-top" style={{ paddingTop: 0, marginTop: 0 }}>
        <div className="box-90 content snug-top" style={{ paddingTop: 0, marginTop: 0, maxWidth: '1200px', margin: '0 auto' }}>
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
