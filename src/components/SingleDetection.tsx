import { useState } from 'react';
import { Sparkles, Award } from 'lucide-react';
import Confetti from './Confetti';

const inputFields = [
  { id: 'orbital_period', label: 'Orbital Period (days)', placeholder: '365.25' },
  { id: 'transit_duration', label: 'Transit Duration (hours)', placeholder: '13.0' },
  { id: 'planet_radius', label: 'Planet Radius (Earth radii)', placeholder: '1.0' },
  { id: 'semi_major_axis', label: 'Semi-major Axis (AU)', placeholder: '1.0' },
  { id: 'eccentricity', label: 'Eccentricity', placeholder: '0.017' },
  { id: 'stellar_mass', label: 'Stellar Mass (Solar masses)', placeholder: '1.0' },
  { id: 'stellar_radius', label: 'Stellar Radius (Solar radii)', placeholder: '1.0' },
  { id: 'stellar_temp', label: 'Stellar Temperature (K)', placeholder: '5778' },
  { id: 'impact_parameter', label: 'Impact Parameter', placeholder: '0.5' },
  { id: 'transit_depth', label: 'Transit Depth (ppm)', placeholder: '84' },
  { id: 'signal_noise', label: 'Signal-to-Noise Ratio', placeholder: '15.0' },
  { id: 'flux_variation', label: 'Flux Variation (%)', placeholder: '0.01' },
];

export default function SingleDetection() {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockResult = Math.random() > 0.5 ? 'YES' : 'NO';
    setResult(mockResult);

    if (mockResult === 'YES') {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }

    setLoading(false);
  };

  const handleChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <section id="detection" className="min-h-screen bg-gray-50 py-24 px-6">
      {showConfetti && <Confetti />}

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-4">
            <Sparkles size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-600">Level 1 Challenge</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-4 tracking-tight">
            Single Detection
          </h2>
          <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
            Input planetary parameters to detect potential exoplanets
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {inputFields.map((field) => (
              <div key={field.id} className="flex flex-col">
                <label className="text-gray-700 mb-2 text-xs font-medium uppercase tracking-wide">
                  {field.label}
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder={field.placeholder}
                  value={formData[field.id] || ''}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="px-12 py-4 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 hover:scale-105"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Detect Exoplanet
                </>
              )}
            </button>
          </div>

          {result && (
            <div
              className={`mt-8 p-8 rounded-2xl text-center ${
                result === 'YES'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex justify-center mb-3">
                {result === 'YES' ? (
                  <Award className="text-green-600" size={48} />
                ) : (
                  <div className="text-4xl">❌</div>
                )}
              </div>
              <div className={`font-semibold text-xl ${
                result === 'YES' ? 'text-green-900' : 'text-red-900'
              }`}>
                {result === 'YES' ? 'Exoplanet Detected!' : 'No Exoplanet Detected'}
              </div>
              {result === 'YES' && (
                <div className="mt-3 text-sm text-green-700 font-medium">
                  +50 XP • Achievement Unlocked
                </div>
              )}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
