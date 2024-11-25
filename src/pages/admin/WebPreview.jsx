import React, { useState, useEffect } from 'react';

const WebPreview = () => {
  const [loading, setLoading] = useState(true);
  const [previewSize, setPreviewSize] = useState('desktop');
  const [containerHeight, setContainerHeight] = useState('600px');

  useEffect(() => {
    const iframe = document.getElementById('preview-iframe');
    if (iframe) {
      iframe.onload = () => setLoading(false);
    }

    // Calculate container height based on viewport
    const updateHeight = () => {
      const viewportHeight = window.innerHeight;
      const topOffset = 270; // Height of header + controls + padding
      const newHeight = viewportHeight - topOffset;
      setContainerHeight(`${newHeight}px`);
    };

    // Initial calculation
    updateHeight();

    // Update on resize
    window.addEventListener('resize', updateHeight);

    // Cleanup
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const getPreviewStyles = () => {
    switch(previewSize) {
      case 'mobile':
        return {
          scale: '0.62',
          width: '480px',
          height: '100vh',
          marginLeft: '-8%'
        };
      case 'tablet':
        return {
          scale: '0.6',
          width: '768px',
          height: '100vh',
          marginLeft: '-13.5%'
        };
      default:
        return {
          scale: '0.6',
          width: '140%',
          height: '100vh',
          marginLeft: '-28%'
        };
    }
  };

  const styles = getPreviewStyles();

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Web Preview</h1>
      </div>

      <div className="relative bg-white rounded-lg shadow-md p-4">
        {/* Preview Control */}
        <div className="mb-4 flex justify-center">
          <span className="inline-flex -space-x-px overflow-hidden rounded-md border bg-white shadow-sm">
            <button
              onClick={() => setPreviewSize('desktop')}
              className={`inline-block px-4 py-2 text-sm font-medium ${
                previewSize === 'desktop' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              } focus:relative`}
            >
              Desktop
            </button>

            <button
              onClick={() => setPreviewSize('tablet')}
              className={`inline-block px-4 py-2 text-sm font-medium ${
                previewSize === 'tablet' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              } focus:relative`}
            >
              Tablet
            </button>

            <button
              onClick={() => setPreviewSize('mobile')}
              className={`inline-block px-4 py-2 text-sm font-medium ${
                previewSize === 'mobile' 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50'
              } focus:relative`}
            >
              Mobile
            </button>
          </span>
        </div>

        {/* Preview Container - Dynamic Height */}
        <div 
          className="relative w-full overflow-hidden transition-all duration-300"
          style={{ height: containerHeight }}
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          )}
          
          {/* Preview Wrapper */}
          <div className="w-full h-full overflow-hidden bg-white relative">
            <div 
              className="transform mx-auto absolute left-1/2"
              style={{ 
                transform: `scale(${styles.scale}) translateX(-50%)`,
                width: styles.width,
                marginLeft: styles.marginLeft || '0',
                transformOrigin: 'top center',
                transition: 'all 0.3s ease',
              }}
            >
              <iframe
                id="preview-iframe"
                src="/"
                className="w-full"
                style={{ 
                  border: previewSize !== 'desktop' ? '1px solid #e5e7eb' : 'none',
                  borderRadius: previewSize !== 'desktop' ? '8px' : '0',
                  pointerEvents: 'auto',
                  height: '100vh'
                }}
                title="Website Preview"
              />
            </div>
          </div>
        </div>

        {/* Button */}
        <div className="mt-4 flex items-center justify-between">
          <div></div>
          <button
            onClick={() => window.open('/', '_blank')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Laman Penuh
          </button>
        </div>
      </div>
    </div>
  );
};

export default WebPreview; 