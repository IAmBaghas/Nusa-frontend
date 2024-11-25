import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from '../components/AdminSidebar';
import axios from 'axios';
import placeholder from '../assets/images/Placeholder.png';

const AdminLayout = () => {
  const location = useLocation();

  useEffect(() => {
    fetchHeaderSettings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const updateFavicon = (imageUrl) => {
    if (!imageUrl) return;

    // Add timestamp to bypass cache
    const timestamp = Date.now();
    const noCacheUrl = `${imageUrl}?t=${timestamp}`;

    // Remove existing icons
    const existingIcons = document.querySelectorAll("link[rel*='icon'], link[rel='apple-touch-icon']");
    existingIcons.forEach(icon => icon.parentNode.removeChild(icon));

    // Create meta tags for cache control
    const metaTags = [
      { httpEquiv: 'Cache-Control', content: 'no-cache, no-store, must-revalidate' },
      { httpEquiv: 'Pragma', content: 'no-cache' },
      { httpEquiv: 'Expires', content: '0' }
    ];

    metaTags.forEach(meta => {
      let metaTag = document.querySelector(`meta[http-equiv="${meta.httpEquiv}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.httpEquiv = meta.httpEquiv;
        document.head.appendChild(metaTag);
      }
      metaTag.content = meta.content;
    });

    // Create and add new favicons with forced reload
    const iconTypes = [
      { rel: 'icon', type: 'image/png' },
      { rel: 'apple-touch-icon', type: 'image/png' },
      { rel: 'shortcut icon', type: 'image/png' }
    ];

    iconTypes.forEach(iconType => {
      const link = document.createElement('link');
      link.rel = iconType.rel;
      link.type = iconType.type;
      link.href = noCacheUrl;
      document.head.appendChild(link);
    });

    // Force favicon refresh
    const tempLink = document.createElement('link');
    tempLink.rel = 'icon';
    tempLink.href = 'data:image/x-icon;base64,';
    document.head.appendChild(tempLink);

    setTimeout(() => {
      tempLink.remove();
      const favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.href = noCacheUrl;
      document.head.appendChild(favicon);
    }, 10);
  };

  const fetchHeaderSettings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/web-settings/component/header', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.data) {
        const imageUrl = response.data.image ? 
          `http://localhost:5000/uploads/header/${response.data.image.split('/').pop()}` : 
          null;

        // Update document title
        document.title = `Admin - ${response.data.title || 'SEKOLAH NUSANTARA'}`;

        // Update favicon if image exists
        if (imageUrl) {
          updateFavicon(imageUrl);
        } else {
          updateFavicon(placeholder);
        }
      }
    } catch (error) {
      console.error('Error loading header settings:', error);
      updateFavicon(placeholder);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <AdminSidebar />
      <div className="lg:pl-64">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout; 