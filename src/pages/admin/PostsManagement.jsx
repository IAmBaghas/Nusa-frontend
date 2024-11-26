import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import ContentManagement from '../../components/PostsManagementComponent/ContentManagement';
import CommentManagement from '../../components/PostsManagementComponent/CommentManagement';

const PostsManagement = () => {
    const [selectedTab, setSelectedTab] = useState(0);

    const tabs = [
        { name: 'Konten', component: ContentManagement },
        { name: 'Komentar', component: CommentManagement },
    ];

    return (
        <div className="min-h-full">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Manajemen Post</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Kelola konten dan komentar website
                </p>
            </div>

            <div className="card bg-white rounded-xl shadow-sm border border-gray-200">
                <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
                    <div className="border-b border-gray-200">
                        <Tab.List className="flex flex-col sm:flex-row gap-1 rounded-t-xl bg-gray-100 p-1">
                            {tabs.map((tab, index) => (
                                <Tab
                                    key={index}
                                    className={({ selected }) =>
                                        `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200
                                        ${
                                            selected
                                                ? 'bg-white text-primary shadow'
                                                : 'text-gray-600 hover:bg-white/[0.12] hover:text-primary'
                                        }
                                        ${index !== tabs.length - 1 ? 'sm:mr-1' : ''}
                                        ${index !== 0 ? 'mt-1 sm:mt-0' : ''}`
                                    }
                                >
                                    {tab.name}
                                </Tab>
                            ))}
                        </Tab.List>
                    </div>
                    
                    <Tab.Panels className="p-4 sm:p-6">
                        {tabs.map((tab, index) => (
                            <Tab.Panel
                                key={index}
                                className={`transition-all duration-300 animate-fadeIn`}
                                unmount={false}
                            >
                                <div className="max-w-full overflow-x-auto">
                                    <tab.component />
                                </div>
                            </Tab.Panel>
                        ))}
                    </Tab.Panels>
                </Tab.Group>
            </div>

            <style>{`
                @media (max-width: 640px) {
                    .tab-content {
                        padding: 1rem;
                    }
                    
                    .table-container {
                        margin: -1rem;
                        width: calc(100% + 2rem);
                    }
                    
                    .table-scroll {
                        overflow-x: auto;
                        -webkit-overflow-scrolling: touch;
                    }
                }
            `}</style>
        </div>
    );
};

export default PostsManagement; 