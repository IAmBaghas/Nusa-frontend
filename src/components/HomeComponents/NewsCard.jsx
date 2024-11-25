import React, { useState, useEffect } from 'react';
import moment from 'moment';
import ReactDOM from 'react-dom';
import 'viewerjs/dist/viewer.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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

const Modal = ({ title, content, post, onClose }) => {
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return ReactDOM.createPortal(
        <div className="modal modal-open" style={{ zIndex: 10000 }}>
            <style>{swiperStyles}</style>
            <style>{scrollbarHideStyle}</style>
            <style>{`
                .prose a {
                    text-decoration: none;
                    color: #1e40af;
                    position: relative;
                    display: inline-block;
                    transition: color 0.2s;
                }

                .prose a:hover {
                    color: #2563eb;
                }

                .prose a::after {
                    content: '🔗';
                    font-size: 0.8em;
                    margin-left: 0.2em;
                    opacity: 0.5;
                }
            `}</style>
            <div className="modal-box max-w-4xl overflow-y-auto scrollbar-hide">
                <div className="sticky -top-6 -mx-6 px-6 pt-2 pb-4 bg-white z-30 border-b">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-2xl font-bold pr-8">{title}</h2>
                        <button 
                            onClick={onClose} 
                            className="btn btn-sm btn-circle btn-ghost"
                        >✕</button>
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
                                <SwiperSlide key={image.id}>
                                    <div className="w-full h-full bg-base-300">
                                        <img
                                            src={`http://localhost:5000${image.file}`}
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

                <div 
                    className="prose prose-img:rounded-xl max-w-none text-justify"
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            </div>
            <div className="modal-backdrop" onClick={onClose}></div>
        </div>,
        document.getElementById('overlay-root')
    );
};

const NewsCard = ({ title, content, image, post, isMainCard }) => {
    const [showModal, setShowModal] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <Modal
                    title={title}
                    content={content}
                    post={{
                        ...post,
                        kategori: post.kategori || { judul: post.kategori_judul },
                        gallery_images: post.gallery_images?.map(img => ({
                            ...img,
                            file: `/uploads/${img.file.replace(/^\/uploads\//, '')}`
                        }))
                    }}
                    onClose={() => setShowModal(false)}
                />
            )}
        </>
    );
};

export default NewsCard; 