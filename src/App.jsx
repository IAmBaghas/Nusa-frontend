import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminLayout from './layouts/AdminLayout';
import DashboardHome from './pages/admin/DashboardHome';
import WebEdit from './pages/admin/WebEdit';
import GalleryManagement from './pages/admin/GalleryManagement';
import PostsManagement from './pages/admin/PostsManagement';
import AgendaManagement from './pages/admin/AgendaManagement';
import PrivateRoute from './components/PrivateRoute';
import MobileManagement from './pages/admin/MobileManagement';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
          <Route index element={<DashboardHome />} />
          <Route path="web-edit" element={<WebEdit />} />
          <Route path="gallery" element={<GalleryManagement />} />
          <Route path="posts" element={<PostsManagement />} />
          <Route path="agenda" element={<AgendaManagement />} />
          <Route path="mobile" element={<MobileManagement />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App; 