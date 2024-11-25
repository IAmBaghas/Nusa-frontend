import React from 'react';
import HeaderSection from '../components/HomeComponents/HeaderSection';
import BannerSection from '../components/HomeComponents/BannerSection';
import LogoSection from '../components/HomeComponents/LogoSection';
import AboutSection from '../components/HomeComponents/AboutSection';
import NewsSection from '../components/HomeComponents/NewsSection';
import AgendaSection from '../components/HomeComponents/AgendaSection';
import PostsSection from '../components/HomeComponents/PostsSection';
import BackgroundShapes from '../components/HomeComponents/BackgroundShapes';
import FooterSection from '../components/HomeComponents/FooterSection';

const Home = () => {
  return (
    <div className="relative overflow-hidden">
      <HeaderSection />

      <div className="relative">
        <BannerSection />
        <LogoSection />

        <div className="relative">
          <BackgroundShapes />

          {/* Konten */}
          <div className="relative z-[15]">
            <div className="mt-[-24px] mx-12">
              <AboutSection />
            </div>

            <div>
              <NewsSection />
            </div>

            <div className="mx-12">
              <AgendaSection />
            </div>

            <div className="mx-12">
              <PostsSection />
            </div>

            <div>
              <FooterSection />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
