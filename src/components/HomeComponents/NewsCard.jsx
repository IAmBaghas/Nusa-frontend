import React, { useState, useEffect } from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom';
import 'viewerjs/dist/viewer.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { FiHeart, FiMessageSquare } from 'react-icons/fi';
import axios from 'axios';

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

// Add scrollbar hide styles
const scrollbarHideStyle = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

// Add these styles at the top with your other styles
const modalStyles = `
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .modal-box {
    position: relative;
    background: white;
    border-radius: 0.5rem;
    max-height: 90vh;
    margin: 2rem;
    z-index: 10000;
    overflow-y: scroll;
    scrollbar-width: none;  /* Firefox */
    -ms-overflow-style: none;  /* IE and Edge */
  }

  .modal-box::-webkit-scrollbar {
    display: none;  /* Chrome, Safari, Opera */
  }

  .modal-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    cursor: pointer;
  }

  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9998;
  }
`;

// Add this style for body scrollbar control
const bodyScrollStyles = `
  body.modal-open {
    overflow: hidden;
  }
`;

const Modal = ({ 
    title, 
    content, 
    post, 
    onClose, 
    onLikeUpdate, 
    onCommentUpdate,
    initialLikes,
    initialComments,
    initialHasLiked
}) => {
    const [likes, setLikes] = useState(initialLikes);
    const [comments, setComments] = useState(initialComments);
    const [hasLiked, setHasLiked] = useState(initialHasLiked);
    const [newComment, setNewComment] = useState({ name: '', text: '' });
    const [commentError, setCommentError] = useState('');

    useEffect(() => {
        // Add class to body when modal opens
        document.body.classList.add('modal-open');
        
        // Remove class when modal closes
        return () => {
            document.body.classList.remove('modal-open');
        };
    }, []);

    const handleLike = async () => {
        try {
            if (hasLiked) {
                const response = await axios.delete(`http://localhost:5000/api/posts/${post.id}/like`);
                setLikes(response.data.likes_count);
                setHasLiked(false);
                onLikeUpdate(response.data.likes_count, false);
            } else {
                const response = await axios.post(`http://localhost:5000/api/posts/${post.id}/like`);
                setLikes(response.data.likes_count);
                setHasLiked(true);
                onLikeUpdate(response.data.likes_count, true);
            }
        } catch (error) {
            console.error('Error handling like:', error);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        try {
            setCommentError('');
            const response = await axios.post(`http://localhost:5000/api/posts/${post.id}/comment`, {
                commenterName: newComment.name,
                commentText: newComment.text
            });
            const updatedComments = [response.data, ...comments];
            setComments(updatedComments);
            onCommentUpdate(updatedComments);
            setNewComment({ name: '', text: '' });
        } catch (error) {
            console.error('Error adding comment:', error);
            setCommentError(error.response?.data?.message || 'Error adding comment');
        }
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return "https://via.placeholder.com/800x600?text=No+Image";
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:5000/uploads/${imagePath.replace(/^\/+|\/+$/g, '').replace(/\/+/g, '/')}`;
    };

    return ReactDOM.createPortal(
        <div className="modal modal-open">
            <style>{swiperStyles}</style>
            <style>{scrollbarHideStyle}</style>
            <style>{modalStyles}</style>
            <style>{bodyScrollStyles}</style>
            <div className="modal-box max-w-4xl" onClick={e => e.stopPropagation()}>
                <div className="sticky -top-6 -mx-6 px-6 pt-2 pb-4 bg-white z-30 border-b">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-2xl font-bold pr-8">{title}</h2>
                        <button 
                            className="modal-close btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                            onClick={onClose}
                        >
                            ✕
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="badge badge-primary">
                            {post.kategori?.judul || 'Uncategorized'}
                        </span>
                        <time className="text-sm text-base-content/70">
                            {moment(post.created_at).format('DD MMMM YYYY')}
                        </time>
                    </div>
                </div>

                {post.gallery_images?.length > 0 && (
                    <div className="mb-6">
                        <Swiper
                            modules={[Navigation, Pagination]}
                            spaceBetween={0}
                            slidesPerView={1}
                            navigation
                            pagination={{ clickable: true }}
                            className="w-full aspect-video rounded-box overflow-hidden"
                        >
                            {post.gallery_images.map((image, index) => (
                                <SwiperSlide key={image.id || index}>
                                    <div className="w-full h-full bg-base-300">
                                        <img
                                            src={getImageUrl(image.file)}
                                            alt={image.judul || `Gallery ${index + 1}`}
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                                console.error('Image load error:', image.file);
                                                e.target.src = "https://via.placeholder.com/800x600?text=Image+Not+Found";
                                            }}
                                        />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                )}

                <div className="prose prose-img:rounded-xl max-w-none text-justify mb-6">
                    {content && <div dangerouslySetInnerHTML={{ __html: content }} />}
                </div>

                <div className="divider"></div>

                <div className="flex items-center gap-4 mb-6">
                    <button 
                        onClick={handleLike}
                        className={`btn btn-ghost gap-2 ${hasLiked ? 'text-red-500' : ''}`}
                    >
                        <FiHeart className={hasLiked ? 'fill-current' : ''} />
                        {likes} likes
                    </button>
                    <div className="flex items-center gap-2">
                        <FiMessageSquare />
                        {comments.length} Komentar
                    </div>
                </div>

                <div className="space-y-6">
                    <form onSubmit={handleComment} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Nama Kamu..."
                            className="input input-bordered w-full"
                            value={newComment.name}
                            onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
                            required
                        />
                        <textarea
                            placeholder="Tuliskan Komentar Kamu!"
                            className="textarea textarea-bordered w-full"
                            value={newComment.text}
                            onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
                            required
                        />
                        {commentError && (
                            <div className="text-error text-sm bg-error/10 p-3 rounded">
                                {commentError}
                            </div>
                        )}
                        <button type="submit" className="btn btn-primary">
                            Tambah Komentar
                        </button>
                    </form>

                    <div className="space-y-4">
                        {comments.map((comment) => (
                            <div key={comment.id} className="bg-base-200 p-4 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-medium">{comment.commenter_name}</h4>
                                    <span className="text-xs text-gray-500">
                                        {moment(comment.created_at).fromNow()}
                                    </span>
                                </div>
                                <p className="mt-2 text-sm">{comment.comment_text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="modal-backdrop" onClick={onClose}>
                <button className="cursor-default" onClick={onClose}>close</button>
            </div>
        </div>,
        document.getElementById('modal-root')
    );
};

const NewsCard = ({ title, content, image, post, isMainCard }) => {
    const [showModal, setShowModal] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [likes, setLikes] = useState(0);
    const [comments, setComments] = useState([]);
    const [hasLiked, setHasLiked] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch initial likes and comments
    useEffect(() => {
        fetchLikesAndComments();
    }, [post.id]);

    // Add this function to fetch likes and comments
    const fetchLikesAndComments = async () => {
        try {
            const [likesRes, commentsRes, hasLikedRes] = await Promise.all([
                axios.get(`http://localhost:5000/api/posts/${post.id}/likes`),
                axios.get(`http://localhost:5000/api/posts/${post.id}/comments`),
                axios.get(`http://localhost:5000/api/posts/${post.id}/hasLiked`)
            ]);
            setLikes(likesRes.data.likes_count);
            setComments(commentsRes.data);
            setHasLiked(hasLikedRes.data.hasLiked);
        } catch (error) {
            console.error('Error fetching likes and comments:', error);
        }
    };

    // Update the Modal component to use these callbacks
    const handleLikeUpdate = (newLikesCount, newHasLiked) => {
        setLikes(newLikesCount);
        setHasLiked(newHasLiked);
    };

    const handleCommentUpdate = (newComments) => {
        setComments(newComments);
    };

    const formatDate = (date) => {
        return isMobile ? 
            moment(date).format('DD/MM/YY') : 
            moment(date).format('DD MMMM YYYY');
    };

    // Update the getImageUrl function
    const getImageUrl = (imagePath) => {
        if (!imagePath) return "https://via.placeholder.com/800x600?text=No+Image";
        // Remove any duplicate slashes and ensure proper path format
        return `http://localhost:5000/uploads/${imagePath.replace(/^\/+|\/+$/g, '').replace(/\/+/g, '/')}`;
    };

    const handleModalClose = (e) => {
        e.stopPropagation(); // Prevent event bubbling
        setShowModal(false);
    };

    return (
        <>
            <div 
                className="card h-full bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
                onClick={() => setShowModal(true)}
            >
                <figure className={`relative ${
                    isMainCard 
                        ? 'h-[200px] sm:h-[300px] lg:h-[650px]' 
                        : 'h-[200px] sm:h-[300px] lg:h-[250px]'
                }`}>
                    <img
                        src={getImageUrl(post.gallery_images?.[0]?.file)}
                        alt={title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = "https://via.placeholder.com/800x600?text=Image+Not+Found";
                        }}
                    />
                </figure>
                <div className="card-body p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="badge badge-primary badge-sm whitespace-nowrap">
                            {post.kategori?.judul || post.kategori_judul || 'Uncategorized'}
                        </span>
                        <span className="text-xs text-gray-500">
                            {formatDate(post.created_at)}
                        </span>
                    </div>
                    <h2 className="card-title text-base line-clamp-2">
                        {title}
                    </h2>
                    <div 
                        className="text-sm text-gray-600 line-clamp-2"
                        dangerouslySetInnerHTML={{ 
                            __html: content?.replace(/<[^>]*>/g, '') 
                        }}
                    />
                    <div className="flex items-center gap-4 mt-auto pt-4">
                        <div className={`flex items-center gap-1 ${hasLiked ? 'text-red-500' : 'text-gray-500'}`}>
                            <FiHeart className={hasLiked ? 'fill-current' : ''} />
                            <span className="text-sm">{likes}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                            <FiMessageSquare />
                            <span className="text-sm">{comments.length} Komentar</span>
                        </div>
                    </div>
                </div>
            </div>

            {showModal && (
                <Modal
                    title={title}
                    content={content}
                    post={post}
                    onClose={handleModalClose}
                    onLikeUpdate={handleLikeUpdate}
                    onCommentUpdate={handleCommentUpdate}
                    initialLikes={likes}
                    initialComments={comments}
                    initialHasLiked={hasLiked}
                />
            )}
        </>
    );
};

export default NewsCard; 