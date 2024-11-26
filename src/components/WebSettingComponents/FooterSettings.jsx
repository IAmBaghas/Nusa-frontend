import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Toast from '../Toast';

const FooterSettings = () => {
    const [content, setContent] = useState({
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
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/web-settings/component/footer');
            if (response.data) {
                setContent(response.data);
            }
        } catch (error) {
            console.error('Error loading footer settings:', error);
            setToast({
                show: true,
                message: 'Failed to load footer settings',
                type: 'error'
            });
        }
    };

    const handleSave = async () => {
        try {
            await axios.put(
                'http://localhost:5000/api/web-settings/component/footer',
                { settings: content }
            );
            
            setToast({
                show: true,
                message: 'Footer settings saved successfully',
                type: 'success'
            });
        } catch (error) {
            console.error('Error saving footer settings:', error);
            setToast({
                show: true,
                message: 'Failed to save settings',
                type: 'error'
            });
        }
    };

    return (
        <div className="space-y-8">
            {/* Header Card */}
            <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Footer Section</h3>
                    <p className="text-sm text-gray-500">Kustomisasi informasi kontak dan media sosial</p>
                </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
                <h4 className="font-medium text-lg">Informasi Kontak</h4>
                <div className="grid gap-6">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Email</span>
                        </label>
                        <input
                            type="email"
                            value={content.contact.email}
                            onChange={(e) => setContent(prev => ({
                                ...prev,
                                contact: { ...prev.contact, email: e.target.value }
                            }))}
                            className="input input-bordered w-full"
                            placeholder="email@sekolah.com"
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Nomor Telepon</span>
                        </label>
                        <input
                            type="text"
                            value={content.contact.phone.number}
                            onChange={(e) => setContent(prev => ({
                                ...prev,
                                contact: {
                                    ...prev.contact,
                                    phone: { ...prev.contact.phone, number: e.target.value }
                                }
                            }))}
                            className="input input-bordered w-full"
                            placeholder="(0251) 123456"
                        />
                        <input
                            type="text"
                            value={content.contact.phone.hours}
                            onChange={(e) => setContent(prev => ({
                                ...prev,
                                contact: {
                                    ...prev.contact,
                                    phone: { ...prev.contact.phone, hours: e.target.value }
                                }
                            }))}
                            className="input input-bordered w-full mt-2"
                            placeholder="Senin - Jumat, 07:00 - 16:00 WIB"
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Fax</span>
                        </label>
                        <input
                            type="text"
                            value={content.contact.fax}
                            onChange={(e) => setContent(prev => ({
                                ...prev,
                                contact: { ...prev.contact, fax: e.target.value }
                            }))}
                            className="input input-bordered w-full"
                            placeholder="(0251) 654321"
                        />
                    </div>
                </div>
            </div>

            <div className="divider"></div>

            {/* Social Media Links */}
            <div className="space-y-6">
                <h4 className="font-medium text-lg">Media Sosial</h4>
                <div className="grid gap-6">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Instagram</span>
                        </label>
                        <input
                            type="url"
                            value={content.socialMedia.instagram}
                            onChange={(e) => setContent(prev => ({
                                ...prev,
                                socialMedia: { ...prev.socialMedia, instagram: e.target.value }
                            }))}
                            className="input input-bordered w-full"
                            placeholder="https://instagram.com/..."
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">YouTube</span>
                        </label>
                        <input
                            type="url"
                            value={content.socialMedia.youtube}
                            onChange={(e) => setContent(prev => ({
                                ...prev,
                                socialMedia: { ...prev.socialMedia, youtube: e.target.value }
                            }))}
                            className="input input-bordered w-full"
                            placeholder="https://youtube.com/..."
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">LinkedIn</span>
                        </label>
                        <input
                            type="url"
                            value={content.socialMedia.linkedin}
                            onChange={(e) => setContent(prev => ({
                                ...prev,
                                socialMedia: { ...prev.socialMedia, linkedin: e.target.value }
                            }))}
                            className="input input-bordered w-full"
                            placeholder="https://linkedin.com/in/..."
                        />
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t">
                <button onClick={handleSave} className="btn btn-primary">
                    Simpan Perubahan
                </button>
            </div>

            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}
        </div>
    );
};

export default FooterSettings; 