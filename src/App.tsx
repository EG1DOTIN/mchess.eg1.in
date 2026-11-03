import React, { useState, useEffect, useCallback } from 'react';
import {
  ThemeProvider,
  FirebaseProvider,
  Header,
  Footer,
  ConsentBanner,
  NavLinkItem,
  FooterSection,
  useVisitorTracker,
  SocialIcon,
  Icon,
  ChessKnightIcon,
} from 'eg-web-core';
import { MCHESS_FIREBASE_CONFIG } from './config/firebase';
import { MarwadiChessLogo } from './components/MarwadiChessLogo';

import { HomePage } from './pages/HomePage';
import { PlayOnlinePage } from './pages/PlayOnlinePage';
import { PlayCompPage } from './pages/PlayCompPage';
import { TrainPage } from './pages/TrainPage';
import { DailyPuzzlesPage } from './pages/DailyPuzzlesPage';
import { ChessRulesPage } from './pages/ChessRulesPage';
import { ChessTrapsPage } from './pages/ChessTrapsPage';
import { PgnGamesPage } from './pages/PgnGamesPage';
import { MyGamesPage } from './pages/MyGamesPage';
import { WatchLivePage } from './pages/WatchLivePage';
import { BlogPage } from './pages/BlogPage';
import { UpdatesPage } from './pages/UpdatesPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { AdminPage } from './pages/AdminPage';

const MCHESS_NAV_LINKS: NavLinkItem[] = [
  {
    label: 'HOME',
    href: 'index',
    icon: <Icon name="home" size={14} />,
  },
  {
    label: 'LEARN',
    href: '#',
    icon: <Icon name="graduation-cap" size={14} />,
    children: [
      {
        label: 'BASIC CHESS RULES',
        href: 'chessrules',
        icon: <Icon name="chess-pawn" size={14} color="#3b82f6" />,
      },
      {
        label: 'LEARN CHESS TRAPS',
        href: 'chesstraps',
        icon: <Icon name="chess-queen" size={14} color="#ec4899" />,
      },
      {
        label: 'WATCH TOP LIVE GAMES',
        href: 'watchlive',
        icon: <Icon name="tv" size={14} color="#ef4444" />,
      },
      {
        label: 'PGN GAMES DATABASE',
        href: 'pgngames',
        icon: <Icon name="database" size={14} color="#8b5cf6" />,
      },
      {
        label: 'TRAIN YOURSELF',
        href: 'train',
        icon: <Icon name="brain" size={14} color="#10b981" />,
      },
    ],
  },
  {
    label: 'PUZZLES',
    href: '#',
    icon: <Icon name="puzzle" size={14} />,
    children: [
      {
        label: 'TRAIN YOURSELF',
        href: 'train',
        icon: <Icon name="brain" size={14} color="#10b981" />,
      },
      {
        label: 'DAILY CHESS PUZZLE',
        href: 'dailypuzzles',
        icon: <Icon name="calendar" size={14} color="#f59e0b" />,
      },
      {
        label: 'MATE IN 2',
        href: 'blog?cat=Mate%20in%202',
        icon: <Icon name="target" size={14} color="#f59e0b" />,
      },
      {
        label: 'MATE IN 3',
        href: 'blog?cat=Mate%20in%203',
        icon: <Icon name="target" size={14} color="#f97316" />,
      },
      {
        label: 'MATE IN 4',
        href: 'blog?cat=Mate%20in%204',
        icon: <Icon name="trophy" size={14} color="#eab308" />,
      },
      {
        label: 'MATE IN N',
        href: 'blog?cat=Chess%20Puzzles',
        icon: <Icon name="chess-king" size={14} color="#6366f1" />,
      },
    ],
  },
  {
    label: 'PLAY',
    href: '#',
    icon: <Icon name="gamepad" size={14} />,
    children: [
      {
        label: 'PLAY ONLINE',
        href: 'playonline',
        icon: <Icon name="globe" size={14} color="#06b6d4" />,
      },
      {
        label: 'PLAY VS COMPUTER',
        href: 'playcomp',
        icon: <Icon name="robot" size={14} color="#8b5cf6" />,
      },
      {
        label: 'MY PLAYED GAMES',
        href: 'mygames',
        icon: <Icon name="scroll" size={14} color="#eab308" />,
      },
    ],
  },
  {
    label: 'EXPLORE',
    href: '#',
    icon: <Icon name="compass" size={14} />,
    children: [
      {
        label: 'WEBSITE UPDATES',
        href: 'updates',
        icon: <Icon name="bullhorn" size={14} color="#3b82f6" />,
      },
      {
        label: 'LATEST BLOG',
        href: 'blog',
        icon: <Icon name="newspaper" size={14} color="#10b981" />,
      },
      {
        label: 'CHESS QUOTES',
        href: 'blog?cat=Chess%20Quotes',
        icon: <Icon name="quote" size={14} color="#38bdf8" />,
      },
      {
        label: 'CHESS HISTORY',
        href: 'blog?cat=Chess%20History',
        icon: <Icon name="landmark" size={14} color="#a855f7" />,
      },
    ],
  },
  {
    label: 'ABOUT',
    href: 'about',
    icon: <Icon name="info" size={14} />,
  },
];

const MCHESS_FOOTER_SECTIONS: FooterSection[] = [
  {
    title: 'Chess Puzzles',
    links: [
      { label: 'Mate in 2 Puzzles', href: 'blog?cat=Mate%20in%202', icon: <Icon name="target" size={13} color="#f59e0b" /> },
      { label: 'Mate in 3 Puzzles', href: 'blog?cat=Mate%20in%203', icon: <Icon name="target" size={13} color="#f97316" /> },
      { label: 'Mate in 4 Puzzles', href: 'blog?cat=Mate%20in%204', icon: <Icon name="trophy" size={13} color="#eab308" /> },
      { label: 'Mate in N Puzzles', href: 'blog?cat=Chess%20Puzzles', icon: <Icon name="puzzle" size={13} color="#10b981" /> },
    ],
  },
  {
    title: 'Explore & Community',
    links: [
      { label: 'Chess Quotes', href: 'blog?cat=Chess%20Quotes', icon: <Icon name="quote" size={13} color="#38bdf8" /> },
      { label: 'Play vs Computer', href: 'playcomp', icon: <Icon name="robot" size={13} color="#8b5cf6" /> },
      { label: 'Play Online Chess', href: 'playonline', icon: <Icon name="globe" size={13} color="#06b6d4" /> },
      { label: 'PGN Games Database', href: 'pgngames', icon: <Icon name="database" size={13} color="#8b5cf6" /> },
    ],
  },
  {
    title: 'Connect Platforms',
    customContent: (
      <div>
        <div className="social-icon-grid">
          <a
            href="https://facebook.com/m1chess/"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon-btn"
            title="Facebook"
            aria-label="Facebook"
          >
            <SocialIcon name="facebook" size={19} />
          </a>
          <a
            href="https://instagram.com/marwadichess/"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon-btn"
            title="Instagram"
            aria-label="Instagram"
          >
            <SocialIcon name="instagram" size={19} />
          </a>
          <a
            href="https://X.com/ChessMarwadi"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon-btn"
            title="X (Twitter)"
            aria-label="X (Twitter)"
          >
            <SocialIcon name="x" size={18} />
          </a>
          <a
            href="https://youtube.com/channel/UC3y5PJpiD4ErBSNg50jqhRg"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon-btn"
            title="YouTube"
            aria-label="YouTube"
          >
            <SocialIcon name="youtube" size={19} />
          </a>
          <a
            href="https://lichess.org/@/Lara1Brinston"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon-btn"
            title="Lichess"
            aria-label="Lichess"
          >
            <i className="fas fa-chess-knight"></i>
          </a>
          <a
            href="https://www.chess.com/member/marwadichess"
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon-btn"
            title="Chess.com"
            aria-label="Chess.com"
          >
            <i className="fas fa-chess-pawn"></i>
          </a>
        </div>
        <div className="footer-email-chip">
          <a
            href="https://eg1.in/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="email-chip-link"
            title="Contact Us on EG1"
          >
            <SocialIcon name="paper-plane" size={13} />
            <span>Send Message</span>
          </a>
        </div>
      </div>
    ),
  },
];

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window === 'undefined') return 'index';
    const raw = window.location.pathname.replace(/^\//, '').split('?')[0].split('#')[0].replace(/\.html$/, '');
    return raw || 'index';
  });

  // Activate anonymous non-invasive telemetry respecting consent
  useVisitorTracker({
    appName: 'mchess.eg1.in',
    firebaseConfig: MCHESS_FIREBASE_CONFIG,
    onLogReady: (log: any) => {
      console.log('[MChess Telemetry Session]', log.id, log.city, log.country, log.os);
    },
  });

  useEffect(() => {
    const handlePopState = () => {
      const raw = window.location.pathname.replace(/^\//, '').split('?')[0].split('#')[0].replace(/\.html$/, '');
      setCurrentPath(raw || 'index');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = useCallback((path: string) => {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      window.open(path, '_blank', 'noopener,noreferrer');
      return;
    }
    const clean = path.replace(/^\/+/, '').split('?')[0].split('#')[0].replace(/\.html$/, '');
    const query = path.includes('?') ? `?${path.split('?')[1]}` : '';
    const targetUrl = clean === 'index' || clean === '' ? '/' : `/${clean}`;
    window.history.pushState(null, '', `${targetUrl}${query}`);
    setCurrentPath(clean || 'index');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const renderCurrentPage = () => {
    const p = currentPath.split('?')[0].toLowerCase().replace(/\.html$/, '');
    switch (p) {
      case 'playonline':
        return <PlayOnlinePage />;
      case 'playcomp':
        return <PlayCompPage />;
      case 'train':
        return <TrainPage />;
      case 'dailypuzzles':
        return <DailyPuzzlesPage />;
      case 'chessrules':
        return <ChessRulesPage />;
      case 'chesstraps':
        return <ChessTrapsPage />;
      case 'pgngames':
        return <PgnGamesPage />;
      case 'mygames':
        return <MyGamesPage />;
      case 'watchlive':
        return <WatchLivePage />;
      case 'blog':
        return <BlogPage />;
      case 'updates':
        return <UpdatesPage />;
      case 'about':
        return <AboutPage />;
      case 'privacypolicy':
        return <PrivacyPolicyPage />;
      case 'admin':
      case 'adminpanel':
        return <AdminPage onNavigate={navigateTo} />;
      case 'index':
      case '':
      default:
        return <HomePage onNavigate={navigateTo} />;
    }
  };

  const p = currentPath.split('?')[0].toLowerCase().replace(/\.html$/, '');
  const isAdmin =
    p === 'admin' ||
    p === 'adminpanel' ||
    p.startsWith('admin/') ||
    p.startsWith('adminpanel/');

  if (isAdmin) {
    return (
      <ThemeProvider defaultTheme="dark" allowedThemes={['dark', 'light']} storageKey="mchess_theme">
        <FirebaseProvider config={MCHESS_FIREBASE_CONFIG} appName="mchess">
          <AdminPage onNavigate={navigateTo} />
        </FirebaseProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark" allowedThemes={['dark', 'light']} storageKey="mchess_theme">
      <FirebaseProvider config={MCHESS_FIREBASE_CONFIG} appName="mchess">
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--eg-bg-canvas, #0a0e17)' }}>
          {/* Universal Application Header with Staunton Branding & MChess Preset */}
          <Header
          preset="mchess"
          logoComponent={<MarwadiChessLogo size={52} onNavigate={navigateTo} />}
          brandUrl="index"
          navLinks={MCHESS_NAV_LINKS}
          currentPath={currentPath}
          onNavigate={navigateTo}
          containerMaxWidth="min(1600px, 96%)"
          containerPadding="0 clamp(16px, 2.5vw, 36px)"
          githubUrl="https://github.com/EG1DOTIN/mchess.eg1.in"
          showNotificationBell={true}
          notificationFetchUrl="data/updates.json"
          notificationStorageKey="mchess_seen_updates"
          showThemeToggle={true}
          showCacheBuster={true}
          quickAction={
            <a
              href="playonline"
              onClick={(e) => {
                e.preventDefault();
                navigateTo('playonline');
              }}
              className="header-cta-btn cta-play"
              title="Play Online Chess"
              aria-label="Play Online Chess"
            >
              <i className="fas fa-chess-knight"></i>
              <span className="sr-only">Play Online</span>
            </a>
          }
        />

        {/* Main Application Page View */}
        <main style={{ flex: 1 }}>{renderCurrentPage()}</main>

        {/* 4-Column Universal Chess Footer */}
        <Footer
          preset="mchess"
          containerMaxWidth="min(1600px, 96%)"
          containerPadding="0 clamp(16px, 2.5vw, 36px)"
          logoComponent={
            <MarwadiChessLogo
              size={56}
              theme="dark"
              horseVariant="white-horse"
              showTagline={false}
              onNavigate={navigateTo}
            />
          }
          aboutText="Marwadi Chess helps you boost your chess skills with interactive quotes, puzzles, trap guides, database games, and live play."
          aboutReadMoreUrl="about"
          sections={MCHESS_FOOTER_SECTIONS}
          copyrightText="© 2026 Marwadi Chess"
          developedByText="EG1"
          developedByUrl="https://eg1.in"
          privacyPolicyUrl="privacypolicy"
          showBackToTop={true}
          onNavigate={navigateTo}
        />

        {/* GDPR Telemetry Opt-Out & Consent Banner */}
        <ConsentBanner privacyPolicyUrl="privacypolicy" />
      </div>
    </FirebaseProvider>
  </ThemeProvider>
  );
};

export default App;
