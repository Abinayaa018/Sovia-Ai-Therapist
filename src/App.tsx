import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { AppProvider, useApp } from './context/AppContext';
import { AssessmentPage } from './pages/AssessmentPage';
import { DashboardPage } from './pages/DashboardPage';
import { HistoryPage } from './pages/HistoryPage';
import { LiveSessionPage } from './pages/LiveSessionPage';
import { LoginPage } from './pages/LoginPage';
import { MusicPage } from './pages/MusicPage';
import { ReportPage } from './pages/ReportPage';
import { SchedulePage } from './pages/SchedulePage';
import { SettingsPage } from './pages/SettingsPage';
import { WelcomePage } from './pages/WelcomePage';

const AppRoutes: React.FC = () => {
  const { user } = useApp();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/welcome" element={<WelcomePage />} />
      <Route path="/assessment" element={<AssessmentPage />} />

      <Route
        path="/dashboard"
        element={
          <AppLayout>
            <DashboardPage />
          </AppLayout>
        }
      />
      <Route
        path="/session"
        element={
          <AppLayout>
            <LiveSessionPage />
          </AppLayout>
        }
      />
      <Route
        path="/report"
        element={
          <AppLayout>
            <ReportPage />
          </AppLayout>
        }
      />
      <Route
        path="/schedule"
        element={
          <AppLayout>
            <SchedulePage />
          </AppLayout>
        }
      />
      <Route
        path="/music"
        element={
          <AppLayout>
            <MusicPage />
          </AppLayout>
        }
      />
      <Route
        path="/history"
        element={
          <AppLayout>
            <HistoryPage />
          </AppLayout>
        }
      />
      <Route
        path="/settings"
        element={
          <AppLayout>
            <SettingsPage />
          </AppLayout>
        }
      />

      <Route
        path="*"
        element={<Navigate to={user ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  );
};

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
