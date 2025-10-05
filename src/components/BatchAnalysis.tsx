import { useState } from 'react';
import { Upload, Download, FileText, TrendingUp } from 'lucide-react';
import type { Planet, CategoryCard } from './BatchTypes';

interface BackendDataPoint {
  probability: number;
  orbital_period?: number;
  equilibrium_temp?: number;
  stellar_temp?: number;
  dec?: number;
  planet_radius?: number;
  koi_model_snr?: number;
  stellar_radius?: number;
  transit_duration?: number;
  insolation_flux?: number;
  ra?: number;
  transit_depth?: number;
  planet_radius_missing?: boolean;
}

interface BackendData {
  [key: string]: BackendDataPoint;
}

const categories = [
  {
    name: 'Water Worlds',
    filter: (p: Planet) => p.characteristics.water,
    color: 'blue',
    icon: '💧'
  },
  {
    name: 'Oxygen Rich',
    filter: (p: Planet) => p.characteristics.oxygen,
    color: 'cyan',
    icon: '🌬️'
  },
  {
    name: 'Rocky Planets',
    filter: (p: Planet) => p.characteristics.rocks,
    color: 'amber',
    icon: '🪨'
  },
  {
    name: 'Forest Planets',
    filter: (p: Planet) => p.characteristics.forest,
    color: 'green',
    icon: '🌳'
  },
  {
    name: 'Hydrogen Giants',
    filter: (p: Planet) => p.characteristics.hydrogen,
    color: 'violet',
    icon: '⚛️'
  },
  {
    name: 'Radiation Zones',
    filter: (p: Planet) => p.characteristics.radiation,
    color: 'red',
    icon: '☢️'
  },
  {
    name: 'Atmospheric',
    filter: (p: Planet) => p.characteristics.atmosphere,
    color: 'indigo',
    icon: '🌫️'
  },
  {
    name: 'Magnetic Fields',
    filter: (p: Planet) => p.characteristics.magnetic_field,
    color: 'purple',
    icon: '🧲'
  }
];

const generatePlanet = (name: string, data: BackendDataPoint): Planet => {
  const probability = data.probability;
  
  return {
    name,
    probability,
    characteristics: {
      water: probability > 0.5,
      oxygen: probability > 0.6,
      rocks: probability > 0.3,
      forest: probability > 0.7,
      hydrogen: probability > 0.4,
      radiation: probability > 0.6,
      atmosphere: probability > 0.5,
      magnetic_field: probability > 0.6
    },
    data: {
      orbital_period: Number((data.orbital_period || Math.random() * 1000).toFixed(2)),
      equilibrium_temp: Number((data.equilibrium_temp || Math.random() * 500 + 200).toFixed(2)),
      stellar_temp: Number((data.stellar_temp || Math.random() * 3000 + 3000).toFixed(2)),
      dec: Number((data.dec || (Math.random() * 180 - 90)).toFixed(6)),
      planet_radius: Number((data.planet_radius || Math.random() * 5).toFixed(2)),
      koi_model_snr: Number((data.koi_model_snr || Math.random() * 100).toFixed(2)),
      stellar_radius: Number((data.stellar_radius || Math.random() * 2).toFixed(2)),
      transit_duration: Number((data.transit_duration || Math.random() * 20).toFixed(2)),
      insolation_flux: Number((data.insolation_flux || Math.random() * 1000).toFixed(2)),
      ra: Number((data.ra || Math.random() * 360).toFixed(6)),
      transit_depth: Number((data.transit_depth || Math.random() * 2).toFixed(4)),
      planet_radius_missing: data.planet_radius_missing || false
    }
  };
};

const convertBackendData = (data: BackendData): Planet[] => {
  return Object.entries(data).map(([key, value]) => generatePlanet(key, value));
};

export default function BatchAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [planets, setPlanets] = useState<Planet[] | null>(null);
  const [displayedPlanets, setDisplayedPlanets] = useState<Planet[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryCards, setCategoryCards] = useState<CategoryCard[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPlanets(null);
      setSelectedCategory(null);
      setCategoryCards([]);
      setDisplayedPlanets([]);
      setError(null); // Clear any previous errors
    }
  };

  const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 5000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  };


  const checkServerHealth = async () => {
    try {
      const response = await fetch('http://localhost:8000/health');
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check server health
      const isHealthy = await checkServerHealth();
      if (!isHealthy) {
        throw new Error('Cannot connect to server. Please ensure the backend is running.');
      }

      // First upload the file
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetchWithTimeout('http://localhost:8000/upload-file', {
        method: 'POST',
        body: formData,
      }, 30000);

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => null);
        throw new Error(
          errorData?.detail || `File upload failed: ${uploadResponse.statusText}`
        );
      }

      // Then retrain the model
      const retrainResponse = await fetchWithTimeout('http://localhost:8000/retrain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      }, 30000);

      if (!retrainResponse.ok) {
        const errorData = await retrainResponse.json().catch(() => null);
        throw new Error(
          errorData?.detail || `Analysis failed: ${retrainResponse.statusText}`
        );
      }

      let result;
      try {
        result = await retrainResponse.json();
        console.log('Analysis result:', result);
      } catch (error) {
        throw new Error('Invalid response from server. Please try again.');
      }

      const processedPlanets = convertBackendData(result.data || {});
      setPlanets(processedPlanets);
      setDisplayedPlanets(processedPlanets);
      
      const newCards = categories.map(cat => ({
        name: cat.name,
        count: processedPlanets.filter(cat.filter).length,
        icon: cat.icon,
        color: cat.color,
        planets: processedPlanets.filter(cat.filter)
      }));
      
      setCategoryCards(newCards);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze the file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryName: string) => {
    if (!planets) return;
    
    if (categoryName === selectedCategory) {
      setSelectedCategory('all');
      setDisplayedPlanets(planets);
    } else {
      setSelectedCategory(categoryName);
      const category = categories.find(c => c.name === categoryName);
      if (category) {
        setDisplayedPlanets(planets.filter(category.filter));
      }
    }
  };

  const handleDownload = async () => {
    if (!planets) return;

    try {
      const response = await fetch('http://localhost:8000/download');
      
      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'exoplanet_categories.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download results. Please try again.');
    }
  };

  return (
    <section id="batch" className="min-h-screen bg-white py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full mb-4">
            <TrendingUp size={16} className="text-purple-600" />
            <span className="text-sm font-medium text-purple-600">Planet Categories</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-4 tracking-tight">Batch Analysis</h2>
          <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">Upload CSV file to discover planet categories</p>
        </div>

        <div className="bg-gray-50 rounded-3xl p-8 md:p-12 border border-gray-200">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <p className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                {error}
              </p>
            </div>
          )}

          <div className="mb-8">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-gray-400 hover:bg-gray-100 transition-all bg-white">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 mb-4 text-gray-400" strokeWidth={1.5} />
                <p className="mb-2 text-base font-medium text-gray-900">
                  {file ? file.name : 'Click to upload CSV file'}
                </p>
                <p className="text-sm text-gray-500">CSV files only</p>
              </div>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {categoryCards.length > 0 && displayedPlanets.length > 0 && !selectedCategory && (
            <div className="border rounded-xl overflow-hidden mt-8">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temperature</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Radius</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayedPlanets.map((planet) => (
                    <tr key={planet.name} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{planet.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{(planet.probability * 100).toFixed(1)}%</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{planet.data.equilibrium_temp}K</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{planet.data.stellar_temp}K</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {planet.data.planet_radius}R⊕
                        {planet.data.planet_radius_missing && ' (missing)'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{planet.data.orbital_period}d</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {categoryCards.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              {categoryCards.map((card) => {
                const isSelected = selectedCategory === card.name;
                return isSelected ? (
                  <div
                    key={card.name}
                    className="col-span-full bg-white rounded-2xl p-6 border border-gray-200 shadow-md"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`text-4xl bg-${card.color}-50 p-3 rounded-xl`}>
                        {card.icon}
                      </div>
                      <div className="flex-grow">
                        <h3 className="text-xl font-semibold text-gray-900">{card.name}</h3>
                        <p className="text-sm text-gray-500">{card.count} planets</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCategoryChange(selectedCategory!);
                        }}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="border rounded-xl overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orbital Period</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equilibrium Temp</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stellar Temp</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dec</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Planet Radius</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KOI Model SNR</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ST TMAG</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stellar Radius</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transit Duration</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insolation Flux</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RA</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transit Depth</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {card.planets.map((planet) => (
                            <tr key={planet.name} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{planet.name}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{(planet.probability * 100).toFixed(1)}%</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{planet.data.orbital_period}d</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{planet.data.equilibrium_temp}K</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{planet.data.stellar_temp}K</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{planet.data.dec}°</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {planet.data.planet_radius}R⊕
                                {planet.data.planet_radius_missing && ' (missing)'}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{planet.data.koi_model_snr}</td>
        
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{planet.data.stellar_radius}R☉</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{planet.data.transit_duration}h</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{planet.data.insolation_flux}F⊕</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{planet.data.ra}°</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{planet.data.transit_depth}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div
                    key={card.name}
                    onClick={() => handleCategoryChange(card.name)}
                    className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-1"
                  >
                    <div className={`flex items-center gap-4 mb-4`}>
                      <div className={`text-4xl bg-${card.color}-50 p-3 rounded-xl`}>
                        {card.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{card.name}</h3>
                        <p className="text-sm text-gray-500">{card.count} planets</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={handleAnalyze}
              disabled={!file || loading}
              className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 focus:ring-4 focus:ring-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-5 h-5" />
              Analyze File
              {loading && <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin ml-2"></div>}
            </button>

            {planets && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-medium border border-gray-300 hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 transition-all"
              >
                <Download className="w-5 h-5" />
                Download Results
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}