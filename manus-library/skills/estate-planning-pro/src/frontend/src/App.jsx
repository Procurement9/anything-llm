import { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Assets from './components/Assets';
import TaxCalculator from './components/TaxCalculator';
import Documents from './components/Documents';
import Terminal from './components/Terminal';
import Auth from './components/Auth';
import './App.css';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onPageChange={setCurrentPage} />;
      case 'assets':
        return <Assets />;
      case 'documents':
        return <Documents />;
      case 'taxes':
        return <TaxCalculator />;
      case 'terminal':
        return <Terminal />;
      case 'beneficiaries':
        return <div className="text-center py-12"><h2 className="text-2xl font-bold">Beneficiaries - Coming Soon</h2></div>;
      case 'reports':
        return <div className="text-center py-12"><h2 className="text-2xl font-bold">Reports - Coming Soon</h2></div>;
      default:
        return <Dashboard onPageChange={setCurrentPage} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
