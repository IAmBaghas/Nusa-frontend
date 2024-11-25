import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from "@material-tailwind/react";
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard'; 
import Home from './pages/Home'; 
import AdminAuthWrapper from './components/AdminAuthWrapper';

const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// eslint-disable-next-line no-unused-vars
const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/" />;
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />

          <Route
            path="/admin/*"
            element={
              <AdminAuthWrapper>
                <AdminDashboard />
              </AdminAuthWrapper>
            }
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
