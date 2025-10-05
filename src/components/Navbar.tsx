import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
  };

  const menuItems = [
    { id: 'home', label: 'Home' },
    { id: 'detection', label: 'Single Detection' },
    { id: 'batch', label: 'Batch Analysis' },
    { id: 'training', label: 'Train Model' },
    { id: 'hyperparameter', label: 'Hyperparameters' },
    { id: 'about', label: 'About' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50  backdrop-blur-xl ">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex justify-between items-center h-16 relative">
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="text-4xl font-semibold font-['MuseoModerno'] tracking-tight text-white hover:text-black-500 transition-colors">  
              ZYPHERX
            </div>
          </div>

          <div className="flex-1"></div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white hover:text-black-500 transition-colors p-2 hover:bg-grey-50 rounded-full z-10"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-blue-100 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all text-sm font-medium"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
