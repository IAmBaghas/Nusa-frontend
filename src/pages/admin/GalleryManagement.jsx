import React, { useState, useEffect, useCallback } from 'react';
import { PhotoIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import Viewer from 'viewerjs';
import 'viewerjs/dist/viewer.css';
import GalleryAlert from '../../components/AlertModal/galleryAlert';
import axios from 'axios';
import { FiEdit2, FiCheck, FiX } from 'react-icons/fi';

// Custom hook for ViewerJS
const useImageViewer = (selectedGalleryId) => {
  const [viewer, setViewer] = useState(null);

  const initViewer = useCallback((images, startIndex = 0) => {
    // Cleanup previous viewer if exists
    if (viewer) {
      viewer.destroy();
    }

    // Create container for images
    const container = document.createElement('div');
    container.className = 'image-viewer-container';
    
    // Add images to container with correct path
    images.forEach(image => {
      const img = document.createElement('img');
      // Use the correct path format for gallery images
      img.src = `http://localhost:5000/uploads/gallery/${selectedGalleryId}/${image.file}`;
      img.alt = image.judul || '';
      container.appendChild(img);
    });

    // Initialize viewer with options
    const newViewer = new Viewer(container, {
      inline: false,
      title: false,
      navbar: images.length > 1,
      toolbar: {
        zoomIn: true,
        zoomOut: true,
        oneToOne: true,
        reset: true,
        prev: images.length > 1,
        play: false,
        next: images.length > 1,
        rotateLeft: true,
        rotateRight: true,
        flipHorizontal: true,
        flipVertical: true,
        fullscreen: true,
      },
      initialViewIndex: startIndex,
      keyboard: true,
      backdrop: true,
      transition: true,
      viewed() {
        newViewer.zoomTo(1);
      },
      hidden() {
        newViewer.destroy();
        setViewer(null);
      },
    });

    setViewer(newViewer);
    newViewer.show();
  }, [viewer, selectedGalleryId]);

  return { initViewer };
};

// Add style for hiding scrollbar
const scrollbarHideStyle = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .gallery-item {
    transition: all 0.2s ease-in-out;
  }

  .gallery-item:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }

  .gallery-item.selected {
    background-color: rgba(0, 0, 0, 0.05);
    border-left: 3px solid hsl(var(--p));
    padding-left: calc(1rem - 3px);
  }

  .gallery-item-content {
    transition: all 0.2s ease;
  }
`;

const GalleryManagement = () => {
  const [galleries, setGalleries] = useState([]);
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'create', 'edit-name', 'add-images'
  // eslint-disable-next-line no-unused-vars
  const [editingGalleryId, setEditingGalleryId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [showSuccess, setShowSuccess] = useState(null);
  const { initViewer } = useImageViewer(selectedGallery?.id);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  // Fetch galleries
  const fetchGalleries = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/gallery');
      setGalleries(response.data);
    } catch (error) {
      console.error('Error fetching galleries:', error);
      document.getElementById('alert_error').showModal();
    }
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  // Create new gallery
  const handleCreateGallery = async () => {
    try {
      if (!editingName.trim()) {
        document.getElementById('alert_error_validation').showModal();
        return;
      }

      setIsUploading(true);
      const token = localStorage.getItem('token');
      
      // Create FormData object
      const formData = new FormData();
      formData.append('name', editingName.trim());
      
      // Add selected files
      if (selectedFiles.length > 0) {
        selectedFiles.forEach(file => {
          formData.append('images', file);
        });
      }

      const response = await axios.post(
        'http://localhost:5000/api/gallery',
        formData,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      await fetchGalleries();
      setSelectedGallery(response.data);
      handleCloseModal();
      document.getElementById('alert_success').showModal();
    } catch (error) {
      console.error('Error creating gallery:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create gallery';
      const errorDialog = document.getElementById('alert_error');
      if (errorDialog) {
        const errorText = errorDialog.querySelector('.py-4');
        if (errorText) {
          errorText.textContent = errorMessage;
        }
        errorDialog.showModal();
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Update gallery name
  const handleUpdateGalleryName = async (galleryId) => {
    try {
      if (!editingName.trim()) {
        document.getElementById('alert_error_validation').showModal();
        return;
      }

      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/gallery/${galleryId}`,
        { name: editingName.trim() },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      await fetchGalleries();
      setEditingGalleryId(null);
      setShowSuccess(galleryId);
      setTimeout(() => setShowSuccess(null), 2000);
    } catch (error) {
      console.error('Error updating gallery name:', error);
      document.getElementById('alert_error').showModal();
    }
  };

  // Add images to gallery
  const handleAddImages = async (galleryId, files) => {
    try {
      setIsUploading(true);
      const token = localStorage.getItem('token');
      
      // Create FormData object
      const formData = new FormData();
      
      // Add selected files
      if (files.length > 0) {
        files.forEach(file => {
          // Validate file size and type before adding
          if (file.size > 10 * 1024 * 1024) { // 10MB limit
            throw new Error(`File ${file.name} is too large. Maximum size is 10MB`);
          }
          
          const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
          if (!allowedTypes.includes(file.type)) {
            throw new Error(`File ${file.name} is not a supported image type`);
          }
          
          formData.append('images', file);
        });
      }

      const response = await axios.post(
        `http://localhost:5000/api/gallery/${galleryId}/images`,
        formData,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      await fetchGalleries();
      setSelectedGallery(response.data);
      handleCloseModal();
      document.getElementById('alert_success').showModal();
    } catch (error) {
      console.error('Error adding images:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add images';
      const errorDialog = document.getElementById('alert_error');
      if (errorDialog) {
        const errorText = errorDialog.querySelector('.py-4');
        if (errorText) {
          errorText.textContent = errorMessage;
        }
        errorDialog.showModal();
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Delete gallery
  const handleDeleteGallery = (gallery) => {
    const dialog = document.getElementById('confirm_delete_gallery');
    if (dialog) {
      dialog.dataset.galleryId = gallery.id;
      dialog.showModal();
    }
  };

  // Update the handleDeleteImage function
  const handleDeleteImage = async (imageId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/gallery/image/${imageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update galleries state
      setGalleries(prevGalleries => 
        prevGalleries.map(gallery => {
          if (gallery.id === selectedGallery.id) {
            return {
              ...gallery,
              photos: gallery.photos.filter(photo => photo.id !== imageId),
              photo_count: gallery.photo_count - 1,
              preview_image: gallery.photos.length === 1 ? null : 
                (gallery.preview_image === imageId ? 
                  gallery.photos.find(photo => photo.id !== imageId)?.file : 
                  gallery.preview_image)
            };
          }
          return gallery;
        })
      );

      // Update selectedGallery state
      setSelectedGallery(prevGallery => ({
        ...prevGallery,
        photos: prevGallery.photos.filter(photo => photo.id !== imageId),
        photo_count: prevGallery.photo_count - 1
      }));

      document.getElementById('alert_success').showModal();
    } catch (error) {
      console.error('Error deleting image:', error);
      document.getElementById('alert_error').showModal();
    }
  };

  // Update the confirmDeleteImage function
  const confirmDeleteImage = async () => {
    const dialog = document.getElementById('confirm_delete_image');
    const imageId = parseInt(dialog.dataset.imageId);

    try {
      await handleDeleteImage(imageId);
      dialog.close();
    } catch (error) {
      console.error('Error deleting image:', error);
      document.getElementById('alert_error').showModal();
    }
  };

  // Modal handlers
  const handleOpenModal = (type, gallery = null) => {
    setModalType(type);
    if (type === 'create') {
      setEditingName('');
      setSelectedFiles([]);
    } else if (type === 'edit-name') {
      setEditingName(gallery.name);
      setSelectedGallery(gallery);
    } else if (type === 'add-images') {
      setSelectedGallery(gallery);
      setSelectedFiles([]);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedGallery(null);
    setEditingName('');
    setSelectedFiles([]);
  };

  // File selection handler
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handlePreviewGalleryImages = (images, startIndex = 0) => {
    initViewer(images, startIndex);
  };

  const confirmDeleteGallery = async () => {
    const dialog = document.getElementById('confirm_delete_gallery');
    const galleryId = dialog.dataset.galleryId;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/gallery/${galleryId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchGalleries();
      setSelectedGallery(null);
      document.getElementById('alert_success').showModal();
    } catch (error) {
      console.error('Error deleting gallery:', error);
      document.getElementById('alert_error').showModal();
    }
  };

  // Add these functions to window for the alerts to access
  window.confirmDeleteGallery = confirmDeleteGallery;
  window.confirmDeleteImage = confirmDeleteImage;

  // Handle edit gallery name
  // eslint-disable-next-line no-unused-vars
  const handleEditGallery = (gallery) => {
    setEditingGalleryId(gallery.id);
    setEditingName(gallery.name);
  };

  // Handle remove selected image from preview
  const handleRemoveSelectedImage = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Update how images are displayed
  // eslint-disable-next-line no-unused-vars
  const getImageUrl = (image) => {
    if (!image?.file) return null;
    return `http://localhost:5000/uploads/gallery/${selectedGallery?.id}/${image.file}`;
  };

  // Add edit handler
  // eslint-disable-next-line no-unused-vars
  const handleEditClick = (gallery) => {
    setEditingId(gallery.id);
    setEditValue(gallery.judul);
  };

  // Update the handleSave function
  const handleSave = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/gallery/${id}`,
        { judul: editValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update galleries state
      setGalleries(prevGalleries => 
        prevGalleries.map(gallery => 
          gallery.id === id ? { ...gallery, judul: editValue } : gallery
        )
      );

      // Update selectedGallery if it's the one being edited
      if (selectedGallery?.id === id) {
        setSelectedGallery(prev => ({
          ...prev,
          judul: editValue
        }));
      }

      // Reset edit state
      setEditingId(null);
      setEditValue('');

      // Show success message
      document.getElementById('alert_success').showModal();
    } catch (error) {
      console.error('Error updating gallery:', error);
      document.getElementById('alert_error').showModal();
    }
  };

  // Add cancel handler
  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  return (
    <div className="min-h-full">
      <style>{scrollbarHideStyle}</style>
      
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Gallery</h1>
        <p className="mt-1 text-sm text-gray-500">
          Kelola koleksi foto website
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gallery List - Full width on mobile, 3 cols on desktop */}
        <div className="lg:col-span-3">
          <div className="card bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Daftar Gallery</h2>
                <button
                  onClick={() => handleOpenModal('create')}
                  className="btn btn-primary btn-sm"
                >
                  + Baru
                </button>
              </div>
            </div>
            
            <div 
              className="overflow-y-auto scrollbar-hide rounded-b-xl"
              style={{ 
                height: window.innerWidth >= 1024 ? '400px' : '200px'
              }}
            >
              <div className="divide-y divide-base-200">
                {galleries.map((gallery) => (
                  <div
                    key={gallery.id}
                    className={`gallery-item p-4 cursor-pointer ${
                      selectedGallery?.id === gallery.id ? 'selected' : ''
                    }`}
                    onClick={() => {
                      // Add smooth transition when selecting gallery
                      const prevSelected = document.querySelector('.gallery-item.selected');
                      if (prevSelected) {
                        prevSelected.style.transition = 'all 0.2s ease-out';
                      }
                      setSelectedGallery(gallery);
                    }}
                  >
                    <div className="gallery-item-content">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <div className="w-12 h-12 rounded bg-base-200 flex items-center justify-center overflow-hidden">
                                {gallery.preview_image ? (
                                  <img
                                    src={`http://localhost:5000/uploads/gallery/${gallery.id}/${gallery.preview_image}`}
                                    alt={gallery.judul || 'Gallery preview'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.style.display = 'none';
                                      e.target.parentElement.innerHTML = `
                                        <div class="w-full h-full flex items-center justify-center">
                                          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                          </svg>
                                        </div>
                                      `;
                                    }}
                                  />
                                ) : (
                                  <PhotoIcon className="w-6 h-6 opacity-50" />
                                )}
                              </div>
                            </div>
                            <div>
                              <h3 className="font-medium text-sm">{gallery.judul || 'Untitled'}</h3>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-gray-500">ID: {gallery.id}</span>
                                <span className="text-xs text-gray-500">{gallery.photo_count || 0} foto</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Gallery View - Full width on mobile, 9 cols on desktop */}
        <div className="lg:col-span-9">
          <div className="card bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="card-body p-4 md:p-6">
              {selectedGallery ? (
                <div className="animate-fadeIn">
                  <div className="flex flex-col gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-semibold">
                            {selectedGallery.judul}
                          </h2>
                          <button
                            onClick={() => {
                              setEditingId(selectedGallery.id);
                              setEditValue(selectedGallery.judul || '');
                            }}
                            className="btn btn-ghost btn-xs btn-square"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {selectedGallery.photo_count || 0} foto dalam gallery ini
                        </p>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleOpenModal('add-images', selectedGallery)}
                          className="btn btn-primary flex-1 sm:flex-none"
                        >
                          Tambah Foto
                        </button>
                        <button
                          onClick={() => handleDeleteGallery(selectedGallery)}
                          className="btn btn-error flex-1 sm:flex-none"
                        >
                          Hapus Gallery
                        </button>
                      </div>
                    </div>
                  </div>

                  {editingId === selectedGallery.id && (
                    <div className="mb-6 animate-fadeIn">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="input input-bordered flex-1"
                          autoFocus
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleSave(selectedGallery.id);
                            }
                          }}
                        />
                        <button
                          onClick={() => handleSave(selectedGallery.id)}
                          className="btn btn-ghost btn-square text-success hover:bg-success/10"
                        >
                          <FiCheck className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="btn btn-ghost btn-square text-error hover:bg-error/10"
                        >
                          <FiX className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedGallery.photos && selectedGallery.photos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedGallery.photos.map((image, index) => (
                        <div key={image.id} className="relative aspect-square">
                          <img
                            src={`http://localhost:5000/uploads/gallery/${selectedGallery.id}/${image.file}`}
                            alt={image.judul || `Gallery ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreviewGalleryImages(selectedGallery.photos, index);
                            }}
                          />
                          <div className="absolute bottom-2 right-2 flex gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreviewGalleryImages(selectedGallery.photos, index);
                              }}
                              className="btn btn-sm bg-white/90 hover:bg-white border-none shadow-lg px-3 text-primary hover:text-primary-focus backdrop-blur-sm"
                              title="Lihat foto"
                            >
                              <EyeIcon className="w-4 h-4" />
                              Lihat
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const dialog = document.getElementById('confirm_delete_image');
                                if (dialog) {
                                  dialog.dataset.imageId = image.id;
                                  dialog.showModal();
                                }
                              }}
                              className="btn btn-sm bg-white/90 hover:bg-white border-none shadow-lg px-3 text-error hover:text-error-focus backdrop-blur-sm"
                              title="Hapus foto"
                            >
                              <TrashIcon className="w-4 h-4" />
                              Hapus
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center min-h-[200px] text-center p-6 bg-base-200 rounded-lg">
                      <div className="space-y-2">
                        <PhotoIcon className="w-12 h-12 opacity-50 mx-auto" />
                        <h3 className="font-semibold">Belum ada foto</h3>
                        <p className="text-sm text-gray-500">
                          Klik tombol "Tambah Foto" untuk menambahkan foto ke gallery ini
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[200px] lg:min-h-[400px] text-center p-6">
                  <div className="space-y-2">
                    <PhotoIcon className="w-12 h-12 opacity-50 mx-auto" />
                    <h3 className="font-semibold">Pilih Gallery</h3>
                    <p className="text-sm text-gray-500">
                      Pilih gallery dari daftar untuk melihat dan mengelola foto
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <dialog className="modal modal-open">
          <div className="modal-box w-11/12 max-w-2xl">
            <form method="dialog">
              <button 
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                onClick={handleCloseModal}
              >✕</button>
            </form>
            
            <h3 className="font-bold text-lg mb-4">
              {modalType === 'create' && 'Buat Galeri Baru'}
              {modalType === 'edit-name' && 'Edit Nama Galeri'}
              {modalType === 'add-images' && 'Tambah Foto ke Galeri'}
            </h3>

            <div className="space-y-6">
              {/* Show name input for create and edit-name */}
              {(modalType === 'create' || modalType === 'edit-name') && (
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium">Nama Galeri</span>
                  </label>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="input input-bordered w-full"
                    placeholder="Masukkan nama galeri"
                  />
                </div>
              )}

              {/* Show image upload for create and add-images */}
              {(modalType === 'create' || modalType === 'add-images') && (
                <div className="space-y-4">
                  <label className="label">
                    <span className="label-text font-medium">Upload Foto</span>
                  </label>
                  
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-base-200 hover:bg-base-300 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <PhotoIcon className="w-10 h-10 opacity-70 mb-3" />
                      <p className="text-sm">
                        <span className="font-medium text-primary">Klik untuk upload</span> atau drag and drop
                      </p>
                      <p className="mt-1 text-xs opacity-70">
                        PNG, JPG atau WEBP (Maks. 2MB per foto)
                      </p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>

                  {/* Selected Images Preview */}
                  {selectedFiles.length > 0 && (
                    <div className="bg-base-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">
                          Foto Terpilih ({selectedFiles.length})
                        </span>
                        <button
                          onClick={() => setSelectedFiles([])}
                          className="btn btn-ghost btn-xs text-error"
                        >
                          Hapus Semua
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="relative group aspect-[4/3]">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                              <button
                                onClick={() => handleRemoveSelectedImage(index)}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 btn btn-error btn-sm btn-circle"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-action">
              <button 
                className="btn btn-ghost"
                onClick={handleCloseModal}
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  try {
                    if (modalType === 'create') {
                      await handleCreateGallery();
                    } else if (modalType === 'edit-name') {
                      await handleUpdateGalleryName(selectedGallery.id);
                    } else if (modalType === 'add-images') {
                      await handleAddImages(selectedGallery.id, selectedFiles);
                    }
                  } catch (error) {
                    console.error('Error:', error);
                    document.getElementById('alert_error').showModal();
                  }
                }}
                disabled={
                  isUploading || 
                  (modalType !== 'add-images' && !editingName.trim()) ||
                  (modalType === 'add-images' && selectedFiles.length === 0)
                }
                className="btn btn-primary"
              >
                {isUploading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Menyimpan...
                  </>
                ) : 'Simpan'}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      )}

      {/* Add the alert component */}
      <GalleryAlert />
    </div>
  );
};

export default GalleryManagement; 