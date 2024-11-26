import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import axios from 'axios';
import Toast from '../Toast';
import placeholder from '../../assets/images/Placeholder.png';

const AboutSettings = () => {
  const [content, setContent] = useState({
    name: '',
    title: '',
    description: '',
    image: null,
    vision: '',
    missions: []
  });
  const [showCropper, setShowCropper] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aboutImage, setAboutImage] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/web-settings/component/about');
      if (response.data) {
        const updatedContent = {
          ...response.data,
          image: response.data.image ? 
            `http://localhost:5000/uploads/about/${response.data.image.split('/').pop()}` : 
            null
        };
        setContent(updatedContent);
      }
    } catch (error) {
      console.error('Error loading about settings:', error);
      setToast({
        show: true,
        message: 'Failed to load about settings',
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

    canvas.width = 600;
    canvas.height = 800;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      600,
      800
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
      setAboutImage(image);
    } catch (e) {
      console.error(e);
    }
  }, [cropImage, getCroppedImg]);

  const handleSave = async () => {
    try {
      await axios.put(
        'http://localhost:5000/api/web-settings/component/about',
        { settings: content }
      );

      setToast({
        show: true,
        message: 'About settings saved successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error saving about settings:', error);
      setToast({
        show: true,
        message: 'Failed to save settings',
        type: 'error'
      });
    }
  };

  const handleSaveImage = async () => {
    if (!aboutImage) return;

    try {
      const formData = new FormData();
      formData.append('image', aboutImage, 'headmaster.png');

      const uploadResponse = await axios.post(
        'http://localhost:5000/api/web-settings/upload/about',
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
        image: `http://localhost:5000/uploads/about/${imagePath}`
      };

      await axios.put(
        'http://localhost:5000/api/web-settings/component/about',
        { settings: updatedContent }
      );

      setContent(updatedContent);
      setShowCropper(false);
      setToast({
        show: true,
        message: 'Image saved successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error saving image:', error);
      setToast({
        show: true,
        message: 'Failed to save image',
        type: 'error'
      });
    }
  };

  const handleAddMission = () => {
    setContent(prev => ({
      ...prev,
      missions: [...prev.missions, '']
    }));
  };

  const handleRemoveMission = (index) => {
    setContent(prev => ({
      ...prev,
      missions: prev.missions.filter((_, i) => i !== index)
    }));
  };

  const handleMissionChange = (index, value) => {
    setContent(prev => ({
      ...prev,
      missions: prev.missions.map((mission, i) => 
        i === index ? value : mission
      )
    }));
  };

  const renderImagePreview = () => {
    if (showCropper) {
      return (
        <div className="space-y-4">
          <div className="relative w-full h-[400px] rounded-lg overflow-hidden border-2 border-base-200">
            <Cropper
              image={cropImage}
              crop={crop}
              zoom={zoom}
              aspect={3/4}
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
              className="btn btn-primary"
            >
              Simpan Foto
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-4">
        <div className="w-48 h-64 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-base-200">
          {content.image ? (
            <img
              src={content.image}
              alt="Headmaster Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Failed to load image:', content.image);
                e.target.src = placeholder;
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-base-content/30">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm mt-2">No Image</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label className="btn btn-primary">
            Unggah Foto
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </label>
          {content.image && (
            <button
              onClick={() => setContent({ ...content, image: null })}
              className="btn btn-outline btn-error btn-sm"
            >
              Hapus Foto
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header Card */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">About Section</h3>
          <p className="text-sm text-gray-500">Kustomisasi informasi kepala sekolah dan profil sekolah</p>
        </div>
      </div>

      {/* Headmaster Profile Section */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium">Profil Kepala Sekolah</h4>
        
        {/* Image Upload */}
        <div className="space-y-4">
          <label className="label">
            <span className="label-text font-medium">Foto Kepala Sekolah</span>
          </label>
          {renderImagePreview()}
        </div>

        {/* Headmaster Details */}
        <div className="grid gap-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Nama Lengkap</span>
            </label>
            <input
              type="text"
              value={content.name}
              onChange={(e) => setContent(prev => ({ ...prev, name: e.target.value }))}
              className="input input-bordered w-full"
              placeholder="Masukkan Nama"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Jabatan</span>
            </label>
            <input
              type="text"
              value={content.title}
              onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
              className="input input-bordered w-full"
              placeholder="Contoh: Kepala Sekolah"
            />
          </div>
        </div>
      </div>

      <div className="divider"></div>

      {/* School Profile Section */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium">Profil Sekolah</h4>
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Deskripsi Sekolah</span>
          </label>
          <textarea
            value={content.description}
            onChange={(e) => setContent(prev => ({ ...prev, description: e.target.value }))}
            className="textarea textarea-bordered min-h-[200px] whitespace-pre-wrap"
            placeholder="Masukkan deskripsi lengkap tentang sekolah"
          />
        </div>
      </div>

      <div className="divider"></div>

      {/* Vision & Mission Section */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium">Visi & Misi</h4>
        <div className="grid gap-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Visi</span>
            </label>
            <textarea
              value={content.vision}
              onChange={(e) => setContent(prev => ({ ...prev, vision: e.target.value }))}
              className="textarea textarea-bordered min-h-[100px]"
              placeholder="Masukkan visi sekolah"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Misi</span>
            </label>
            <div className="space-y-4">
              {content.missions.map((mission, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={mission}
                    onChange={(e) => handleMissionChange(index, e.target.value)}
                    className="input input-bordered flex-1"
                    placeholder={`Misi ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveMission(index)}
                    className="btn btn-square btn-error"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddMission}
                className="btn btn-outline btn-primary w-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Tambah Misi
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t">
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

export default AboutSettings; 