import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { QuickProposalPage } from './features/quick-proposal/QuickProposalPage';
import { InformedAnalysisPage } from './features/informed-analysis/InformedAnalysisPage';
import { HealthCuesWordmark } from './components/branding/HealthCuesWordmark';

function NavHeader() {
  const location = useLocation();

  return (
    <header className="relative z-20">
      <div
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid #E6EEF6' }}
      >
        <Link to="/" className="flex items-center gap-2.5">
          <HealthCuesWordmark size={32} />
        </Link>
        <nav className="flex gap-1">
          {[
            { to: '/quick-proposal', label: 'Quick Proposal' },
            { to: '/informed-analysis', label: 'Informed Analysis' },
          ].map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-full px-3 py-1.5 text-[14px] font-medium transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'text-text-tertiary hover:text-text-primary hover:bg-surface-glass-light'
                }`}
                style={isActive ? {
                  background: 'linear-gradient(135deg, #2FBF8F 0%, #3F7FF4 100%)',
                } : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      {/* Signature gradient underline */}
      <div className="h-[3px] bg-brand-gradient" />
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-base">
        <Routes>
          <Route path="/" element={<Navigate to="/quick-proposal" replace />} />
          <Route path="/quick-proposal" element={<><NavHeader /><QuickProposalPage /></>} />
          <Route path="/informed-analysis" element={<><NavHeader /><InformedAnalysisPage /></>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
