
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from './components/AuthProvider';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import Index from './pages/Index';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Remove auth route and redirect to setup */}
            <Route path="/auth" element={<Navigate to="/setup" replace />} />
            <Route path="/login" element={<Navigate to="/setup" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
