import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LogoSection = () => {
  const [logos, setLogos] = useState([]);
  const [sectionEnabled, setSectionEnabled] = useState(false);

  useEffect(() => {
    fetchLogoSettings();
  }, []);

  const fetchLogoSettings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/web-settings/component/logos');
      if (response.data) {
        const updatedLogos = response.data.logos?.map(logo => 
          logo ? `http://localhost:5000/uploads/logo/${logo.split('/').pop()}` : null
        ).filter(Boolean) || [];
        
        setLogos(updatedLogos);
        setSectionEnabled(response.data.enabled || false);
      }
    } catch (error) {
      console.error('Error loading logo settings:', error);
      setLogos([]);
      setSectionEnabled(false);
    }
  };

  // Return an empty div with negative margin to maintain spacing when disabled
  if (!sectionEnabled || logos.length === 0) {
    return <div className="h-0 mt-8 md:mt-8 lg:mt-20" />;
  }

  // Calculate dynamic size classes based on number of logos
  const getLogoSizeClass = () => {
    const count = logos.length;
    if (count <= 4) return 'h-16 md:h-24 lg:h-28 xl:h-32';
    if (count <= 6) return 'h-14 md:h-20 lg:h-24 xl:h-28';
    if (count <= 8) return 'h-12 md:h-16 lg:h-20 xl:h-24';
    return 'h-10 md:h-14 lg:h-16 xl:h-20'; // 9 or more logos
  };

  // Calculate gap size based on number of logos
  const getGapClass = () => {
    const count = logos.length;
    if (count <= 4) return 'gap-6 md:gap-4';
    if (count <= 6) return 'gap-4 md:gap-3';
    if (count <= 8) return 'gap-3 md:gap-2';
    return 'gap-2 md:gap-1'; // 9 or more logos
  };

  return (
    <div className='relative transform -translate-y-16 md:-translate-y-20 lg:-translate-y-24 px-4 lg:px-8'>
      <div className='bg-white w-full max-w-7xl mx-auto rounded-[20px] shadow-lg'>
        <div className={`flex flex-row justify-center md:justify-evenly items-center h-full px-4 md:p-4 ${getGapClass()} overflow-x-auto no-scrollbar py-6`}>
          {logos.map((logo, index) => (
            <div key={index} className='flex-none md:flex-1 flex justify-center w-[80px] md:w-auto'>
              <img 
                src={logo}
                alt={`Logo ${index + 1}`}
                className={`${getLogoSizeClass()} object-contain transition-all duration-300`}
                onError={(e) => {
                  console.error('Failed to load logo:', logo);
                  e.target.style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LogoSection; 