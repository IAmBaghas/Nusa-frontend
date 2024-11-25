import React, { useState, useEffect } from 'react';
import NewsCard from './NewsCard';

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

const NewsSection = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch posts using the web endpoint
                const postsResponse = await fetch('http://localhost:5000/api/posts/web');
                if (!postsResponse.ok) {
                    throw new Error(`HTTP error! status: ${postsResponse.status}`);
                }
                const postsData = await postsResponse.json();

                // Debug log
                console.log('Fetched posts:', postsData);

                // Fetch categories
                const categoriesResponse = await fetch('http://localhost:5000/api/categories');
                if (!categoriesResponse.ok) {
                    throw new Error(`HTTP error! status: ${categoriesResponse.status}`);
                }
                const categoriesData = await categoriesResponse.json();

                // Create categories map
                const categoriesMap = categoriesData.reduce((acc, cat) => {
                    acc[cat.id] = cat;
                    return acc;
                }, {});

                // Process and filter posts
                const processedPosts = postsData
                    .filter(post => post.status === 1)
                    .map(post => ({
                        ...post,
                        kategori: categoriesMap[post.kategori_id],
                        gallery_images: post.gallery_images?.map(img => ({
                            ...img,
                            file: img.file.startsWith('/') ? img.file : `/${img.file}`
                        }))
                    }))
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 3);

                // Debug log
                console.log('Processed posts:', processedPosts);

                setPosts(processedPosts);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching posts:', error);
                setError(error.message || 'Failed to load posts');
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (loading) {
        return (
            <div className="py-12">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-center">
                        <div className="animate-pulse space-y-8 w-full max-w-6xl">
                            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="space-y-3">
                                        <div className="h-48 bg-gray-200 rounded"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-12">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <div className="alert alert-error">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!posts.length) {
        return (
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">
                            Informasi Terkini
                        </h2>
                        <div className="divider divider-primary w-24 mx-auto"></div>
                    </div>
                    <div className="text-center text-gray-500">
                        Belum ada informasi terbaru
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16">
            <style>{swiperStyles}</style>
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">
                        Informasi Terkini
                    </h2>
                    <div className="divider bg-gray-800 w-24 h-1 rounded-full mx-auto"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                    {/* Latest Post */}
                    {posts[0] && (
                        <div className="lg:col-span-3 transform transition-all duration-300 hover:-translate-y-1">
                            <NewsCard
                                title={posts[0].judul}
                                content={posts[0].isi}
                                image={getImageUrl(posts[0])}
                                post={posts[0]}
                                isMainCard={true}
                            />
                        </div>
                    )}

                    {/* 2nd and 3rd Latest Posts */}
                    <div className="space-y-6">
                        {posts.slice(1, 3).map((post) => (
                            <div key={post.id} className="transform transition-all duration-300 hover:-translate-y-1">
                                <NewsCard
                                    title={post.judul}
                                    content={post.isi}
                                    image={getImageUrl(post)}
                                    post={post}
                                    isMainCard={false}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

const getImageUrl = (post) => {
    if (!post?.gallery_images?.[0]?.file) {
        return "https://via.placeholder.com/800x600?text=No+Image";
    }
    return `http://localhost:5000/uploads/${post.gallery_images[0].file.replace(/^\/+|\/+$/g, '').replace(/\/+/g, '/')}`;
};

export default NewsSection; 