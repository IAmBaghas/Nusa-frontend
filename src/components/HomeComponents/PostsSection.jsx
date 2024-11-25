import React, { useState, useEffect } from 'react';
import NewsCard from './NewsCard';

const PostsSection = () => {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);

    // Calculate posts per page based on screen size
    const getPostsPerPage = () => {
        if (window.innerWidth >= 1024) return 8;
        if (window.innerWidth >= 768) return 6;
        return 4;
    };

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/categories');
                if (!response.ok) throw new Error('Failed to fetch categories');
                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setError('Failed to load categories');
            }
        };

        fetchCategories();
    }, []);

    // Fetch posts
    useEffect(() => {
        setLoading(true);
        setPosts([]);
        setPage(1);
        setHasMore(true);
        setError(null);
        fetchPosts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategory]);

    const fetchPosts = async (pageNum) => {
        try {
            setLoadingMore(true);
            
            // Fetch posts from web endpoint
            const postsResponse = await fetch('http://localhost:5000/api/posts/web');
            if (!postsResponse.ok) throw new Error('Failed to fetch posts');
            const postsData = await postsResponse.json();
            
            // Create a map of categories for easy lookup
            const categoriesMap = categories.reduce((acc, category) => {
                acc[category.id] = category;
                return acc;
            }, {});

            // Filter posts based on category and status
            const filteredPosts = postsData.filter(post => {
                const categoryMatch = selectedCategory === 'all' || 
                    post.kategori_id === parseInt(selectedCategory);
                const statusMatch = post.status === 1;
                return categoryMatch && statusMatch;
            });

            // Map category objects to posts
            const postsWithCategories = filteredPosts.map(post => ({
                ...post,
                kategori: categoriesMap[post.kategori_id] || null
            }));

            // Sort posts by date
            const sortedPosts = postsWithCategories.sort((a, b) => 
                new Date(b.created_at) - new Date(a.created_at)
            );

            // Paginate posts
            const postsPerPage = getPostsPerPage();
            const start = 0;
            const end = pageNum * postsPerPage;
            const paginatedPosts = sortedPosts.slice(start, end);

            setPosts(paginatedPosts);
            setHasMore(paginatedPosts.length < sortedPosts.length);
            setLoading(false);
            setLoadingMore(false);
            setError(null);

        } catch (error) {
            console.error('Error fetching posts:', error);
            setError('Failed to load posts');
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchPosts(nextPage);
        }
    };

    // Update the image URL construction
    const getImageUrl = (post) => {
        if (!post?.gallery_images?.[0]?.file) {
            return "https://via.placeholder.com/800x600?text=No+Image";
        }
        return `http://localhost:5000/uploads/${post.gallery_images[0].file.replace(/^\/+|\/+$/g, '').replace(/\/+/g, '/')}`;
    };

    if (error) {
        return (
            <section className="py-12">
                <div className="container mx-auto px-4">
                    <div className="text-center text-red-500">
                        {error}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-12">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                        Galeri & Publikasi
                    </h2>
                    <div className="divider bg-gray-800 w-24 h-1 rounded-full mx-auto"></div>
                </div>

                {/* Category Filter */}
                <div className="mb-8">
                    {/* Mobile view */}
                    <div className="grid grid-cols-2 gap-2 md:hidden">
                        <div className="col-span-2 mb-2">
                            <button
                                className={`btn btn-sm w-full ${
                                    selectedCategory === 'all' ? 'btn-primary' : 'btn-ghost'
                                }`}
                                onClick={() => setSelectedCategory('all')}
                            >
                                Semua
                            </button>
                        </div>
                        {categories.map(category => (
                            <button
                                key={category.id}
                                className={`btn btn-sm w-full ${
                                    selectedCategory === category.id.toString() 
                                        ? 'btn-primary' 
                                        : 'btn-ghost'
                                }`}
                                onClick={() => setSelectedCategory(category.id.toString())}
                            >
                                {category.judul}
                            </button>
                        ))}
                    </div>

                    {/* Desktop view */}
                    <div className="hidden md:flex justify-center">
                        <div className="join">
                            <button
                                className={`join-item btn btn-sm ${
                                    selectedCategory === 'all' ? 'btn-primary' : 'btn-ghost'
                                }`}
                                onClick={() => setSelectedCategory('all')}
                            >
                                Semua
                            </button>
                            {categories.map(category => (
                                <button
                                    key={category.id}
                                    className={`join-item btn btn-sm ${
                                        selectedCategory === category.id.toString() 
                                            ? 'btn-primary' 
                                            : 'btn-ghost'
                                    }`}
                                    onClick={() => setSelectedCategory(category.id.toString())}
                                >
                                    {category.judul}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="loading loading-spinner loading-lg"></div>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Tidak ada post dalam kategori ini
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {posts.map((post) => (
                                <div key={post.id} className="h-[300px] md:h-[350px] lg:h-[400px] transform transition-all duration-300 hover:-translate-y-1">
                                    <NewsCard 
                                        title={post.judul}
                                        content={post.isi}
                                        image={getImageUrl(post)}
                                        category={post.kategori_judul}
                                        post={post}
                                    />
                                </div>
                            ))}
                        </div>

                        {hasMore && (
                            <div className="text-center mt-8">
                                <button 
                                    onClick={loadMore}
                                    className="btn btn-primary"
                                    disabled={loadingMore}
                                >
                                    {loadingMore ? (
                                        <span className="loading loading-spinner"></span>
                                    ) : (
                                        'Lihat lebih banyak'
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
};

export default PostsSection; 