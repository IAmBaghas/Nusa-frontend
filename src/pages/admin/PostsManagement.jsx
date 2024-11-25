import React, { useState, useEffect } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { FiPlus, FiEdit2, FiTrash2, FiFileText, FiFilter } from 'react-icons/fi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import axios from 'axios';

// eslint-disable-next-line no-unused-vars
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
`;

const editorStyles = `
    .ck-editor__editable {
        min-height: 200px;
        max-height: 400px;
    }

    .ck.ck-editor__editable_inline {
        padding: 0 1rem;
    }

    .ck.ck-editor__editable_inline > :first-child {
        margin-top: 0.5rem;
    }

    .ck.ck-editor__editable_inline > :last-child {
        margin-bottom: 0.5rem;
    }
`;

const scrollbarHideStyle = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .post-item {
    transition: all 0.2s ease-in-out;
  }

  .post-item:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }

  .post-item.selected {
    background-color: rgba(0, 0, 0, 0.05);
    border-left: 3px solid hsl(var(--p));
    padding-left: calc(1rem - 3px);
  }
`;

const PostForm = ({ 
    onSubmit, 
    initialData, 
    formData,
    setFormData,
    categories,
    galleries,
    setIsEditing,
    setEditingPost,
    setShowNewPostForm,
    resetForm,
    posts
}) => {
    const editorConfig = {
        toolbar: [
            'heading',
            '|',
            'bold', 'italic', 'link',
            '|',
            'bulletedList', 'numberedList',
            '|',
            'undo', 'redo'
        ],
        link: {
            defaultProtocol: 'https://',
            decorators: {
                openInNewTab: {
                    mode: 'manual',
                    label: 'Open in a new tab',
                    defaultValue: true,
                    attributes: {
                        target: '_blank',
                        rel: 'noopener noreferrer'
                    }
                }
            }
        }
    };

    const availableGalleries = galleries.filter(g => {
        if (!initialData) {
            return !posts.some(post => post.gallery_id === g.id);
        }
        return !posts.some(post => post.gallery_id === g.id) || 
               g.id === initialData.gallery_id;
    });

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                {/* Title Input */}
                <div className="form-control w-full">
                    <label className="label">
                        <span className="label-text font-medium">Judul Post</span>
                    </label>
                    <input
                        type="text"
                        value={formData.judul}
                        onChange={(e) => setFormData({...formData, judul: e.target.value})}
                        className="input input-bordered w-full"
                        placeholder="Masukkan judul post"
                        required
                    />
                </div>

                {/* Category Select */}
                <div className="form-control w-full">
                    <label className="label">
                        <span className="label-text font-medium">
                            Kategori <span className="text-error">*</span>
                        </span>
                    </label>
                    <select
                        value={formData.kategori_id || ''}
                        onChange={(e) => setFormData({...formData, kategori_id: Number(e.target.value)})}
                        className="select select-bordered w-full"
                        required
                    >
                        <option value="">Pilih kategori</option>
                        {categories?.map(category => (
                            <option key={category.id} value={category.id}>
                                {category.judul}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Gallery Select */}
                <div className="form-control w-full">
                    <label className="label">
                        <span className="label-text font-medium">
                            Gallery {!initialData && <span className="text-error">*</span>}
                        </span>
                    </label>
                    <select
                        value={formData.gallery_id || ''}
                        onChange={(e) => setFormData({...formData, gallery_id: e.target.value})}
                        className="select select-bordered w-full"
                        required={!initialData}
                    >
                        <option value="">
                            {initialData?.gallery_name || 'Pilih gallery'}
                        </option>
                        {availableGalleries.map(gallery => (
                            <option key={gallery.id} value={gallery.id}>
                                {gallery.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Status Select - Only show when editing */}
                {initialData && (
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-medium">Status Post</span>
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({...formData, status: Number(e.target.value)})}
                            className="select select-bordered w-full"
                        >
                            <option value={1}>Published</option>
                            <option value={0}>Draft</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Content Editor */}
            <div className="form-control w-full">
                <label className="label">
                    <span className="label-text font-medium">Konten Post</span>
                </label>
                <div className="prose max-w-none">
                    <CKEditor
                        editor={ClassicEditor}
                        config={editorConfig}
                        data={formData.isi || ''}
                        onChange={(event, editor) => {
                            const data = editor.getData();
                            setFormData(prev => ({...prev, isi: data}));
                        }}
                    />
                </div>
            </div>

            {/* Action Buttons - Adjusted spacing */}
            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={resetForm}
                    className="btn btn-ghost"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    className="btn btn-primary"
                >
                    {initialData ? 'Simpan Perubahan' : 'Buat Post'}
                </button>
            </div>
        </form>
    );
};

const PostsManagement = () => {
    const [posts, setPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [categories, setCategories] = useState([]);
    const [showNewPostForm, setShowNewPostForm] = useState(false);
    const [formData, setFormData] = useState({
        judul: '',
        kategori_id: '',
        isi: '',
        gallery_id: '',
        status: 0
    });
    const [galleries, setGalleries] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [filters, setFilters] = useState({
        category: '',
        status: ''
    });

    useEffect(() => {
        fetchPosts();
        fetchCategories();
        fetchGalleries();
    }, []);

    useEffect(() => {
        if (showNewPostForm) {
            setFormData({
                judul: '',
                kategori_id: '',
                isi: '',
                gallery_id: '',
                status: 0
            });
            setIsEditing(false);
            setEditingPost(null);
        }
    }, [showNewPostForm]);

    const fetchPosts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/posts/web', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            

            const processedPosts = response.data.map(post => ({
                ...post,
                gallery_images: post.gallery_images?.map(img => ({
                    ...img,
                    file: img.file.startsWith('/') ? img.file : `/${img.file}`
                }))
            }));

            setPosts(processedPosts);
        } catch (error) {
            console.error('Error fetching posts:', error);
            const errorModal = document.getElementById('alert_error');
            if (errorModal) {
                const errorText = errorModal.querySelector('.py-4');
                if (errorText) {
                    errorText.textContent = 'Error fetching posts';
                }
                errorModal.showModal();
            }
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/categories');
            
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            
            const data = await response.json();
            
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            alert('Failed to load categories');
        }
    };

    const fetchGalleries = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.get(
                'http://localhost:5000/api/posts/available-galleries',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data) {
                console.log('Available galleries:', response.data); // Debug log
                setGalleries(response.data);
            } else {
                setGalleries([]);
            }
        } catch (error) {
            console.error('Error fetching galleries:', error);
            const errorModal = document.getElementById('alert_error');
            if (errorModal) {
                const errorText = errorModal.querySelector('.py-4');
                if (errorText) {
                    errorText.textContent = 'Failed to load available galleries';
                }
                errorModal.showModal();
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Validate required fields
            if (!formData.judul || !formData.kategori_id || !formData.isi || !formData.gallery_id) {
                throw new Error('Please fill in all required fields');
            }

            const postData = {
                judul: formData.judul,
                kategori_id: Number(formData.kategori_id),
                isi: formData.isi,
                gallery_id: Number(formData.gallery_id),
                status: 0 // Default to draft
            };


            const response = await axios.post(
                'http://localhost:5000/api/posts',
                postData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );


            if (response.data.status === 'success') {
                await fetchPosts();
                setShowNewPostForm(false);
                resetForm();
                const successModal = document.getElementById('alert_success');
                if (successModal) {
                    const successText = successModal.querySelector('.py-4');
                    if (successText) {
                        successText.textContent = response.data.message;
                    }
                    successModal.showModal();
                }
            } else {
                throw new Error(response.data.message || 'Failed to create post');
            }
        } catch (error) {
            console.error('Error creating post:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Error creating post';
            const errorModal = document.getElementById('alert_error');
            if (errorModal) {
                const errorText = errorModal.querySelector('.py-4');
                if (errorText) {
                    errorText.textContent = errorMessage;
                }
                errorModal.showModal();
            }
        }
    };

    const resetForm = () => {
        setFormData({
            judul: '',
            kategori_id: '',
            isi: '',
            gallery_id: '',
            status: 0
        });
        setIsEditing(false);
        setEditingPost(null);
        setShowNewPostForm(false);
    };

    const handleEditClick = (post) => {
        resetForm();
        setIsEditing(true);
        setShowNewPostForm(false);
        setEditingPost(post);
        
        setFormData({
            judul: post.judul,
            kategori_id: post.kategori_id,
            isi: post.isi,
            gallery_id: post.gallery_id,
            gallery_name: post.gallery_name, // Use gallery_name from post data
            status: post.status
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const updateData = {
                ...formData,
                gallery_id: Number(formData.gallery_id) // Use formData gallery_id instead of editingPost
            };

            const response = await fetch(`http://localhost:5000/api/posts/${editingPost.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                fetchPosts();
                setIsEditing(false);
                setEditingPost(null);
                setFormData({
                    judul: '',
                    kategori_id: '',
                    isi: '',
                    gallery_id: '',
                    status: 0
                });
                document.getElementById('alert_success').showModal();
            }
        } catch (error) {
            console.error('Error updating post:', error);
            document.getElementById('alert_error').showModal();
        }
    };

    const handleDelete = async (postId) => {
        // Show confirmation dialog
        document.getElementById('confirm_delete').showModal();
        // Store postId for deletion
        document.getElementById('confirm_delete').dataset.postId = postId;
    };

    const confirmDelete = async () => {
        const dialog = document.getElementById('confirm_delete');
        const postId = dialog.dataset.postId;

        try {
            const response = await fetch(`http://localhost:5000/api/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                fetchPosts();
                setSelectedPost(null);
                document.getElementById('alert_success').showModal();
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            document.getElementById('alert_error').showModal();
        }
    };

    const getFilteredPosts = () => {
        return posts.filter(post => {
            const categoryMatch = !filters.category || post.kategori_id === Number(filters.category);
            const statusMatch = filters.status === '' || post.status === Number(filters.status);
            return categoryMatch && statusMatch;
        });
    };

    const handleNewPost = () => {
        setSelectedPost(null);
        setIsEditing(false);
        setEditingPost(null);
        setFormData({
            judul: '',
            kategori_id: '',
            isi: '',
            gallery_id: '',
            status: 0
        });
        setShowNewPostForm(true);
    };

    return (
        <div className="min-h-full">
            <style>{editorStyles}</style>
            <style>{scrollbarHideStyle}</style>
            {/* Header Section */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Manajemen Post</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Kelola konten dan artikel website
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Posts List - Full width on mobile/tablet, 4 cols on desktop */}
                <div className="lg:col-span-4">
                    <div className="card bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <style>{scrollbarHideStyle}</style>
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="font-semibold">Daftar Post</h2>
                                <div className="flex gap-2">
                                    <div className="dropdown dropdown-end">
                                        <label tabIndex={0} className="btn btn-ghost btn-sm gap-2">
                                            <FiFilter className="w-4 h-4" />
                                            <span className="hidden sm:inline">Filter</span>
                                        </label>
                                        <div tabIndex={0} className="dropdown-content z-[1] menu p-4 shadow bg-base-100 rounded-box w-52 mt-2">
                                            {/* Category Filter */}
                                            <div className="form-control w-full mb-2">
                                                <label className="label">
                                                    <span className="label-text text-sm">Kategori</span>
                                                </label>
                                                <select
                                                    value={filters.category}
                                                    onChange={(e) => setFilters(prev => ({
                                                        ...prev,
                                                        category: e.target.value
                                                    }))}
                                                    className="select select-bordered select-sm w-full"
                                                >
                                                    <option value="">Semua</option>
                                                    {categories.map(category => (
                                                        <option key={category.id} value={category.id}>
                                                            {category.judul}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Status Filter */}
                                            <div className="form-control w-full">
                                                <label className="label">
                                                    <span className="label-text text-sm">Status</span>
                                                </label>
                                                <select
                                                    value={filters.status}
                                                    onChange={(e) => setFilters(prev => ({
                                                        ...prev,
                                                        status: e.target.value
                                                    }))}
                                                    className="select select-bordered select-sm w-full"
                                                >
                                                    <option value="">Semua</option>
                                                    <option value="1">Published</option>
                                                    <option value="0">Draft</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleNewPost}
                                        className="btn btn-primary btn-sm gap-2"
                                    >
                                        <FiPlus className="w-4 h-4" />
                                        <span className="hidden sm:inline">Baru</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div 
                            className="overflow-y-auto scrollbar-hide" 
                            style={{ 
                                height: window.innerWidth >= 1024 ? '400px' : '200px'
                            }}
                        >
                            <div className="divide-y divide-gray-200">
                                {getFilteredPosts().map((post, index) => (
                                    <div
                                        key={post.id}
                                        className={`post-item p-4 cursor-pointer ${
                                            selectedPost?.id === post.id ? 'selected' : ''
                                        }`}
                                        onClick={() => setSelectedPost(post)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="font-medium line-clamp-1">
                                                    {post.judul}
                                                </h3>
                                                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                                                    <span className="badge badge-primary badge-sm">
                                                        {categories.find(c => c.id === post.kategori_id)?.judul}
                                                    </span>
                                                    <span className={`badge badge-sm ${
                                                        post.status === 1 
                                                            ? 'badge-success'
                                                            : 'badge-warning'
                                                    }`}>
                                                        {post.status === 1 ? 'Published' : 'Draft'}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEditClick(post);
                                                    }}
                                                    className="btn btn-ghost btn-sm btn-square"
                                                    title="Edit post"
                                                >
                                                    <FiEdit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(post.id);
                                                    }}
                                                    className="btn btn-ghost btn-sm btn-square text-error"
                                                    title="Hapus post"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {getFilteredPosts().length === 0 && (
                                    <div className="py-8 text-center opacity-60">
                                        {posts.length === 0 ? 'Belum ada post' : 'Tidak ada post yang sesuai filter'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Editor/Preview Section - Full width on mobile/tablet, 8 cols on desktop */}
                <div className="lg:col-span-8">
                    <div className="card bg-white rounded-xl shadow-sm border border-gray-200 min-h-[calc(100vh-12rem)]">
                        {showNewPostForm ? (
                            <div className="p-4 lg:p-6 transition-all duration-300 animate-fadeIn">
                                <h2 className="text-lg font-semibold mb-6">Buat Post Baru</h2>
                                <PostForm 
                                    onSubmit={handleSubmit}
                                    initialData={null}
                                    formData={formData}
                                    setFormData={setFormData}
                                    categories={categories}
                                    galleries={galleries}
                                    setIsEditing={setIsEditing}
                                    setEditingPost={setEditingPost}
                                    setShowNewPostForm={setShowNewPostForm}
                                    resetForm={resetForm}
                                    posts={posts}
                                />
                            </div>
                        ) : isEditing ? (
                            <div className="p-4 lg:p-6 transition-all duration-300 animate-fadeIn">
                                <h2 className="text-lg font-semibold mb-6">Edit Post</h2>
                                <PostForm 
                                    onSubmit={handleUpdate}
                                    initialData={editingPost}
                                    formData={formData}
                                    setFormData={setFormData}
                                    categories={categories}
                                    galleries={galleries}
                                    setIsEditing={setIsEditing}
                                    setEditingPost={setEditingPost}
                                    setShowNewPostForm={setShowNewPostForm}
                                    resetForm={resetForm}
                                    posts={posts}
                                />
                            </div>
                        ) : selectedPost ? (
                            <div className="p-4 lg:p-6 transition-all duration-300 animate-fadeIn">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                                    <div>
                                        <h2 className="text-xl font-semibold">
                                            {selectedPost.judul}
                                        </h2>
                                        <div className="mt-2 flex flex-wrap items-center gap-3">
                                            <span className="badge badge-primary">
                                                {categories.find(c => c.id === selectedPost.kategori_id)?.judul}
                                            </span>
                                            <span className={`badge ${
                                                selectedPost.status === 1 
                                                    ? 'badge-success'
                                                    : 'badge-warning'
                                            }`}>
                                                {selectedPost.status === 1 ? 'Published' : 'Draft'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 w-full sm:w-auto">
                                        <button
                                            onClick={() => handleEditClick(selectedPost)}
                                            className="btn btn-ghost btn-sm gap-2 flex-1 sm:flex-none"
                                        >
                                            <FiEdit2 className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(selectedPost.id)}
                                            className="btn btn-ghost btn-sm gap-2 text-error flex-1 sm:flex-none"
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                {/* Gallery Images */}
                                {selectedPost.gallery_images && selectedPost.gallery_images.length > 0 && (
                                    <div className="mb-8">
                                        <Swiper
                                            modules={[Navigation, Pagination]}
                                            navigation
                                            pagination={{ clickable: true }}
                                            className="w-full rounded-lg overflow-hidden aspect-video"
                                        >
                                            {selectedPost.gallery_images.map((image, index) => (
                                                <SwiperSlide key={index}>
                                                    <div className="w-full h-full bg-base-300">
                                                        <img
                                                            src={`http://localhost:5000/uploads/${image.file.replace(/^\/+|\/+$/g, '').replace(/\/+/g, '/')}`}
                                                            alt={`Gallery ${index + 1}`}
                                                            className="w-full h-full object-contain"
                                                            onError={(e) => {
                                                                e.target.src = "https://via.placeholder.com/800x600?text=Image+Not+Found";
                                                            }}
                                                        />
                                                    </div>
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>
                                    </div>
                                )}

                                {/* Post Content */}
                                <div className="prose max-w-none">
                                    <div 
                                        dangerouslySetInnerHTML={{ __html: selectedPost.isi }} 
                                        className="text-justify"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center min-h-[300px] lg:min-h-[calc(100vh-16rem)] text-center p-6 animate-fadeIn">
                                <div className="space-y-2">
                                    <FiFileText className="w-12 h-12 opacity-50 mx-auto" />
                                    <h3 className="font-semibold">Pilih Post</h3>
                                    <p className="text-sm opacity-70">
                                        Pilih post dari daftar atau buat post baru
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add daisyUI Dialogs */}
            <dialog id="confirm_delete" className="modal">
                <div className="modal-box bg-white rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-lg">Konfirmasi Hapus</h3>
                    <p className="py-4">Apakah Anda yakin ingin menghapus post ini?</p>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn btn-ghost mr-2">Batal</button>
                            <button onClick={confirmDelete} className="btn btn-error">Hapus</button>
                        </form>
                    </div>
                </div>
            </dialog>

            <dialog id="alert_success" className="modal">
                <div className="modal-box bg-white rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-lg">Berhasil</h3>
                    <p className="py-4">Operasi berhasil dilakukan</p>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">OK</button>
                        </form>
                    </div>
                </div>
            </dialog>

            <dialog id="alert_error" className="modal">
                <div className="modal-box bg-white rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-lg text-error">Error</h3>
                    <p className="py-4">Terjadi kesalahan. Silakan coba lagi.</p>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">OK</button>
                        </form>
                    </div>
                </div>
            </dialog>
        </div>
    );
};

export default PostsManagement; 