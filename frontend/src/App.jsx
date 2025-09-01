import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
// Component Imports
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Page Imports
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SportsHomePage from './pages/SportsHomePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ClubHomePage from './pages/ClubHomePage';
import AboutPage from './pages/AboutPage';
import MembershipPage from './pages/MembershipPage';
import RenewPage from './pages/RenewPage';
import SponsorshipPage from './pages/SponsorshipPage';
import SponsorshipManagePage from './pages/SponsorshipManagePage';

import PlayerProfilePage from './pages/PlayerProfilePage';


function App() {
  return (
    <AuthProvider>
    <Router>
      <div className="bg-gray-50 min-h-screen">
        <Navbar />
        <main className="container mx-auto p-4 md-p-6">
          <Routes>
            {/* --- PUBLIC ROUTES --- */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/sports" element={<SportsHomePage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/resetPassword/:token" element={<ResetPasswordPage />} />
            <Route path="/club" element={<ClubHomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/membership" element={<MembershipPage />} />
            <Route path="/renew-membership" element={<RenewPage />} />
            <Route path="/sponsorship" element={<SponsorshipPage />} />
            <Route path="/sponsorship/manage/:id" element={<SponsorshipManagePage />} />

           
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/my-profile"
              element={
                <ProtectedRoute>
                  <PlayerProfilePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;