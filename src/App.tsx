import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { Dashboard } from './components/Dashboard';
import { authService } from './lib/auth';
import type { NutricionistaUser } from './lib/auth';

type ViewMode = 'login' | 'register' | 'dashboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState<NutricionistaUser | null>(null);
  const [currentView, setCurrentView] = useState<ViewMode>('login');
  const [initializing, setInitializing] = useState(true);

  // Manter a sessão ativa e redirecionar se já logado
  useEffect(() => {
    const session = authService.getSession();
    if (session && session.user) {
      setCurrentUser(session.user);
      setCurrentView('dashboard');
    }
    setInitializing(false);
  }, []);

  const handleAuthSuccess = (user: NutricionistaUser) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentView('login');
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-nutri-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-slate-500">Iniciando Nutrifull...</span>
        </div>
      </div>
    );
  }

  // Se já estiver logado(a), sempre redireciona para o dashboard
  if (currentUser) {
    return <Dashboard user={currentUser} onLogout={handleLogout} />;
  }

  if (currentView === 'register') {
    return (
      <RegisterPage
        onSuccess={handleAuthSuccess}
        onNavigateToLogin={() => setCurrentView('login')}
      />
    );
  }

  return (
    <LoginPage
      onSuccess={handleAuthSuccess}
      onNavigateToRegister={() => setCurrentView('register')}
    />
  );
}
