import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiFileText, 
  FiImage, 
  FiCalendar, 
  FiEye, 
  FiEdit, 
  FiPlusCircle 
} from 'react-icons/fi';

const formatDate = (dateString) => {
  if (!dateString) return 'Tanggal tidak tersedia';
  
  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Tanggal tidak valid';
    }

    // Format the date
    const options = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    
    return date.toLocaleDateString('id-ID', options);
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Tanggal tidak valid';
  }
};

const DashboardHome = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    posts: {
      total: 0,
      published: 0,
      draft: 0
    },
    galleries: {
      total: 0,
      totalImages: 0
    },
    agenda: {
      total: 0,
      upcoming: 0
    }
  });

  const [recentItems, setRecentItems] = useState({
    posts: [],
    galleries: [],
    agenda: []
  });

  useEffect(() => {
    fetchStats();
    fetchRecentItems();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
        // Use the correct web endpoint for posts
        const postsResponse = await fetch('http://localhost:5000/api/posts/web');
        if (!postsResponse.ok) throw new Error('Failed to fetch posts');
        const posts = await postsResponse.json();
        
        // Use the galleries stats endpoint
        const galleriesResponse = await fetch('http://localhost:5000/api/gallery/stats');
        if (!galleriesResponse.ok) throw new Error('Failed to fetch galleries');
        const galleriesStats = await galleriesResponse.json();
        
        // Use the agenda endpoint
        const agendaResponse = await fetch('http://localhost:5000/api/agenda');
        if (!agendaResponse.ok) throw new Error('Failed to fetch agenda');
        const agenda = await agendaResponse.json();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingEvents = agenda.filter(event => {
            if (!event?.start_date) return false;
            const eventDate = new Date(event.start_date);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate >= today;
        }).length;

        setStats({
            posts: {
                total: posts?.length || 0,
                published: posts?.filter(post => post.status === 1)?.length || 0,
                draft: posts?.filter(post => post.status === 0)?.length || 0
            },
            galleries: {
                total: galleriesStats.totalGalleries || 0,
                totalImages: galleriesStats.totalGalleryPhotos || 0
            },
            agenda: {
                total: agenda?.length || 0,
                upcoming: upcomingEvents
            }
        });

        // Update recent items with the new gallery data
        setRecentItems(prev => ({
            ...prev,
            galleries: galleriesStats.recentGalleries || []
        }));

    } catch (error) {
        console.error('Error fetching stats:', error);
    } finally {
        setLoading(false);
    }
  };

  const fetchRecentItems = async () => {
    try {
        const postsResponse = await fetch('http://localhost:5000/api/posts/web');
        if (!postsResponse.ok) throw new Error('Failed to fetch posts');
        const posts = await postsResponse.json();
        
        const agendaResponse = await fetch('http://localhost:5000/api/agenda');
        if (!agendaResponse.ok) throw new Error('Failed to fetch agenda');
        const agenda = await agendaResponse.json();

        setRecentItems(prev => ({
            ...prev,
            posts: Array.isArray(posts) ? posts.slice(0, 5) : [],
            agenda: Array.isArray(agenda) ? agenda.slice(0, 5) : []
        }));
    } catch (error) {
        console.error('Error fetching recent items:', error);
    }
  };

  const StatCard = ({ icon: Icon, title, value, description, to }) => (
    <Link to={to} className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow border-2 border-gray-100">
      <div className="card-body">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="card-title text-2xl font-bold">{value}</h2>
            <p className="text-sm opacity-70">{title}</p>
            {description && (
              <p className="text-xs mt-2 opacity-60">{description}</p>
            )}
          </div>
          <Icon className="w-6 h-6 opacity-40" />
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return <div className="flex justify-center items-center min-h-full">
        <span className="loading loading-spinner loading-lg"></span>
    </div>;
  }

  return (
    <div className="min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Overview statistik dan aktivitas website
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 ">
        <StatCard
          icon={FiFileText}
          title="Total Postingan"
          value={stats.posts.total}
          description={`${stats.posts.published} published, ${stats.posts.draft} draft`}
          to="/admin/posts"
        />
        <StatCard
          icon={FiImage}
          title="Total Gallery"
          value={stats.galleries.total}
          description={`${stats.galleries.totalImages} foto`}
          to="/admin/gallery"
        />
        <StatCard
          icon={FiCalendar}
          title="Total Agenda"
          value={stats.agenda.total}
          description={`${stats.agenda.upcoming} agenda mendatang`}
          to="/admin/agenda"
        />
      </div>

      {/* Quick Actions */}
      <div className="card bg-base-100 shadow-sm border-2 border-gray-100 mb-8">
        <div className="card-body">
          <h2 className="card-title text-lg mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Link to="/admin/posts" className="btn btn-outline gap-2">
              <FiPlusCircle className="w-4 h-4" />
              Buat Post
            </Link>
            <Link to="/admin/gallery" className="btn btn-outline gap-2">
              <FiPlusCircle className="w-4 h-4" />
              Buat Gallery
            </Link>
            <Link to="/admin/agenda" className="btn btn-outline gap-2">
              <FiPlusCircle className="w-4 h-4" />
              Buat Agenda
            </Link>
            <Link to="/admin/web-edit" className="btn btn-outline gap-2">
              <FiEdit className="w-4 h-4" />
              Edit Website
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Items Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Posts */}
        <div className="card bg-base-100 shadow-sm border-2 border-gray-100">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-title text-lg">Post Terbaru</h2>
              <Link to="/admin/posts" className="btn btn-ghost btn-sm gap-2">
                <FiEye className="w-4 h-4" />
                Lihat Semua
              </Link>
            </div>
            
            <div className="divide-y">
              {recentItems.posts.map(post => (
                <div key={post.id} className="py-3">
                  <h3 className="font-medium line-clamp-1">{post.judul}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`badge badge-sm ${
                      post.status === 1 ? 'badge-success' : 'badge-warning'
                    }`}>
                      {post.status === 1 ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-xs opacity-60">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}

              {recentItems.posts.length === 0 && (
                <div className="py-8 text-center opacity-60">
                  Belum ada post
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Galleries */}
        <div className="card bg-base-100 shadow-sm border-2 border-gray-100">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-title text-lg">Galeri Terbaru</h2>
              <Link to="/admin/gallery" className="btn btn-ghost btn-sm gap-2">
                <FiEye className="w-4 h-4" />
                Lihat Semua
              </Link>
            </div>
            
            <div className="divide-y">
              {recentItems.galleries.map(gallery => (
                <div key={gallery.id} className="py-3">
                  <h3 className="font-medium line-clamp-1">{gallery.name}</h3>
                  <p className="text-xs opacity-60 mt-1">
                    {gallery.photo_count} foto
                  </p>
                </div>
              ))}

              {recentItems.galleries.length === 0 && (
                <div className="py-8 text-center opacity-60">
                  Belum ada galeri
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Agenda */}
        <div className="card bg-base-100 shadow-sm border-2 border-gray-100">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-title text-lg">Agenda Terbaru</h2>
              <Link to="/admin/agenda" className="btn btn-ghost btn-sm gap-2">
                <FiEye className="w-4 h-4" />
                Lihat Semua
              </Link>
            </div>
            
            <div className="divide-y">
              {recentItems.agenda.map(event => (
                <div key={event.id} className="py-3">
                  <h3 className="font-medium line-clamp-1">{event.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs opacity-60">
                      {event && event.start_date ? formatDate(event.start_date) : 'Tanggal tidak tersedia'}
                    </span>
                  </div>
                </div>
              ))}

              {recentItems.agenda.length === 0 && (
                <div className="py-8 text-center opacity-60">
                  Belum ada agenda
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome; 