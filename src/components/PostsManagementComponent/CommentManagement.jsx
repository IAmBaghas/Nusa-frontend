import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { FiFilter, FiTrash2, FiMessageSquare } from 'react-icons/fi';

const CommentManagement = () => {
    const [posts, setPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        category: ''
    });
    const [categories, setCategories] = useState([]);
    const [commentToDelete, setCommentToDelete] = useState(null);

    useEffect(() => {
        fetchPosts();
        fetchCategories();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/posts/web');
            const postsWithComments = await Promise.all(
                response.data.map(async (post) => {
                    const commentsRes = await axios.get(`http://localhost:5000/api/posts/${post.id}/comments`);
                    return {
                        ...post,
                        comments: commentsRes.data
                    };
                })
            );
            setPosts(postsWithComments);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            document.getElementById('confirm_delete_comment').close();
            
            await axios.delete(`http://localhost:5000/api/posts/comments/${commentId}`);
            
            if (selectedPost) {
                const updatedComments = selectedPost.comments.filter(comment => comment.id !== commentId);
                setSelectedPost({
                    ...selectedPost,
                    comments: updatedComments
                });
                
                setPosts(currentPosts => currentPosts.map(post => 
                    post.id === selectedPost.id 
                        ? { ...post, comments: updatedComments }
                        : post
                ));
            }

            setCommentToDelete(null);
            
            const successModal = document.getElementById('alert_success');
            if (successModal) {
                successModal.showModal();
                setTimeout(() => {
                    successModal.close();
                }, 2000);
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            const errorModal = document.getElementById('alert_error');
            if (errorModal) {
                errorModal.showModal();
                setTimeout(() => {
                    errorModal.close();
                }, 2000);
            }
        }
    };

    const getFilteredPosts = () => {
        return posts.filter(post => {
            const categoryMatch = !filters.category || post.kategori_id === Number(filters.category);
            const searchMatch = post.judul.toLowerCase().includes(searchQuery.toLowerCase());
            return categoryMatch && searchMatch;
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Posts List */}
            <div className="lg:col-span-4">
                <div className="card bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold">Daftar Post</h2>
                            <div className="dropdown dropdown-end">
                                <label tabIndex={0} className="btn btn-ghost btn-sm gap-2">
                                    <FiFilter className="w-4 h-4" />
                                    <span className="hidden sm:inline">Filter</span>
                                </label>
                                <div tabIndex={0} className="dropdown-content z-[1] menu p-4 shadow bg-base-100 rounded-box w-52 mt-2">
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
                                </div>
                            </div>
                        </div>
                        <div className="mt-4">
                            <input
                                type="text"
                                placeholder="Cari post..."
                                className="input input-bordered w-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-y-auto scrollbar-hide" style={{ height: '400px' }}>
                        <div className="divide-y divide-gray-200">
                            {getFilteredPosts().map((post) => (
                                <div
                                    key={post.id}
                                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                                        selectedPost?.id === post.id ? 'bg-gray-50 border-l-4 border-primary' : ''
                                    }`}
                                    onClick={() => setSelectedPost(post)}
                                >
                                    <h3 className="font-medium line-clamp-1">{post.judul}</h3>
                                    <div className="mt-1 flex items-center gap-2 text-sm">
                                        <span className="badge badge-primary badge-sm">
                                            {categories.find(c => c.id === post.kategori_id)?.judul}
                                        </span>
                                        <div className="flex items-center gap-1 text-gray-500">
                                            <FiMessageSquare className="w-4 h-4" />
                                            <span>{post.comments?.length || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Comments Section */}
            <div className="lg:col-span-8">
                <div className="card bg-white rounded-xl shadow-sm border border-gray-200">
                    {selectedPost ? (
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">{selectedPost.judul}</h2>
                            
                            <div className="divide-y divide-gray-200">
                                {selectedPost.comments?.length > 0 ? (
                                    selectedPost.comments.map((comment) => (
                                        <div key={comment.id} className="py-3 flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-medium">
                                                        {comment.commenter_name} 
                                                        <span className="text-gray-500 font-normal">
                                                            ({comment.ip_address})
                                                        </span>
                                                    </h4>
                                                    <span className="text-sm text-gray-500">
                                                        {moment(comment.created_at).format('DD MMM YYYY, HH:mm')}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-gray-600">{comment.comment_text}</p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setCommentToDelete(comment);
                                                    const modal = document.getElementById('confirm_delete_comment');
                                                    if (modal) modal.showModal();
                                                }}
                                                className="btn btn-ghost btn-sm text-error"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        Belum ada komentar untuk post ini
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-6">
                            <FiMessageSquare className="w-12 h-12 opacity-50 mb-2" />
                            <h3 className="font-semibold">Pilih Post</h3>
                            <p className="text-sm opacity-70">
                                Pilih post untuk melihat komentar
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <dialog id="confirm_delete_comment" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Konfirmasi Hapus</h3>
                    <p className="py-4">
                        Apakah Anda yakin ingin menghapus komentar ini?
                        {commentToDelete && (
                            <div className="mt-2 p-3 bg-base-200 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <span className="font-medium">{commentToDelete.commenter_name}</span>
                                    <span className="text-sm text-gray-500">
                                        {moment(commentToDelete.created_at).format('DD MMM YYYY, HH:mm')}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm">{commentToDelete.comment_text}</p>
                            </div>
                        )}
                    </p>
                    <div className="modal-action">
                        <button 
                            className="btn btn-ghost"
                            onClick={() => {
                                setCommentToDelete(null);
                                document.getElementById('confirm_delete_comment').close();
                            }}
                        >
                            Batal
                        </button>
                        <button 
                            className="btn btn-error"
                            onClick={() => {
                                if (commentToDelete) {
                                    handleDeleteComment(commentToDelete.id);
                                }
                            }}
                        >
                            Hapus
                        </button>
                    </div>
                </div>
            </dialog>

            {/* Success Alert */}
            <dialog id="alert_success" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Berhasil</h3>
                    <p className="py-4">Komentar berhasil dihapus</p>
                    <div className="modal-action">
                        <form method="dialog">
                            <button className="btn">OK</button>
                        </form>
                    </div>
                </div>
            </dialog>

            {/* Error Alert */}
            <dialog id="alert_error" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg text-error">Error</h3>
                    <p className="py-4">Gagal menghapus komentar</p>
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

export default CommentManagement;
