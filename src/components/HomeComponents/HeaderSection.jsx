import React, { useState, useEffect } from 'react';
import axios from 'axios';
import placeholder from '../../assets/images/Placeholder.png';

const HeaderSection = () => {
  const [content, setContent] = useState({
    image: null,
    title: 'SEKOLAH NUSANTARA',
    subtitle: 'PUSAT KEUNGGULAN',
    backgroundColor: '#F6F6F6',
    titleColor: '#000000',
    subtitleColor: '#000000'
  });

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/favicon-worker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful');
        })
        .catch(err => {
          console.log('ServiceWorker registration failed: ', err);
        });
    }

    fetchHeaderSettings();

    // Add event listener for route changes
    const handleRouteChange = () => {
      fetchHeaderSettings();
    };

    window.addEventListener('popstate', handleRouteChange);
    const pushState = window.history.pushState;
    window.history.pushState = function() {
      pushState.apply(window.history, arguments);
      handleRouteChange();
    };

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.history.pushState = pushState;
    };
  }, []);

  const updateTitleAndFavicon = (title, imageUrl) => {
    const isAdminPage = window.location.pathname.includes('/admin');
    document.title = isAdminPage ? `Admin - ${title}` : title || 'SEKOLAH NUSANTARA';

    if (imageUrl) {
      updateFavicon(imageUrl);
      // Store current favicon URL in localStorage for persistence
      localStorage.setItem('currentFavicon', imageUrl);
      localStorage.setItem('faviconTimestamp', Date.now().toString());
    }
  };

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

    // Force favicon refresh for admin pages
    if (window.location.pathname.includes('/admin')) {
      // Create a temporary blank favicon to force refresh
      const tempLink = document.createElement('link');
      tempLink.rel = 'icon';
      tempLink.href = 'data:image/x-icon;base64,';
      document.head.appendChild(tempLink);

      // Remove temp favicon and add actual favicon after a brief delay
      setTimeout(() => {
        tempLink.remove();
        const favicon = document.createElement('link');
        favicon.rel = 'icon';
        favicon.href = noCacheUrl;
        document.head.appendChild(favicon);
      }, 10);
    }
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
        const updatedContent = {
          ...response.data,
          image: response.data.image ? 
            `http://localhost:5000/uploads/header/${response.data.image.split('/').pop()}` : 
            null
        };
        
        setContent(updatedContent);
        
        if (updatedContent.image) {
          // Force immediate favicon update
          updateTitleAndFavicon(updatedContent.title, updatedContent.image);
          
          // Set up periodic favicon refresh for admin pages
          if (window.location.pathname.includes('/admin')) {
            const refreshInterval = setInterval(() => {
              updateFavicon(updatedContent.image);
            }, 1000); // Check every second

            // Clean up interval on component unmount
            return () => clearInterval(refreshInterval);
          }
        }
      }
    } catch (error) {
      console.error('Error loading header settings:', error);
    }
  };

  const handleImageError = (e) => {
    console.error('Failed to load header image:', content.image);
    e.target.src = placeholder;
  };

  return (
    <div 
      className="fixed top-0 left-0 right-0 lg:h-20 h-16 shadow-md z-[9999]"
      style={{ backgroundColor: content.backgroundColor }}
    >
      <div className="flex px-[32px] py-2">
        <img 
          src={content.image || placeholder} 
          className="h-8 lg:h-12 mt-[6px] object-contain" 
          alt="Logo" 
          onError={handleImageError}
        />
        <div className="flex flex-col px-2 pt-[2px]">
          <p 
            className="text-[21px] lg:text-[25px] font-bold"
            style={{ color: content.titleColor }}
          >
            {content.title}
          </p>
          <p 
            className="text-sm lg:text-base mt-[-8px]"
            style={{ color: content.subtitleColor }}
          >
            {content.subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeaderSection; 