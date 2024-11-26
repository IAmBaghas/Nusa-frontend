import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import axios from 'axios';
import Toast from '../Toast';

const HeaderSettings = () => {
  const [content, setContent] = useState({
    image: null,
    title: 'Sekolah Nusantara',
    subtitle: 'Instansi Pendidikan',
    backgroundColor: '#F6F6F6',
    titleColor: '#000000',
    subtitleColor: '#000000'
  });

  const [showCropper, setShowCropper] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [headerImage, setHeaderImage] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false);

  const setDefaultTitle = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/web-settings/component/header');
      if (response.data?.title) {
        document.title = response.data.title;
      } else {
        document.title = 'SEKOLAH NUSANTARA'; // Fallback title
      }
    } catch (error) {
      console.error('Error loading title:', error);
      document.title = 'SEKOLAH NUSANTARA'; // Fallback title if API fails
    }
  };

  useEffect(() => {
    setDefaultTitle();
  }, []);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/web-settings/component/header');
      if (response.data) {
        // Update image path if exists
        const updatedContent = {
          ...response.data,
          image: response.data.image ? `http://localhost:5000/uploads/header/${response.data.image.split('/').pop()}` : null
        };
        setContent(updatedContent);
      }
    } catch (error) {
      console.error('Error loading header settings:', error);
      setToast({
        show: true,
        message: 'Failed to load header settings',
        type: 'error'
      });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setCropImage(reader.result);
      setShowCropper(true);
    });
    reader.readAsDataURL(file);
  };

  const createImage = useCallback((url) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.src = url;
    }), []);

  const getCroppedImg = useCallback(async (imageSrc, pixelCrop) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 200;
    canvas.height = 200;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      200,
      200
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png', 1);
    });
  }, [createImage]);

  const onCropComplete = useCallback(async (croppedArea, croppedAreaPixels) => {
    try {
      const image = await getCroppedImg(cropImage, croppedAreaPixels);
      setHeaderImage(image);
    } catch (e) {
      console.error(e);
    }
  }, [cropImage, getCroppedImg]);

  const handleSave = async () => {
    try {
      await axios.put(
        'http://localhost:5000/api/web-settings/component/header',
        { settings: content }
      );

      setToast({
        show: true,
        message: 'Header settings saved successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error saving header settings:', error);
      setToast({
        show: true,
        message: 'Failed to save header settings',
        type: 'error'
      });
    }
  };

  const handleSaveImage = async () => {
    if (!headerImage) return;

    try {
      const formData = new FormData();
      formData.append('image', headerImage, 'header.png');

      const uploadResponse = await axios.post(
        'http://localhost:5000/api/web-settings/upload/header',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const imagePath = uploadResponse.data.path;

      const updatedContent = {
        ...content,
        image: `http://localhost:5000/uploads/header/${imagePath}`
      };

      await axios.put(
        'http://localhost:5000/api/web-settings/component/header',
        { settings: updatedContent }
      );

      setContent(updatedContent);
      setShowCropper(false);
      setToast({
        show: true,
        message: 'Header image saved successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error saving header image:', error);
      setToast({
        show: true,
        message: error.response?.data?.message || 'Failed to save header image',
        type: 'error'
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Card */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Header Section</h3>
          <p className="text-sm text-gray-500">Kustomisasi tampilan header website</p>
        </div>
      </div>

      {/* Komponen Header Section */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium">Komponen Header</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Upload */}
          <div className="space-y-2">
            <label className="label-text font-medium">Logo</label>
            {showCropper ? (
              <div className="space-y-4">
                <div className="relative w-full h-[400px] rounded-lg overflow-hidden border-2 border-base-200">
                  <Cropper
                    image={cropImage}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button onClick={() => { setShowCropper(false); setCropImage(null); }} className="btn btn-ghost">
                    Batal
                  </button>
                  <button onClick={handleSaveImage} className="btn btn-primary">
                    Simpan Logo
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-base-200">
                  {content.image ? (
                    <img src={content.image} alt="Logo Preview" className="w-full h-full object-contain" style={{ backgroundColor: 'transparent' }} />
                  ) : (
                    <svg className="w-8 h-8 text-base-content/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <label className="btn btn-primary">
                  Unggah Logo Baru
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
            )}
          </div>

          {/* Background Color */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Background Color</span>
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={content.backgroundColor}
                onChange={(e) => setContent(prev => ({ ...prev, backgroundColor: e.target.value }))}
                className="w-14 h-14 rounded cursor-pointer"
              />
              <input
                type="text"
                value={content.backgroundColor}
                onChange={(e) => setContent(prev => ({ ...prev, backgroundColor: e.target.value }))}
                className="input input-bordered flex-1"
                placeholder="#F6F6F6"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="divider"></div>

      {/* Text Content Section */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium">Text Content</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title with Color */}
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Title</span>
              </label>
              <input
                type="text"
                value={content.title}
                onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
                className="input input-bordered w-full"
                placeholder="Enter title"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Title Color</span>
              </label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={content.titleColor}
                  onChange={(e) => setContent(prev => ({ ...prev, titleColor: e.target.value }))}
                  className="w-14 h-14 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={content.titleColor}
                  onChange={(e) => setContent(prev => ({ ...prev, titleColor: e.target.value }))}
                  className="input input-bordered flex-1"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>

          {/* Subtitle with Color */}
          <div className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Subtitle</span>
              </label>
              <input
                type="text"
                value={content.subtitle}
                onChange={(e) => setContent(prev => ({ ...prev, subtitle: e.target.value }))}
                className="input input-bordered w-full"
                placeholder="Enter subtitle"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Subtitle Color</span>
              </label>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={content.subtitleColor}
                  onChange={(e) => setContent(prev => ({ ...prev, subtitleColor: e.target.value }))}
                  className="w-14 h-14 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={content.subtitleColor}
                  onChange={(e) => setContent(prev => ({ ...prev, subtitleColor: e.target.value }))}
                  className="input input-bordered flex-1"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-6 border-t">
        <button onClick={handleSave} className="btn btn-primary">
          Simpan Perubahan
        </button>
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

export default HeaderSettings; 