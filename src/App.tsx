import { useState } from 'react';
import Sidebar from './components/Sidebar';
import { Menu } from 'lucide-react';
import LossScalingCurve from './components/LossScalingCurve';
import ParamCalc from './components/ParamCalc';
import OptimalTokenCalc from './components/OptimalTokenCalc';

const App = () => {
  const [activeTab, setActiveTab] = useState('loss');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f9fa]">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-[#dadce0] flex items-center px-4 md:px-6 shrink-0 shadow-sm z-10">
          <button 
            className="p-2 mr-2 rounded-full hover:bg-[#f1f3f4] text-[#5f6368] lg:hidden transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center">
             <h1 className="text-[22px] font-normal text-[#202124]">
               {activeTab === 'loss' && 'Loss Scaling Curve'}
               {activeTab === 'params' && 'Parameter Calculator'}
               {activeTab === 'tokens' && 'Optimal Token Allocation'}
             </h1>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto w-full animate-fade-in pb-12">
            {activeTab === 'loss' && <LossScalingCurve />}
            {activeTab === 'params' && <ParamCalc />}
            {activeTab === 'tokens' && <OptimalTokenCalc />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
