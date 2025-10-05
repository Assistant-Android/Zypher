import { useState } from 'react';
import { Sparkles, Award } from 'lucide-react';
import Confetti from './Confetti';

const inputFields = [
  { id: 'transit_duration', label: 'Transit Duration (hours)', placeholder: '13.0' },
  { id: 'ra', label: 'Right Ascension (degrees)', placeholder: '150.5' },
  { id: 'stellar_radius', label: 'Stellar Radius (Solar radii)', placeholder: '1.0' },
  { id: 'insolation_flux', label: 'Insolation Flux (Earth flux)', placeholder: '1.0' },
  { id: 'dec', label: 'Declination (degrees)', placeholder: '-23.5' },
  { id: 'planet_radius', label: 'Planet Radius (Earth radii)', placeholder: '1.0' },
  { id: 'stellar_temp', label: 'Stellar Temperature (K)', placeholder: '5778' },
  { id: 'koi_model_snr', label: 'KOI Model SNR', placeholder: '25.5' },
  { id: 'transit_depth', label: 'Transit Depth (%)', placeholder: '0.01' },
  { id: 'orbital_period', label: 'Orbital Period (days)', placeholder: '365.25' },
  { id: 'equilibrium_temp', label: 'Equilibrium Temperature (K)', placeholder: '288' },
  { id: 'planet_radius_missing', label: 'Planet Radius Missing', placeholder: 'false', type: 'checkbox' }
];

export default function SingleDetection() {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const containerStyle = {
    minHeight: '100vh',
    padding: '2rem',
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'url("/stars_bg.jpg")',
      opacity: 0.15,
      pointerEvents: 'none'
    }
  } as React.CSSProperties;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transit_duration: parseFloat(formData.transit_duration || '0'),
          ra: parseFloat(formData.ra || '0'),
          stellar_radius: parseFloat(formData.stellar_radius || '0'),
          insolation_flux: parseFloat(formData.insolation_flux || '0'),
          dec: parseFloat(formData.dec || '0'),
          planet_radius: parseFloat(formData.planet_radius || '0'),
          stellar_temp: parseFloat(formData.stellar_temp || '0'),
          koi_model_snr: parseFloat(formData.koi_model_snr || '0'),
          transit_depth: parseFloat(formData.transit_depth || '0'),
          orbital_period: parseFloat(formData.orbital_period || '0'),
          equilibrium_temp: parseFloat(formData.equilibrium_temp || '0'),
          planet_radius_missing: formData.planet_radius_missing === 'true'
        }),
      });

      if (!response.ok) {
        throw new Error('Prediction failed');
      }

      const data = await response.json();
      setResult(data.prediction === 1 ? 'YES' : 'NO');

      if (data.prediction === 1) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    } catch (error) {
      console.error('Prediction error:', error);
      setResult('Error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <section id="detection" style={containerStyle} className="min-h-screen relative">
      {showConfetti && <Confetti />}
      <div className="absolute inset-0 bg-[url('/stars_bg.jpg')] opacity-100 pointer-events-none bg-cover"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto py-24 px-6">
        <div className="text-center mb-16">
          
          <h2 className="text-5xl md:text-6xl font-semibold text-white mb-4 tracking-tight">
            Single Detection
          </h2>
          <p className="text-lg text-gray-400 font-light max-w-2xl mx-auto">
            Input planetary parameters to detect potential exoplanets
          </p>
        </div>

            <form onSubmit={handleSubmit} className="backdrop-blur-md bg-white/90 rounded-3xl p-8 md:p-12 shadow-xl border border-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {inputFields.map((field) => (
              <div key={field.id} className="flex flex-col">
                <label className="text-gray-800 mb-2 text-lg font-medium uppercase tracking-wide">
                  {field.label}
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder={field.placeholder}
                  value={formData[field.id] || ''}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  className="bg-grey-100  border rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all backdrop-blur-sm"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="group px-12 py-4 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 hover:scale-105"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={20} className="group-hover:animate-pulse" />
                  Detect Exoplanet
                </>
              )}
            </button>
          </div>

          {result && (
            <div
              className={`mt-8 p-8 rounded-2xl text-center backdrop-blur-sm ${
                result === 'YES'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex justify-center mb-3">
                {result === 'YES' ? (
                  <Award className="text-green-600 animate-pulse" size={48} />
                ) : (
                  <div className="text-4xl">❌</div>
                )}
              </div>
              <div className={`font-semibold text-xl ${
                result === 'YES' ? 'text-green-700' : 'text-red-700'
              }`}>
                {result === 'YES' ? 'Exoplanet Detected!' : 'No Exoplanet Detected'}
              </div>
              {result === 'YES' && (
                <div className="mt-3 text-sm text-green-600 font-medium">
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
