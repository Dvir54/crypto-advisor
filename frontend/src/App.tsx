import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignupPage, LoginPage, DashboardPage, OnboardingPage } from './pages';
import { ProtectedRoute } from './components';
import './App.css';

function App() {
  return (
    <Router>
      <a href="#main-content" className="sr-only">Skip to main content</a>
      <div id="app" role="application">
        <Routes>
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
