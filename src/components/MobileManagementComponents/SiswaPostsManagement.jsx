import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { FiTrash2, FiHeart } from 'react-icons/fi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useNavigate } from 'react-router-dom';
import { checkToken, clearToken } from '../../utils/auth';

// Add Swiper styles
const swiperStyles = `
  .swiper-button-next,
  .swiper-button-prev {
    color: #ffffff;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 24px;
    border-radius: 50%;
    width: 24px;
    height: 24px;
  }

  .swiper-button-next:after,
  .swiper-button-prev:after {
    font-size: 16px;
  }

  .swiper-pagination-bullet {
    background-color: #ffffff;
    opacity: 0.5;
  }

  .swiper-pagination-bullet-active {
    background-color: #ffffff;
    opacity: 1;
  }

  .swiper-container {
    width: 100%;
    height: 100%;
  }

  .swiper-slide {
    position: relative;
    overflow: hidden;
  }

  .swiper-slide img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const getFilenameFromPath = (filepath) => {
    if (!filepath) return '';
    return filepath.split('/').pop();
};

const SiswaPostsManagement = () => {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [postToDelete, setPostToDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSection, setActiveSection] = useState('published'); // 'published' or 'archived'
    const [postToRestore, setPostToRestore] = useState(null);
    const [postToDeletePermanent, setPostToDeletePermanent] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    useEffect(() => {
        fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/mobile-management/posts');
            
            if (Array.isArray(response.data)) {
                const processedPosts = response.data.map(post => ({
                    ...post,
                    status_text: post.status ? 'Published' : 'Archived',
                    profile_image: post.profile_image,
                    images: post.images || []
                }));

                console.log('Processed posts:', processedPosts);
                setPosts(processedPosts);
            } else {
                console.error('Invalid response format:', response.data);
                setError('Invalid response format from server');
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
            setError(error.response?.data?.message || 'Error fetching posts');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (post) => {
        try {
            if (!checkToken()) {
                clearToken();
                navigate('/login');
                return;
            }

            const token = sessionStorage.getItem('token');
            await axios.put(
                `http://localhost:5000/api/mobile-management/posts/${post.id}/status`,
                { status: false },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setPosts(currentPosts => currentPosts.filter(p => p.id !== post.id));
            setModalMessage(`Post by ${post.full_name} has been archived`);
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error archiving post:', error);
            if (error.response?.status === 403) {
                clearToken();
                navigate('/login');
            }
            setShowErrorModal(true);
        } finally {
            setPostToDelete(null);
        }
    };

    const confirmDelete = (post) => {
        setPostToDelete(post);
        document.getElementById('confirm_delete').showModal();
    };

    const handleRestore = async (post) => {
        try {
            if (!checkToken()) {
                clearToken();
                navigate('/login');
                return;
            }

            const token = sessionStorage.getItem('token');
            await axios.put(
                `http://localhost:5000/api/mobile-management/posts/${post.id}/status`,
                { status: true },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setPosts(currentPosts => currentPosts.map(p => 
                p.id === post.id ? { ...p, status: true, status_text: 'Published' } : p
            ));
            setModalMessage(`Post by ${post.full_name} has been restored`);
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error restoring post:', error);
            if (error.response?.status === 403) {
                clearToken();
                navigate('/login');
            }
            setShowErrorModal(true);
        } finally {
            setPostToRestore(null);
        }
    };

    const handlePermanentDelete = async (post) => {
        try {
            if (!checkToken()) {
                clearToken();
                navigate('/login');
                return;
            }

            const token = sessionStorage.getItem('token');
            await axios.delete(
                `http://localhost:5000/api/mobile-management/posts/${post.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setPosts(currentPosts => currentPosts.filter(p => p.id !== post.id));
            setModalMessage('Post has been permanently deleted');
            setShowSuccessModal(true);
        } catch (error) {
            console.error('Error deleting post:', error);
            if (error.response?.status === 403) {
                clearToken();
                navigate('/login');
            }
            setShowErrorModal(true);
        } finally {
            setPostToDeletePermanent(null);
        }
    };

    const filteredPosts = posts.filter(post => {
        const nameMatches = post.full_name.toLowerCase().includes(searchQuery.toLowerCase());
        const statusMatches = activeSection === 'published' ? post.status === true : post.status === false;
        return nameMatches && statusMatches;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-error text-center py-4">
                {error}
            </div>
        );
    }

    return (
        <>
            <style>{swiperStyles}</style>
            
            <div className="space-y-4">
                {/* Header Card */}
                <div className="card bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="card-body p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Manajemen Postingan Siswa
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Kelola postingan yang dibuat oleh siswa
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Stats Card */}
                <div className="card bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="card-body p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Search Input */}
                            <div className="form-control w-full sm:max-w-xs">
                                <div className="input-group">
                                    <input
                                        type="text"
                                        placeholder="Cari nama..."
                                        className="input input-bordered w-full"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    {searchQuery && (
                                        <button 
                                            className="btn btn-square btn-ghost"
                                            onClick={() => setSearchQuery('')}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Post Stats */}
                            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
                                <div className="flex items-center gap-2 min-w-[100px]">
                                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                                    <span className="text-gray-600">Total:</span>
                                    <span className="font-medium">{posts.length}</span>
                                </div>
                                <div className="flex items-center gap-2 min-w-[100px]">
                                    <div className="w-2 h-2 rounded-full bg-success"></div>
                                    <span className="text-gray-600">Published:</span>
                                    <span className="font-medium text-success">
                                        {posts.filter(post => post.status === true).length}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 min-w-[100px]">
                                    <div className="w-2 h-2 rounded-full bg-error"></div>
                                    <span className="text-gray-600">Archived:</span>
                                    <span className="font-medium text-error">
                                        {posts.filter(post => post.status === false).length}
                                    </span>
                                </div>
                            </div>

                            {/* Section Toggle */}
                            <div className="join ml-auto">
                                <button
                                    className={`join-item btn btn-sm ${activeSection === 'published' ? 'btn-active' : ''}`}
                                    onClick={() => setActiveSection('published')}
                                >
                                    Published
                                </button>
                                <button
                                    className={`join-item btn btn-sm ${activeSection === 'archived' ? 'btn-active' : ''}`}
                                    onClick={() => setActiveSection('archived')}
                                >
                                    Archived
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Posts Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredPosts.length > 0 ? (
                        filteredPosts.map((post) => (
                            <div key={post.id} className="card bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                                {/* Author Info */}
                                <div className="p-4 flex items-center gap-3 border-b">
                                    <div className="avatar">
                                        <div className="w-10 h-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                            <img
                                                src={post.profile_image 
                                                    ? `http://localhost:5000/api/profile/image/${post.profile_id}/${getFilenameFromPath(post.profile_image)}`
                                                    : 'https://via.placeholder.com/40'}
                                                alt={post.full_name}
                                                className="object-cover"
                                                onError={(e) => {
                                                    console.error('Profile image load error:', post.profile_image);
                                                    e.target.src = 'https://via.placeholder.com/40';
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm text-gray-900 truncate">
                                            {post.full_name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {moment(post.created_at).format('DD MMM YYYY')}
                                        </p>
                                    </div>
                                </div>

                                {/* Image Carousel */}
                                {post.images?.length > 0 && (
                                    <div className="relative aspect-square">
                                        <Swiper
                                            modules={[Navigation, Pagination]}
                                            navigation
                                            pagination={{ clickable: true }}
                                            className="h-full w-full"
                                            loop={true}
                                        >
                                            {post.images.map((image, index) => (
                                                <SwiperSlide key={image.id || index}>
                                                    <img
                                                        src={image.file}
                                                        alt={image.judul || `Image ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            console.error('Post image load error:', image.file);
                                                            e.target.src = 'https://via.placeholder.com/400?text=Image+Not+Found';
                                                        }}
                                                    />
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>
                                    </div>
                                )}

                                {/* Post Content */}
                                <div className="p-4">
                                    <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                                        {post.caption}
                                    </p>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1">
                                                <FiHeart className="text-red-500 w-4 h-4" />
                                                <span className="text-xs font-medium text-gray-600">
                                                    {post.likes_count}
                                                </span>
                                            </div>
                                            <div className={`badge ${post.status ? 'badge-success' : 'badge-error'} badge-sm`}>
                                                {post.status_text}
                                            </div>
                                        </div>

                                        {activeSection === 'archived' ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setPostToRestore(post);
                                                        document.getElementById('confirm_restore').showModal();
                                                    }}
                                                    className="btn btn-ghost btn-sm btn-square text-success hover:bg-success/10"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setPostToDeletePermanent(post);
                                                        document.getElementById('confirm_permanent_delete').showModal();
                                                    }}
                                                    className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => confirmDelete(post)}
                                                className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full flex items-center justify-center p-8">
                            <div className="text-center">
                                <span className="block text-gray-500">
                                    {posts.length === 0 ? (
                                        'Belum ada postingan'
                                    ) : (
                                        'Tidak ada postingan yang sesuai dengan pencarian'
                                    )}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm Delete Dialog */}
            <dialog id="confirm_delete" className="modal" onClick={(e) => {
                if (e.target === e.currentTarget) {
                    const modal = document.getElementById('confirm_delete');
                    if (modal) {
                        modal.close();
                        setPostToDelete(null);
                    }
                }
            }}>
                <div className="modal-box" onClick={e => e.stopPropagation()}>
                    <h3 className="font-bold text-lg text-warning">Arsipkan Postingan</h3>
                    <div className="py-4 space-y-4">
                        <p className="text-base">
                            Apakah Anda yakin ingin mengarsipkan postingan ini?
                        </p>
                        {postToDelete && (
                            <div className="bg-base-200 p-4 rounded-lg space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="avatar">
                                        <div className="w-10 h-10 rounded-full">
                                            <img
                                                src={postToDelete?.profile_image 
                                                    ? `http://localhost:5000/api/profile/image/${postToDelete.profile_id}/${getFilenameFromPath(postToDelete.profile_image)}`
                                                    : 'https://via.placeholder.com/40'}
                                                alt={postToDelete?.full_name}
                                                className="object-cover"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/40';
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-medium">{postToDelete.full_name}</p>
                                        <p className="text-sm text-gray-500">
                                            {moment(postToDelete.created_at).format('DD MMM YYYY, HH:mm')}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600">
                                    {postToDelete.caption.length > 100 
                                        ? `${postToDelete.caption.substring(0, 100)}...` 
                                        : postToDelete.caption
                                    }
                                </p>
                            </div>
                        )}
                        <div className="text-sm text-gray-500 bg-warning/10 p-3 rounded">
                            <strong>Catatan:</strong> Aksi ini akan menyembunyikan postingan dari semua pengguna.
                        </div>
                    </div>
                    <div className="modal-action">
                        <button 
                            className="btn btn-ghost"
                            onClick={() => {
                                const modal = document.getElementById('confirm_delete');
                                setPostToDelete(null);
                                if (modal) modal.close();
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-warning"
                            onClick={() => {
                                const modal = document.getElementById('confirm_delete');
                                if (postToDelete) {
                                    handleDelete(postToDelete);
                                }
                                if (modal) modal.close();
                            }}
                        >
                            Archive Post
                        </button>
                    </div>
                </div>
            </dialog>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                        <h3 className="font-bold text-lg text-success">Success</h3>
                        <p className="py-4">{modalMessage}</p>
                        <div className="flex justify-end">
                            <button 
                                className="btn btn-primary"
                                onClick={() => setShowSuccessModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Modal */}
            {showErrorModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
                        <h3 className="font-bold text-lg text-error">Error</h3>
                        <p className="py-4">An error occurred</p>
                        <div className="flex justify-end">
                            <button 
                                className="btn btn-primary"
                                onClick={() => setShowErrorModal(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Restore Confirmation Modal */}
            <dialog id="confirm_restore" className="modal" onClick={(e) => {
                if (e.target === e.currentTarget) {
                    const modal = document.getElementById('confirm_restore');
                    if (modal) {
                        modal.close();
                        setPostToRestore(null);
                    }
                }
            }}>
                <div className="modal-box" onClick={e => e.stopPropagation()}>
                    <h3 className="font-bold text-lg text-success">Kembalikan Postingan</h3>
                    <div className="py-4 space-y-4">
                        <p className="text-base">
                            Apakah Anda yakin ingin mengembalikan postingan ini?
                        </p>
                        {postToRestore && (
                            <div className="bg-base-200 p-4 rounded-lg space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="avatar">
                                        <div className="w-10 h-10 rounded-full">
                                            <img
                                                src={postToRestore?.profile_image 
                                                    ? `http://localhost:5000/api/profile/image/${postToRestore.profile_id}/${getFilenameFromPath(postToRestore.profile_image)}`
                                                    : 'https://via.placeholder.com/40'}
                                                alt={postToRestore?.full_name}
                                                className="object-cover"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/40';
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-medium">{postToRestore.full_name}</p>
                                        <p className="text-sm text-gray-500">
                                            {moment(postToRestore.created_at).format('DD MMM YYYY, HH:mm')}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600">
                                    {postToRestore.caption.length > 100 
                                        ? `${postToRestore.caption.substring(0, 100)}...` 
                                        : postToRestore.caption
                                    }
                                </p>
                            </div>
                        )}
                        <div className="text-sm text-gray-500 bg-success/10 p-3 rounded">
                            <strong>Catatan:</strong> Aksi ini akan membuat postingan terlihat kembali untuk semua pengguna.
                        </div>
                    </div>
                    <div className="modal-action">
                        <button 
                            className="btn btn-ghost"
                            onClick={() => {
                                const modal = document.getElementById('confirm_restore');
                                setPostToRestore(null);
                                if (modal) modal.close();
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-success"
                            onClick={() => {
                                const modal = document.getElementById('confirm_restore');
                                if (postToRestore) {
                                    handleRestore(postToRestore);
                                }
                                if (modal) modal.close();
                            }}
                        >
                            Restore Post
                        </button>
                    </div>
                </div>
            </dialog>

            {/* Permanent Delete Confirmation Modal */}
            <dialog id="confirm_permanent_delete" className="modal" onClick={(e) => {
                if (e.target === e.currentTarget) {
                    const modal = document.getElementById('confirm_permanent_delete');
                    if (modal) {
                        modal.close();
                        setPostToDeletePermanent(null);
                    }
                }
            }}>
                <div className="modal-box" onClick={e => e.stopPropagation()}>
                    <h3 className="font-bold text-lg text-error">Hapus Permanen</h3>
                    <div className="py-4 space-y-4">
                        <p className="text-base">
                            Apakah Anda yakin ingin menghapus postingan ini secara permanen?
                        </p>
                        {postToDeletePermanent && (
                            <div className="bg-base-200 p-4 rounded-lg space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="avatar">
                                        <div className="w-10 h-10 rounded-full">
                                            <img
                                                src={postToDeletePermanent?.profile_image 
                                                    ? `http://localhost:5000/api/profile/image/${postToDeletePermanent.profile_id}/${getFilenameFromPath(postToDeletePermanent.profile_image)}`
                                                    : 'https://via.placeholder.com/40'}
                                                alt={postToDeletePermanent?.full_name}
                                                className="object-cover"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/40';
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-medium">{postToDeletePermanent.full_name}</p>
                                        <p className="text-sm text-gray-500">
                                            {moment(postToDeletePermanent.created_at).format('DD MMM YYYY, HH:mm')}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600">
                                    {postToDeletePermanent.caption.length > 100 
                                        ? `${postToDeletePermanent.caption.substring(0, 100)}...` 
                                        : postToDeletePermanent.caption
                                    }
                                </p>
                            </div>
                        )}
                        <div className="text-sm text-gray-500 bg-error/10 p-3 rounded">
                            <strong>Peringatan:</strong> Aksi ini tidak dapat dibatalkan.
                        </div>
                    </div>
                    <div className="modal-action">
                        <button 
                            className="btn btn-ghost"
                            onClick={() => {
                                const modal = document.getElementById('confirm_permanent_delete');
                                setPostToDeletePermanent(null);
                                if (modal) modal.close();
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            className="btn btn-error"
                            onClick={() => {
                                const modal = document.getElementById('confirm_permanent_delete');
                                if (postToDeletePermanent) {
                                    handlePermanentDelete(postToDeletePermanent);
                                }
                                if (modal) modal.close();
                            }}
                        >
                            Delete Permanently
                        </button>
                    </div>
                </div>
            </dialog>
        </>
    );
};

export default SiswaPostsManagement; 