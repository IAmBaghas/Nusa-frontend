import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import BannerSettings from '../../components/WebSettingComponents/BannerSettings';
import LogoSettings from '../../components/WebSettingComponents/LogoSettings';
import AboutSettings from '../../components/WebSettingComponents/AboutSettings';
import HeaderSettings from '../../components/WebSettingComponents/HeaderSettings';
import FooterSettings from '../../components/WebSettingComponents/FooterSettings';

const WebEdit = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    const originalTitle = document.title;
    document.title = 'Admin - Pengaturan Website';

    return () => {
      document.title = originalTitle;
    };
  }, []);

  const tabs = [
    { name: 'Banner', component: BannerSettings },
    { name: 'Logo', component: LogoSettings },
    { name: 'Header', component: HeaderSettings },
    { name: 'About', component: AboutSettings },
    { name: 'Footer', component: FooterSettings },
  ];

  return (
    <div className="min-h-full bg-gray-50/50">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Website</h1>
        <p className="mt-1 text-sm text-gray-500">
          Kustomisasi tampilan dan konten website
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex gap-1 rounded-t-xl bg-gray-100 p-1">
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all duration-200
                  ${
                    selected
                      ? 'bg-white text-primary shadow'
                      : 'text-gray-600 hover:bg-white/[0.12] hover:text-primary'
                  }`
                }
              >
                {tab.name}
              </Tab>
            ))}
          </Tab.List>
          
          <Tab.Panels className="p-6">
            {tabs.map((tab, index) => (
              <Tab.Panel
                key={index}
                className={`transition-all duration-300 animate-fadeIn`}
                unmount={false}
              >
                <tab.component />
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default WebEdit; 