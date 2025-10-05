import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import SingleDetection from './components/SingleDetection';
import BatchAnalysis from './components/BatchAnalysis';
import ModelTraining from './components/ModelTraining';
import Hyperparameter from './components/Hyperparameter';
import VideoSection from './components/Tutorial';
import ChatBot from './components/ChatBot';

function App() {
  return (
    <div className="relative bg-white">
      <Navbar />
      <HeroSection />
      <SingleDetection />
      <BatchAnalysis />
      <ModelTraining />
      <Hyperparameter />
      <VideoSection />
      <ChatBot />

      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-900 font-semibold mb-1">
            ZYPHER
          </p>
          <p className="text-gray-500 text-sm">
            AI-Powered Exoplanet Detection Platform
          </p>
          <p className="text-gray-400 text-xs mt-4">
            Exploring the universe, one planet at a time
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
