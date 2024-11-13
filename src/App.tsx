import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Learn } from './pages/Learn';
import { Practice } from './pages/Practice';
import { Progress } from './pages/Progress';
import { Auth } from './pages/Auth';
import { Layout } from './components/Layout';
import { GameProvider } from './context/GameContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Chargement...</div>;
  }
  
  return user ? <>{children}</> : <Navigate to="/auth" />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GameProvider>
          <Layout>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
              <Route path="/learn" element={<PrivateRoute><Learn /></PrivateRoute>} />
              <Route path="/practice" element={<PrivateRoute><Practice /></PrivateRoute>} />
              <Route path="/progress" element={<PrivateRoute><Progress /></PrivateRoute>} />
            </Routes>
          </Layout>
        </GameProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;