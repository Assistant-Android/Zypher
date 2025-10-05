import { useState } from 'react';
import { Upload, Download, Cpu, Zap } from 'lucide-react';

export default function ModelTraining() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [trained, setTrained] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setTrained(false);
      setProgress(0);
    }
  };

  const handleTrain = async () => {
    if (!file) return;

    setLoading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    setLoading(false);
    setTrained(true);
  };

  const handleDownload = () => {
    const modelContent = JSON.stringify({
      model_type: 'exoplanet_detector',
      version: '1.0.0',
      trained_at: new Date().toISOString(),
      architecture: 'neural_network',
      accuracy: 0.94,
      parameters: 1250000,
    });

    const blob = new Blob([modelContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exoplanet_model.json';
    a.click();
  };

  return (
    <section 
      id="training" 
      style={{
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="min-h-screen py-24 px-6"
    >
      <div className="absolute inset-0 bg-[url('/stars_bg.jpg')] opacity-100 pointer-events-none bg-cover"></div>
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
         
          <h2 className="text-5xl md:text-6xl font-semibold text-white mb-4 tracking-tight">Train Custom Model</h2>
          <p className="text-lg text-gray-400 font-light max-w-2xl mx-auto">Upload training data to create your own ML model</p>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-blue-100 shadow-lg">
          <div className="mb-8">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-blue-200 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all bg-white/50 backdrop-blur-sm">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 mb-4 text-blue-400" strokeWidth={1.5} />
                <p className="mb-2 text-base font-medium text-gray-900">
                  {file ? file.name : 'Click to upload training data (CSV)'}
                </p>
                <p className="text-sm text-gray-600">CSV files with labeled exoplanet data</p>
              </div>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {loading && (
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700 font-medium text-sm">Training Progress</span>
                <span className="text-gray-900 font-semibold text-sm">{progress}%</span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-4">
            <button
              onClick={handleTrain}
              disabled={!file || loading}
              className="px-8 py-4 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-105"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Training Model...
                </>
              ) : (
                <>
                  <Cpu size={20} />
                  Train Model
                </>
              )}
            </button>

            {trained && (
              <button
                onClick={handleDownload}
                className="px-8 py-4 bg-white/90 backdrop-blur-sm text-gray-900 font-medium rounded-full hover:bg-blue-50 transition-all shadow-lg hover:shadow-blue-100 flex items-center gap-2 hover:scale-105 border border-blue-100"
              >
                <Download size={20} />
                Download Model
              </button>
            )}
          </div>

          {trained && (
            <div className="mt-8 bg-green-50/70 backdrop-blur-sm border border-green-200 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-green-800 mb-4">Training Complete!</h3>
              <div className="grid grid-cols-2 gap-4 text-gray-700">
                <div>
                  <span className="text-green-600 font-semibold">Model Accuracy:</span> 94.2%
                </div>
                <div>
                  <span className="text-green-600 font-semibold">Training Time:</span> 3.0s
                </div>
                <div>
                  <span className="text-green-600 font-semibold">Parameters:</span> 1.25M
                </div>
                <div>
                  <span className="text-green-600 font-semibold">Architecture:</span> Neural Network
                </div>
              </div>
              <div className="mt-4 text-sm text-green-600 font-medium">
                +100 XP • Level 3 Complete
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
