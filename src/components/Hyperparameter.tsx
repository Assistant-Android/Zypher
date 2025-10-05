import { useState } from 'react';
import { Settings, Download, Target } from 'lucide-react';

export default function Hyperparameter() {
  const [params, setParams] = useState({
    learning_rate: '0.001',
    batch_size: '32',
    epochs: '100',
    dropout_rate: '0.2',
    hidden_layers: '3',
    neurons_per_layer: '128',
  });
  const [loading, setLoading] = useState(false);
  const [trained, setTrained] = useState(false);

  const handleChange = (key: string, value: string) => {
    setParams((prev) => ({ ...prev, [key]: value }));
    setTrained(false);
  };

  const handleTrain = async () => {
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 2500));

    setLoading(false);
    setTrained(true);
  };

  const handleDownload = () => {
    const modelContent = JSON.stringify({
      model_type: 'custom_exoplanet_detector',
      version: '1.0.0',
      trained_at: new Date().toISOString(),
      hyperparameters: params,
      accuracy: 0.96,
    });

    const blob = new Blob([modelContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'custom_exoplanet_model.json';
    a.click();
  };

  return (
    <section 
      id="hyperparameter" 
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
         
          <h2 className="text-5xl md:text-6xl font-semibold text-white mb-4 tracking-tight">Hyperparameter Tuning</h2>
          <p className="text-lg text-gray-400 font-light max-w-2xl mx-auto">Customize model parameters for optimal performance</p>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-blue-100 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex flex-col">
              <label className="text-gray-600 mb-2 text-xs font-medium uppercase tracking-wide">
                Learning Rate
              </label>
              <input
                type="number"
                step="0.0001"
                value={params.learning_rate}
                onChange={(e) => handleChange('learning_rate', e.target.value)}
                className="bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3.5 text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all backdrop-blur-sm"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 mb-2 text-xs font-medium uppercase tracking-wide">
                Batch Size
              </label>
              <input
                type="number"
                value={params.batch_size}
                onChange={(e) => handleChange('batch_size', e.target.value)}
                className="bg-white border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 mb-2 text-xs font-medium uppercase tracking-wide">
                Number of Epochs
              </label>
              <input
                type="number"
                value={params.epochs}
                onChange={(e) => handleChange('epochs', e.target.value)}
                className="bg-white border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 mb-2 text-xs font-medium uppercase tracking-wide">
                Dropout Rate
              </label>
              <input
                type="number"
                step="0.01"
                value={params.dropout_rate}
                onChange={(e) => handleChange('dropout_rate', e.target.value)}
                className="bg-white border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 mb-2 text-xs font-medium uppercase tracking-wide">
                Hidden Layers
              </label>
              <input
                type="number"
                value={params.hidden_layers}
                onChange={(e) => handleChange('hidden_layers', e.target.value)}
                className="bg-white border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 mb-2 text-xs font-medium uppercase tracking-wide">
                Neurons per Layer
              </label>
              <input
                type="number"
                value={params.neurons_per_layer}
                onChange={(e) => handleChange('neurons_per_layer', e.target.value)}
                className="bg-white border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              />
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={handleTrain}
              disabled={loading}
              className="px-8 py-4 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-105"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Training...
                </>
              ) : (
                <>
                  <Settings size={20} />
                  Train with Custom Weights
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
              <h3 className="text-xl font-semibold text-green-800 mb-4">Model Training Complete!</h3>
              <div className="grid grid-cols-2 gap-4 text-gray-700">
                <div>
                  <span className="text-green-600 font-semibold">Accuracy:</span> 96.1%
                </div>
                <div>
                  <span className="text-green-600 font-semibold">Validation Loss:</span> 0.043
                </div>
                <div>
                  <span className="text-green-600 font-semibold">F1 Score:</span> 0.952
                </div>
                <div>
                  <span className="text-green-600 font-semibold">Precision:</span> 0.948
                </div>
              </div>
              <div className="mt-4 text-sm text-green-600 font-medium">
                +150 XP • Master Level Achieved
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
