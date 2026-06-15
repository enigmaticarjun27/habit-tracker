import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HabitProvider } from './context/HabitContext';
import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './pages/Dashboard';
import HabitTracker from './pages/HabitTracker';
import Analytics from './pages/Analytics';
import Goals from './pages/Goals';
import Streaks from './pages/Streaks';
import Settings from './pages/Settings';

export default function App() {
  return (
    <ErrorBoundary>
    <HabitProvider>
      <BrowserRouter>
        <div className="flex h-screen overflow-hidden bg-[#0A0A0F]">
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tracker" element={<HabitTracker />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/streaks" element={<Streaks />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </HabitProvider>
    </ErrorBoundary>
  );
}
