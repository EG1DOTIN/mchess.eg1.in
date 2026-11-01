import React, { useEffect, useRef } from 'react';

export const WatchLivePage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'Watch Live Chess Games & Tournaments | Marwadi Chess';

    let instance: any = null;
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
    <div className="box-100 bg-E3 main-master snug-top" style={{ marginTop: 0, paddingTop: 0 }}>
      <div className="row body snug-top" style={{ paddingTop: 0, marginTop: 0 }}>
        <div className="box-90 content snug-top" style={{ paddingTop: 0, marginTop: 0, maxWidth: '1400px', margin: '0 auto' }}>
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
