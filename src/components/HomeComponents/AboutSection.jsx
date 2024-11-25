import React, { useState, useEffect } from 'react';
import axios from 'axios';
import placeholder from '../../assets/images/Placeholder.png';

const AboutSection = () => {
  const [content, setContent] = useState({
    name: '',
    title: '',
    description: '',
    image: null,
    vision: '',
    missions: []
  });

  useEffect(() => {
    fetchAboutSettings();
  }, []);

  const fetchAboutSettings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/web-settings/component/about');
      if (response.data) {
        const updatedContent = {
          ...response.data,
          image: response.data.image ? `http://localhost:5000/uploads/about/${response.data.image.split('/').pop()}` : null
        };
        setContent(updatedContent);
      }
    } catch (error) {
      console.error('Error loading about settings:', error);
      // Keep default values if there's an error
    }
  };

  const handleImageError = (e) => {
    console.error('Failed to load image:', content.image);
    e.target.src = placeholder;
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px,1fr] lg:gap-16">
          {/* Profile Card */}
          <div className="h-fit card bg-base-100 shadow-md border border-base-200/80 w-[300px] mx-auto lg:mx-0">
            <figure className="px-4 pt-4 pb-2">
              <div className="aspect-[3/4] w-full relative">
                <img
                  src={content.image || placeholder}
                  alt={content.name || 'Headmaster'}
                  className="rounded-xl object-cover absolute inset-0 w-full h-full shadow-sm"
                  onError={handleImageError}
                />
              </div>
            </figure>
            <div className="card-body p-4 pt-2">
              <h3 className="card-title justify-center text-lg mb-0">{content.name}</h3>
              <p className="text-base-content/70 justify-center text-center mt-0">{content.title}</p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Description */}
            <div className="card bg-base-100 shadow-md border border-base-200/80">
              <div className="card-body">
                <p className="text-base-content/80 text-justify leading-relaxed whitespace-pre-line">
                  {content.description}
                </p>
              </div>
            </div>

            {/* Vision & Mission */}
            <div className="space-y-6">
              {/* Vision Card */}
              <div className="card bg-base-100 shadow-md border border-base-200/80">
                <div className="card-body">
                  <h3 className="card-title text-xl mb-3">Visi</h3>
                  <p className="text-base-content/80 leading-relaxed">
                    {content.vision}
                  </p>
                </div>
              </div>

              {/* Mission Card */}
              <div className="card bg-base-100 shadow-md border border-base-200/80">
                <div className="card-body">
                  <h3 className="card-title text-xl mb-3">Misi</h3>
                  <ul className="space-y-3">
                    {content.missions.map((mission, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="text-primary font-semibold">{index + 1}.</span>
                        <span className="text-base-content/80 leading-relaxed">{mission}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection; 