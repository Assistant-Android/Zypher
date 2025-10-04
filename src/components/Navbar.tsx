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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex justify-between items-center h-14">
          <div className="text-xl font-semibold tracking-tight text-gray-900">
            ZYPHER
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-900 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-14 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="block w-full text-left px-4 py-3 text-gray-900 hover:bg-gray-100 rounded-lg transition-all text-sm font-medium"
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
