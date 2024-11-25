import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '../components/AdminSidebar';
import { Routes, Route } from 'react-router-dom';
import WebEdit from './admin/WebEdit';
import GalleryManagement from './admin/GalleryManagement';
import PostsManagement from './admin/PostsManagement';
import AgendaManagement from './admin/AgendaManagement';
import DashboardHome from './admin/DashboardHome';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalGalleries: 0,
    totalPhotos: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/gallery/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Navbar */}
      <div className="lg:hidden">
        <AdminSidebar />
      </div>

      {/* Desktop Layout */}
      <div className="flex">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <AdminSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="p-4 md:p-6 lg:p-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="card bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-medium text-gray-500">Total Gallery</h2>
                      <p className="text-2xl font-semibold mt-1">{stats.totalGalleries}</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-medium text-gray-500">Total Foto</h2>
                      <p className="text-2xl font-semibold mt-1">{stats.totalPhotos}</p>
                    </div>
                    <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Routes>
              <Route index element={<DashboardHome />} />
              <Route path="web-edit" element={<WebEdit />} />
              <Route path="gallery" element={<GalleryManagement />} />
              <Route path="posts" element={<PostsManagement />} />
              <Route path="agenda" element={<AgendaManagement />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 