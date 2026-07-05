import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { HomePage } from './pages/HomePage';
import { SortingPage } from './pages/SortingPage';
import { GraphPage } from './pages/GraphPage';
import { TreePage } from './pages/TreePage';
import { LinkedListPage } from './pages/LinkedListPage';
import { MonotonicStackPage } from './pages/MonotonicStackPage';
import './index.css';

// Pages that need fixed-height (no scroll) — everything fills the viewport
const FIXED_HEIGHT_ROUTES = ['/sorting', '/graphs', '/trees', '/linked-list', '/monotonic-stack'];

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isFixedHeight = FIXED_HEIGHT_ROUTES.some(r => location.pathname.startsWith(r));

  return (
    <div style={{ minHeight: '100vh', background: '#020617' }}>
      <Navbar onToggleSidebar={() => setSidebarOpen(o => !o)} isSidebarOpen={sidebarOpen} />

      <div className="flex" style={{ paddingTop: 48 }}>
        <Sidebar isOpen={sidebarOpen} />

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 lg:hidden"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main
          style={{
            marginLeft: 224,
            width: 'calc(100% - 224px)',
            height: 'calc(100vh - 48px)',
            display: 'flex',
            flexDirection: 'column',
            // Visualizer pages: fixed height, no scroll. Homepage: scrollable.
            overflow: isFixedHeight ? 'hidden' : 'auto',
          }}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/sorting" element={<SortingPage />} />
            <Route path="/graphs" element={<GraphPage />} />
            <Route path="/trees" element={<TreePage />} />
            <Route path="/linked-list" element={<LinkedListPage />} />
            <Route path="/monotonic-stack" element={<MonotonicStackPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
