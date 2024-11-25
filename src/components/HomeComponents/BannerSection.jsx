import React, { useState, useEffect } from 'react';
import axios from 'axios';
import defaultBanner from '../../assets/images/Placeholder.png';

const BannerSection = () => {
    const [bannerUrl, setBannerUrl] = useState(defaultBanner);
    const [bannerText, setBannerText] = useState({
        welcome: 'Selamat Datang',
        title: 'Sekolah Indonesia',
        subtitle: 'Instansi Pendidikan'
    });

    useEffect(() => {
        fetchBannerSettings();
    }, []);

    const fetchBannerSettings = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/web-settings/component/banner');
            
            if (response.data) {
                // Set banner image if exists with correct path
                if (response.data.image) {
                    setBannerUrl(`http://localhost:5000/uploads/banner/${response.data.image.split('/').pop()}`);
                }

                // Set banner text if exists
                if (response.data.text) {
                    setBannerText(response.data.text);
                }
            }
        } catch (error) {
            console.error('Error loading banner settings:', error);
            setBannerUrl(defaultBanner);
        }
    };

    const handleBannerError = (e) => {
        console.error('Failed to load banner image:', bannerUrl);
        e.target.src = defaultBanner;
    };

    return (
        <div className="relative">
            <img 
                src={bannerUrl}
                className="w-full h-[300px] md:h-[500px] lg:h-[700px] object-cover" 
                alt="Banner"
                onError={handleBannerError}
            />
            <div className="absolute inset-0 bg-black opacity-60"></div>
            <div>
                <div className="absolute top-[55%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full px-4">
                    {bannerText.welcome && (
                        <h2 className="text-white font-bold text-[16px] md:text-[30px] lg:text-[36px]">
                            {bannerText.welcome}
                        </h2>
                    )}
                    {bannerText.title && (
                        <h1 className="text-white font-bold text-[24px] md:text-[50px] lg:text-[60px] mt-[-8px] lg:mt-[-12px]">
                            {bannerText.title}
                        </h1>
                    )}
                    {bannerText.subtitle && (
                        <h2 className="text-white font-bold text-[16px] md:text-[30px] lg:text-[36px] mt-[-8px] lg:mt-[-12px]">
                            {bannerText.subtitle}
                        </h2>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BannerSection; 