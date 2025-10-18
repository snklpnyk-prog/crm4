import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { initializeDatabase } from './lib/initializeDb';

function AppContent() {
  const { user } = useAuth();
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    const initDb = async () => {
      const initialized = await initializeDatabase();
      setDbInitialized(initialized);
    };

    initDb();
  }, []);

  if (!user) {
    return <LoginPage />;
  }

  return <Dashboard />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
