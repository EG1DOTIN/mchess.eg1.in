import React, { useState, useEffect } from 'react';
import {
  AdminAuthGuard,
  AdminLayout,
  AdminAnalyticsView,
  AdminMessagesView,
  AdminBlogEditor,
  AdminNavItem,
} from 'eg-web-core';
import { MCHESS_FIREBASE_CONFIG } from '../config/firebase';
import { MarwadiChessLogo } from '../components/MarwadiChessLogo';

export interface AdminPageProps {
  onNavigate?: (href: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  useEffect(() => {
    document.title = 'Admin Panel | Marwadi Chess';
  }, []);
  const [activeTab, setActiveTab] = useState<'analytics' | 'messages' | 'blog'>('analytics');

  const navItems: AdminNavItem[] = [
    {
      id: 'analytics',
      label: 'Visitor Analytics',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
      badge: 'Live',
      badgeColor: 'rgba(56, 189, 248, 0.2)',
    },
    {
      id: 'messages',
      label: 'User Inquiries',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
    },
    {
      id: 'blog',
      label: 'Chess Articles Studio',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      ),
    },
  ];

  return (
    <AdminAuthGuard
      authConfig={{
        allowedEmails: import.meta.env.VITE_ADMIN_ALLOWED_EMAILS
          ? (import.meta.env.VITE_ADMIN_ALLOWED_EMAILS as string).split(',').map((e) => e.trim()).filter(Boolean)
          : undefined,
        pinSalt: (import.meta.env.VITE_ADMIN_PIN_SALT as string) || 'MCHESS_ADMIN_SECURE_SALT_2026',
        firebaseConfig: MCHESS_FIREBASE_CONFIG,
        lockoutCollection: 'admin_lockout',
        logCollection: 'admin_login_log',
        securityCollection: 'admin_security',
      }}
      loginProps={{
        title: 'Marwadi Chess Admin',
        subtitle: 'Two-factor authorized administrator access',
        logo: <MarwadiChessLogo size={52} />,
      }}
    >
      {({ user, logout }) => (
        <AdminLayout
          brandTitle="MChess Admin"
          brandSubtitle="Telemetry & Content Studio"
          logo={<MarwadiChessLogo size={36} />}
          navItems={navItems}
          activeNavId={activeTab}
          onNavSelect={(id) => setActiveTab(id as any)}
          user={user}
          onLogout={logout}
          headerActions={
            onNavigate ? (
              <button
                type="button"
                onClick={() => onNavigate('index.html')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  background: 'var(--eg-bg-tertiary, #1f2937)',
                  border: '1px solid var(--eg-border, rgba(255, 255, 255, 0.12))',
                  borderRadius: 'var(--eg-radius-md, 8px)',
                  color: 'var(--eg-text-primary, #f9fafb)',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span>Exit to MChess</span>
              </button>
            ) : undefined
          }
        >
          {activeTab === 'analytics' && (
            <AdminAnalyticsView
              collectionName="visitor_analytics"
              domains={['All Domains', 'mchess.eg1.in', 'eg1.in', 'av.eg1.in']}
            />
          )}

          {activeTab === 'messages' && (
            <AdminMessagesView
              collectionName="messages"
              title="Marwadi Chess Inquiries & Messages"
            />
          )}

          {activeTab === 'blog' && (
            <AdminBlogEditor
              title="Chess Articles & Puzzles Studio"
              defaultAuthor="Marwadi Chess Team"
              categories={['Mate in 2', 'Mate in 3', 'Tactics', 'Openings', 'Tournaments', 'Announcements']}
              onSave={(_markdown, metadata) => {
                console.log('Saved chess post:', metadata.title);
                alert(`Chess post "${metadata.title}" ready! You can now copy or download the markdown file.`);
              }}
            />
          )}
        </AdminLayout>
      )}
    </AdminAuthGuard>
  );
};
