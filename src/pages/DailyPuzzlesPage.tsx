import React, { useEffect, useRef } from 'react';

export const DailyPuzzlesPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'Daily Chess Puzzle & Tactics | Marwadi Chess';

    let instance: any = null;
    const timer = setTimeout(() => {
      const el = document.getElementById('mchessPuzzleContainer');
      if (el && (window as any).MChessEngineBoard) {
        el.innerHTML = '';
        el.removeAttribute('data-mchess-initialized');
        instance = new (window as any).MChessEngineBoard(el, { mode: 'daily' });
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
        <div className="box-90 content snug-top" style={{ paddingTop: 0, marginTop: 0, maxWidth: '1400px', margin: '0 auto' }}>
          <div className="row">
            <div className="col-md-9">
              {/* Open-Source MCHESS Daily Puzzle & Stockfish Engine Solver */}
              <div id="mchessPuzzleContainer" data-mode="daily" ref={containerRef}></div>
            </div>

            <div
              className="col-md-3"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '15px',
                paddingTop: '15px',
                paddingBottom: '15px',
              }}
            >
              {/* 1. Facebook Group Card */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '340px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #dddfe2',
                  borderRadius: '8px',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden',
                }}
              >
                <div style={{ lineHeight: 0 }}>
                  <img
                    className="img"
                    src="/img/mchess_fb_group.webp"
                    width="340"
                    height="180"
                    alt="Marwadi Chess Group"
                    style={{ width: '100%', objectFit: 'cover', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}
                  />
                </div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', padding: '12px 12px 4px 12px', textAlign: 'center', color: '#1c1e21' }}>
                  Marwadi Chess Group
                </div>
                <div style={{ color: '#65676b', fontSize: '13px', fontWeight: 'normal', textAlign: 'center', paddingBottom: '8px' }}>
                  Public group · 225 members
                </div>
                <div style={{ padding: '4px 16px 12px 16px' }}>
                  <div style={{ backgroundColor: '#1877f2', borderRadius: '6px', textAlign: 'center' }}>
                    <a
                      style={{ color: '#ffffff', textDecoration: 'none', display: 'block', padding: '8px 0', fontSize: '14px', fontWeight: 'bold', width: '100%' }}
                      href="https://www.facebook.com/groups/2720714741537938"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Join Group
                    </a>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #e4e6eb', fontSize: '12px', color: '#050505', padding: '12px 16px', lineHeight: 1.4, backgroundColor: '#f0f2f5' }}>
                  Please maintain good behavior. Let's ask, share, and comment only about chess/Shatranj.
                </div>
              </div>

              {/* 2. Facebook Page Embed */}
              <div style={{ width: '100%', maxWidth: '340px', height: '380px' }}>
                <iframe
                  src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fm1chess%2F&tabs=timeline&width=340&height=380&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId"
                  width="100%"
                  height="380"
                  style={{ border: 'none', overflow: 'hidden', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
                  scrolling="no"
                  frameBorder={0}
                  allow="encrypted-media"
                  title="Marwadi Chess Facebook"
                />
              </div>

              {/* 3. Instagram Embed Link */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '340px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                  padding: '16px',
                  textAlign: 'center',
                }}
              >
                <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                  <i className="fab fa-instagram" style={{ marginRight: '6px' }}></i> Instagram Community
                </div>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', margin: '0 0 12px 0' }}>
                  Follow @marwadichess for daily tactics, quotes & visual puzzles!
                </p>
                <a
                  href="https://www.instagram.com/marwadichess/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    background: '#ffffff',
                    color: '#bc1888',
                    padding: '8px 18px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    textDecoration: 'none',
                  }}
                >
                  Follow on Instagram
                </a>
              </div>

              {/* 4. Twitter / X Follow Card */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '340px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '16px',
                  textAlign: 'center',
                }}
              >
                <div style={{ color: '#ffffff', fontSize: '15px', fontWeight: 'bold', marginBottom: '8px' }}>
                  <i className="fab fa-x-twitter" style={{ marginRight: '6px' }}></i> Marwadi Chess on 𝕏
                </div>
                <a
                  href="https://twitter.com/ChessMarwadi"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    background: '#ffffff',
                    color: '#000000',
                    padding: '8px 18px',
                    borderRadius: '20px',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    textDecoration: 'none',
                  }}
                >
                  Follow @ChessMarwadi
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyPuzzlesPage;
