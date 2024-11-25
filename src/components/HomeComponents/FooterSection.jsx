import React, { useState, useEffect } from 'react';
import { MdEmail, MdPhone, MdFax } from 'react-icons/md';
import { FaInstagram, FaYoutube, FaLinkedin } from 'react-icons/fa';
import axios from 'axios';

const FooterSection = () => {
  const [footerContent, setFooterContent] = useState({
    contact: {
      email: 'info@sekolahnusantara.sch.id',
      phone: {
        number: '(0251) 123456',
        hours: 'Senin - Jumat, 07:00 - 16:00 WIB'
      },
      fax: '(0251) 654321'
    },
    socialMedia: {
      instagram: 'https://www.instagram.com/iambaghas/',
      youtube: 'https://www.youtube.com/@iambaghas',
      linkedin: 'www.linkedin.com/in/iambaghas'
    }
  });

  useEffect(() => {
    fetchFooterSettings();
  }, []);

  const fetchFooterSettings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/web-settings/component/footer');
      if (response.data) {
        setFooterContent(response.data);
      }
    } catch (error) {
      console.error('Error loading footer settings:', error);
      // Keep default values if there's an error
    }
  };

  return (
    <footer className="bg-neutral text-neutral-content">
      <div className="container mx-auto px-4">
        <div className="py-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 max-w-6xl mx-auto">
            {/* Left Section - Contact & Social Media */}
            <div className="md:col-span-3 space-y-4">
              {/* Contact Info */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-center md:text-left">Kontak Kami</h3>
                <div className="space-y-3 container mx-auto max-w-[300px] md:max-w-none">
                  <div className="flex items-start gap-3">
                    <MdEmail className="h-5 w-5 shrink-0 mt-1" />
                    <div className="text-left">
                      <p className="text-sm text-neutral-content/70">Email:</p>
                      <span className="transition-colors">
                        {footerContent.contact.email}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MdPhone className="h-5 w-5 shrink-0 mt-1" />
                    <div className="text-left">
                      <p className="text-sm text-neutral-content/70">Telepon:</p>
                      <span className="transition-colors">
                        {footerContent.contact.phone.number}
                      </span>
                      <p className="text-xs text-neutral-content/50">
                        {footerContent.contact.phone.hours}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MdFax className="h-5 w-5 shrink-0 mt-1" />
                    <div className="text-left">
                      <p className="text-sm text-neutral-content/70">Fax:</p>
                      <span>{footerContent.contact.fax}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-center md:text-left">Ikuti Kami</h3>
                <div className="flex gap-4 justify-center md:justify-start">
                  {footerContent.socialMedia.instagram && (
                    <a 
                      href={footerContent.socialMedia.instagram}
                      className="btn btn-circle btn-outline hover:bg-primary hover:border-primary p-2 text-neutral-content"
                      target="_blank" 
                      rel="noreferrer"
                    >
                      <FaInstagram className="h-6 w-6" />
                    </a>
                  )}
                  {footerContent.socialMedia.youtube && (
                    <a 
                      href={footerContent.socialMedia.youtube}
                      className="btn btn-circle btn-outline hover:bg-primary hover:border-primary p-2 text-neutral-content"
                      target="_blank" 
                      rel="noreferrer"
                    >
                      <FaYoutube className="h-6 w-6" />
                    </a>
                  )}
                  {footerContent.socialMedia.linkedin && (
                    <a 
                      href={footerContent.socialMedia.linkedin}
                      className="btn btn-circle btn-outline hover:bg-primary hover:border-primary p-2 text-neutral-content"
                      target="_blank" 
                      rel="noreferrer"
                    >
                      <FaLinkedin className="h-6 w-6" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Middle Section - App Promotion */}
            <div className="md:col-span-4 flex flex-col items-center">
              <h3 className="text-lg font-bold mb-4">Aplikasi Pusat Informasi</h3>
              <div className="card bg-base-100 text-neutral-content w-full max-w-[200px]">
                <div className="card-body items-center p-4">
                  <div className="w-24 h-24 mb-4">
                    <img 
                      src="https://i.imgur.com/0cL7dfb.png" 
                      alt="QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h4 className="card-title text-base mb-2 text-gray-700">Download Aplikasi</h4>
                  <div className="flex flex-col gap-2 w-full">
                    <button className="btn btn-primary btn-sm w-full">
                      Android
                    </button>
                    <button className="btn btn-primary btn-sm w-full">
                      iOS
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Map */}
            <div className="md:col-span-5">
              <h3 className="text-lg font-bold mb-4 text-center md:text-left">Lokasi Kami</h3>
              <div className="w-full h-[265px] rounded-box overflow-hidden">
                <iframe
                  title='Lokasi Sekolah'
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15956.976634288541!2d116.70281020184618!3d-0.9720383842316875!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2df6c8d016c5f4d3%3A0x7f3ec0293b820aa4!2sNusantara%2C%20Bumi%20Harapan%2C%20Sepaku%2C%20Penajam%20North%20Paser%20Regency%2C%20East%20Kalimantan!5e0!3m2!1sen!2sid!4v1731744126247!5m2!1sen!2sid"
                  width="100%"
                  height="265px"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-base-100/10 py-4 text-center text-sm">
          <p>© {new Date().getFullYear()} Sekolah Nusantara. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection; 