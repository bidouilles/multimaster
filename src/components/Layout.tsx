import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Brain, Play, Home, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { icon: Home, label: 'Accueil', path: '/' },
    { icon: Brain, label: 'Apprendre', path: '/learn' },
    { icon: Play, label: "S'entraîner", path: '/practice' },
    { icon: BarChart3, label: 'Progrès', path: '/progress' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {user && (
        <div className="bg-white border-b border-gray-200 px-4 py-2">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Connecté en tant que <span className="font-medium">{user.displayName}</span>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center text-sm text-red-600 hover:text-red-700"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Déconnexion
            </button>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-around py-3">
            {navItems.map(({ icon: Icon, label, path }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex flex-col items-center space-y-1 ${
                  location.pathname === path
                    ? 'text-purple-600'
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}