import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from '../Toast';

const LogoSettings = () => {
  const [logos, setLogos] = useState([]);
  const [sectionEnabled, setSectionEnabled] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/web-settings/component/logos');
      if (response.data) {
        const updatedLogos = response.data.logos?.map(logo => 
          logo ? `http://localhost:5000/uploads/logo/${logo.split('/').pop()}` : null
        ) || [];
        setLogos(updatedLogos);
        setSectionEnabled(response.data.enabled || false);
      }
    } catch (error) {
      console.error('Error loading logo settings:', error);
      setToast({
        show: true,
        message: 'Failed to load logo settings',
        type: 'error'
      });
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.filter(file => file.size > 500 * 1024).length > 0) {
      setToast({
        show: true,
        message: 'Some images are too large. Maximum size per logo is 500KB.',
        type: 'error'
      });
      return;
    }

    if (logos.length + files.length > 12) {
      setToast({
        show: true,
        message: 'Maximum 12 logos allowed.',
        type: 'error'
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      files.forEach(file => {
        formData.append('logos', file);
      });

      const uploadResponse = await axios.post(
        'http://localhost:5000/api/web-settings/upload/logo',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const newLogoPaths = uploadResponse.data.paths.map(path => 
        `http://localhost:5000/uploads/logo/${path}`
      );

      const newLogos = [...logos, ...newLogoPaths];
      await saveSettings(newLogos, sectionEnabled);
      setLogos(newLogos);
      
      setToast({
        show: true,
        message: 'Logos uploaded successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error uploading logos:', error);
      setToast({
        show: true,
        message: 'Failed to upload logos',
        type: 'error'
      });
    }
  };

  const handleDeleteLogo = async (index) => {
    try {
      const newLogos = logos.filter((_, i) => i !== index);
      await saveSettings(newLogos, sectionEnabled);
      setLogos(newLogos);
      setToast({
        show: true,
        message: 'Logo deleted successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error deleting logo:', error);
      setToast({
        show: true,
        message: 'Failed to delete logo',
        type: 'error'
      });
    }
  };

  const handleToggleSection = async (enabled) => {
    try {
      await saveSettings(logos, enabled);
      setSectionEnabled(enabled);
      setToast({
        show: true,
        message: `Logo section ${enabled ? 'enabled' : 'disabled'} successfully`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error toggling section:', error);
      setToast({
        show: true,
        message: 'Failed to update section status',
        type: 'error'
      });
    }
  };

  const saveSettings = async (newLogos, enabled) => {
    try {
      await axios.put(
        'http://localhost:5000/api/web-settings/component/logos',
        {
          settings: {
            logos: newLogos,
            enabled: enabled
          }
        }
      );
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Logo Section</h3>
          <p className="text-sm text-gray-500">Kelola logo instansi, partner dan sponsor</p>
        </div>
        <label className="label cursor-pointer">
          <input 
            type="checkbox" 
            className="toggle toggle-primary" 
            checked={sectionEnabled}
            onChange={(e) => handleToggleSection(e.target.checked)}
            disabled={logos.length === 0}
          />
          <span className="label-text ml-2">{sectionEnabled ? 'Aktif' : 'Nonaktif'}</span>
        </label>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {logos.map((logo, index) => (
            <div key={index} className="relative group">
              <div className="aspect-video bg-gray-50 rounded-lg p-4 flex items-center justify-center border-2 border-gray-100 hover:border-primary transition-colors">
                <img
                  src={logo}
                  alt={`Logo ${index + 1}`}
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={() => handleDeleteLogo(index)}
                  className="btn btn-circle btn-sm btn-error absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          
          <label className="aspect-video flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-primary transition-colors">
            <div className="flex flex-col items-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span className="mt-2 text-sm font-medium text-gray-600">Add Logo</span>
              <span className="mt-1 text-xs text-gray-500">Max. 500KB</span>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
            />
          </label>
        </div>

        {logos.length === 0 && (
          <div className="alert alert-info">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Tidak ada logo yang diunggah. Unggah logo untuk mengaktifkan bagian ini.</span>
          </div>
        )}
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};

export default LogoSettings; 