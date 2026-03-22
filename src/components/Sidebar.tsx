import React from 'react';
import { Calculator, Layers, Settings2, BarChart3 } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, setIsOpen }) => {
  const tabs = [
    { id: 'loss', label: 'Loss Scaling Curve', icon: <BarChart3 size={20} /> },
    { id: 'params', label: 'Parameter Calculator', icon: <Layers size={20} /> },
    { id: 'tokens', label: 'Optimal Token Allocation', icon: <Calculator size={20} /> },
  ];

  return (
    <>
      <div className={`fixed inset-0 bg-black/20 z-20 lg:hidden ${isOpen ? 'block' : 'hidden'}`} onClick={() => setIsOpen(false)} />
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-[280px] bg-white border-r border-[#dadce0] transform transition-transform duration-200 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        <div className="h-16 flex items-center px-6 border-b border-[#dadce0]">
          <div className="flex items-center gap-3 text-[#1a73e8]">
            <Settings2 size={24} />
            <span className="text-xl font-medium text-[#202124]">MORTM Tools</span>
          </div>
        </div>
        
        <nav className="flex-1 py-4 flex flex-col gap-1 pr-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsOpen(false);
              }}
              className={`sidebar-link ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.icon}
              <span className="text-[14px] font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="p-6 text-xs text-[#5f6368] border-t border-[#dadce0]">
           © 2026 MORTM Scaling Tools
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
