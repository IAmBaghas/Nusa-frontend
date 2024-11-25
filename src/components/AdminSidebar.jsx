import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiSmartphone } from 'react-icons/fi';
import axios from 'axios';
import placeholder from '../assets/images/Placeholder.png';

export const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [headerContent, setHeaderContent] = useState({
    image: null,
    title: 'SEKOLAH NUSANTARA'
  });

  useEffect(() => {
    fetchHeaderSettings();
  }, []);

  const fetchHeaderSettings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/web-settings/component/header');
      if (response.data) {
        setHeaderContent({
          image: response.data.image || null,
          title: response.data.title || 'SEKOLAH NUSANTARA'
        });
      }
    } catch (error) {
      console.error('Error loading header settings:', error);
      // Keep default values if there's an error
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === `/admin${path}` ? "bg-primary text-white" : "";
  };

  const menuItems = [
    { path: '', label: 'Dashboard' },
    { path: '/web-edit', label: 'Manajemen Website' },
    { path: '/gallery', label: 'Manajemen Gallery' },
    { path: '/posts', label: 'Manajemen Postingan' },
    { path: '/agenda', label: 'Manajemen Agenda' },
    { path: '/mobile', label: 'Manajemen Mobile', icon: <FiSmartphone className="w-4 h-4" /> }
  ];

  const handleImageError = (e) => {
    e.target.src = placeholder;
  };

  return (
    <>
      {/* Mobile Navbar - Sticky Top */}
      <div className="lg:hidden sticky top-0 left-0 right-0 z-50">
        <div className="navbar bg-base-100 shadow-md">
          <div className="flex-1">
            <img 
              src={headerContent.image || placeholder} 
              alt="Logo"
              className="h-8 w-auto object-contain"
              onError={handleImageError}
            />
          </div>
          <div className="flex-none">
            <button 
              className="btn btn-square btn-ghost"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <div className="fixed inset-0 top-16 z-40">
            <div className="bg-base-100 shadow-lg border-t">
              <div className="p-4 space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={`/admin${item.path}`}
                    className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-primary hover:text-white ${isActive(item.path)}`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="w-full rounded-lg px-4 py-3 text-sm font-medium text-error hover:bg-error hover:text-white text-left transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-screen flex-col justify-between bg-base-100 border-r w-64 fixed">
        {/* Logo Section */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <img 
              src={headerContent.image || placeholder} 
              alt="Logo"
              className="h-10 w-auto object-contain"
              onError={handleImageError}
            />
            <span className="font-semibold text-sm">
              Admin Panel
            </span>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 px-3 py-4">
          <ul className="menu menu-lg gap-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={`/admin${item.path}`}
                  className={`rounded-lg transition-colors hover:bg-primary hover:text-white text-sm ${isActive(item.path)}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="btn btn-error btn-outline w-full"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
};
