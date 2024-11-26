import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import Toast from '../Toast';
import axios from 'axios';

const BannerSettings = () => {
  const [content, setContent] = useState({
    image: null,
    text: {
      welcome: '',
      title: '',
      subtitle: ''
    }
  });
  const [showCropper, setShowCropper] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [bannerImage, setBannerImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/web-settings/component/banner');
      if (response.data) {
        const updatedContent = {
          ...response.data,
          image: response.data.image ? `http://localhost:5000/uploads/banner/${response.data.image.split('/').pop()}` : null
        };
        setContent(updatedContent);
      }
    } catch (error) {
      setToast({
        show: true,
        message: 'Failed to load banner settings',
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

    canvas.width = 1920;
    canvas.height = 1080;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      1920,
      1080
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.8);
    });
  }, [createImage]);

  const onCropComplete = useCallback(async (croppedArea, croppedAreaPixels) => {
    try {
      const image = await getCroppedImg(cropImage, croppedAreaPixels);
      setBannerImage(image);
    } catch (e) {
      console.error(e);
    }
  }, [cropImage, getCroppedImg]);

  const handleSaveImage = async () => {
    if (!bannerImage) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', bannerImage, 'banner.png');

      const uploadResponse = await axios.post(
        'http://localhost:5000/api/web-settings/upload/banner',
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
        image: `http://localhost:5000/uploads/banner/${imagePath}`
      };

      await axios.put(
        'http://localhost:5000/api/web-settings/component/banner',
        { settings: updatedContent }
      );

      setContent(updatedContent);
      setShowCropper(false);
      setCropImage(null);
      setToast({
        show: true,
        message: 'Banner image saved successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error saving banner image:', error);
      setToast({
        show: true,
        message: error.response?.data?.message || 'Failed to save banner image',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitText = async () => {
    try {
      const response = await axios.put(
        'http://localhost:5000/api/web-settings/component/banner',
        { 
          settings: content 
        },
        { 
          headers: { 
            'Content-Type': 'application/json'
          } 
        }
      );

      if (response.data.status === 'success') {
        setToast({
          show: true,
          message: 'Banner text saved successfully',
          type: 'success'
        });
      } else {
        throw new Error(response.data.message || 'Failed to save banner text');
      }
    } catch (error) {
      console.error('Error saving banner text:', error);
      setToast({
        show: true,
        message: error.response?.data?.message || error.message || 'Failed to save banner text',
        type: 'error'
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Card */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Banner Section</h3>
          <p className="text-sm text-gray-500">Kustomisasi banner website dengan gambar dan teks</p>
        </div>
      </div>

      {/* Image Upload Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium">Foto Banner</h4>
        </div>

        {showCropper ? (
          <div className="space-y-4">
            <div className="relative w-full h-[400px] rounded-lg overflow-hidden border-2 border-base-200">
              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                aspect={16 / 9}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCropper(false);
                  setCropImage(null);
                }}
                className="btn btn-ghost"
              >
                Batal
              </button>
              <button
                onClick={handleSaveImage}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Menyimpan...
                  </>
                ) : 'Simpan Gambar'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-base-200 border-dashed rounded-lg cursor-pointer hover:bg-base-200 transition-all duration-300">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <div className="p-4 rounded-full bg-primary/10 text-primary">
                  <svg className="w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="mt-4 text-sm text-base-content/70">
                  <span className="font-semibold text-primary">Klik untuk upload</span> atau drag and drop
                </p>
                <p className="mt-1 text-xs text-base-content/60">PNG, JPG atau WEBP (Maks. 2MB)</p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
                disabled={loading}
              />
            </label>
          </div>
        )}
      </div>

      {/* Banner Text Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium">Teks Banner</h4>
          <button
            type="button"
            onClick={handleSubmitText}
            className="btn btn-primary btn-sm"
          >
            Simpan Perubahan
          </button>
        </div>

        <div className="grid gap-6">
          {[
            { label: 'Teks Sambutan', key: 'welcome', placeholder: 'Masukkan teks sambutan' },
            { label: 'Judul Utama', key: 'title', placeholder: 'Masukkan judul utama' },
            { label: 'Sub Judul', key: 'subtitle', placeholder: 'Masukkan sub judul' }
          ].map((field) => (
            <div key={field.key} className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">{field.label}</span>
              </label>
              <input
                type="text"
                value={content.text[field.key]}
                onChange={(e) => setContent({
                  ...content,
                  text: { ...content.text, [field.key]: e.target.value }
                })}
                className="input input-bordered w-full"
                placeholder={field.placeholder}
              />
            </div>
          ))}
        </div>
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

export default BannerSettings;