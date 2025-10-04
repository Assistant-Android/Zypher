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
    <section id="training" className="min-h-screen bg-gray-50 py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full mb-4">
            <Zap size={16} className="text-orange-600" />
            <span className="text-sm font-medium text-orange-600">Level 3 Challenge</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-4 tracking-tight">Train Custom Model</h2>
          <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">Upload training data to create your own ML model</p>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-200 shadow-sm">
          <div className="mb-8">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all bg-white">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 mb-4 text-gray-400" strokeWidth={1.5} />
                <p className="mb-2 text-base font-medium text-gray-900">
                  {file ? file.name : 'Click to upload training data (CSV)'}
                </p>
                <p className="text-sm text-gray-500">CSV files with labeled exoplanet data</p>
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
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gray-900 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-4">
            <button
              onClick={handleTrain}
              disabled={!file || loading}
              className="px-8 py-4 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-105"
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
                className="px-8 py-4 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 hover:scale-105"
              >
                <Download size={20} />
                Download Model
              </button>
            )}
          </div>

          {trained && (
            <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-green-900 mb-4">Training Complete!</h3>
              <div className="grid grid-cols-2 gap-4 text-gray-700">
                <div>
                  <span className="text-green-700 font-semibold">Model Accuracy:</span> 94.2%
                </div>
                <div>
                  <span className="text-green-700 font-semibold">Training Time:</span> 3.0s
                </div>
                <div>
                  <span className="text-green-700 font-semibold">Parameters:</span> 1.25M
                </div>
                <div>
                  <span className="text-green-700 font-semibold">Architecture:</span> Neural Network
                </div>
              </div>
              <div className="mt-4 text-sm text-green-700 font-medium">
                +100 XP • Level 3 Complete
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
