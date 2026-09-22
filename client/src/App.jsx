import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <div className="antialiased text-slate-800 dark:text-slate-100 min-h-screen">
            <AppRoutes />
          </div>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
