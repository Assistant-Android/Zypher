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
  habitabilityScore?: number;
}

interface BackendData {
  [key: string]: BackendDataPoint;
}

const determineStellarType = (temperature: number): string => {
  if (temperature > 30000) return 'O';
  if (temperature > 10000) return 'B';
  if (temperature > 7500) return 'A';
  if (temperature > 6000) return 'F';
  if (temperature > 5200) return 'G';
  if (temperature > 3700) return 'K';
  return 'M';
};

const categories = [
  {
    name: 'Multiple Planet Systems',
    description: 'Analyze star systems with multiple planets using RA, DEC, and orbital periods',
    filter: (p: Planet) => p.data.ra && p.data.dec && p.data.orbital_period,
    color: 'indigo',
    icon: '🪐'
  },
  {
    name: 'Stellar Type Clustering',
    description: 'Group planets by star types using temperature and radius data',
    filter: (p: Planet) => p.data.stellar_temp && p.data.stellar_radius,
    color: 'amber',
    icon: '⭐'
  },
  {
    name: 'Energy Budget Mapping',
    description: 'Analyze planetary energy environments using flux, temperature, and size',
    filter: (p: Planet) => p.data.insolation_flux && p.data.equilibrium_temp && p.data.planet_radius,
    color: 'red',
    icon: '�️'
  },
  {
    name: 'Survey Completeness',
    description: 'Map regions with missing data to guide future observations',
    filter: (p: Planet) => p.data.transit_duration_missing || p.data.planet_radius_missing,
    color: 'blue',
    icon: '📊'
  },
  {
    name: 'Habitability Scoring',
    description: 'Calculate composite habitability scores using multiple parameters',
    filter: (p: Planet) => (
      p.data.equilibrium_temp && 
      p.data.insolation_flux && 
      p.data.planet_radius && 
      p.data.koi_model_snr &&
      p.data.orbital_period
    ),
    color: 'green',
    icon: '🌍'
  },
  {
    name: 'Outlier Detection',
    description: 'Identify unusual planetary characteristics for further study',
    filter: (p: Planet) => p.data.planet_radius && p.data.insolation_flux,
    color: 'purple',
    icon: '🔍'
  },
  {
    name: 'Correlation Network',
    description: 'Visualize relationships between planetary parameters',
    filter: (p: Planet) => true, // Uses all available data
    color: 'cyan',
    icon: '🕸️'
  },
  {
    name: 'Hydrogen Giants',
    description: 'Large planets with significant hydrogen content',
    filter: (p: Planet) => p.characteristics.hydrogen,
    color: 'violet',
    icon: '⚛️'
  },
  {
    name: 'Radiation Zones',
    description: 'Planets with high radiation levels',
    filter: (p: Planet) => p.characteristics.radiation,
    color: 'red',
    icon: '☢️'
  },
  {
    name: 'Atmospheric',
    description: 'Planets with significant atmospheres',
    filter: (p: Planet) => p.characteristics.atmosphere,
    color: 'indigo',
    icon: '🌫️'
  },
  {
    name: 'Magnetic Fields',
    description: 'Planets with detectable magnetic fields',
    filter: (p: Planet) => p.characteristics.magnetic_field,
    color: 'purple',
    icon: '🧲'
  }
];

  const calculateHabitabilityScore = (data: BackendDataPoint): number => {
    let score = 0;
    
    // Temperature check (200-350K)
    if (data.equilibrium_temp && data.equilibrium_temp >= 200 && data.equilibrium_temp <= 350) score += 2;
    
    // Flux check (0.3-2 Earth flux)
    if (data.insolation_flux && data.insolation_flux >= 0.3 && data.insolation_flux <= 2) score += 2;
    
    // Size check (<2 Earth radii)
    if (data.planet_radius && data.planet_radius < 2) score += 2;
    
    // SNR confidence
    if (data.koi_model_snr && data.koi_model_snr > 10) score += 1;
    
    // Orbital stability
    if (data.orbital_period && data.orbital_period > 30 && data.orbital_period < 500) score += 1;
    
    return score;
  };  const generatePlanet = (name: string, data: BackendDataPoint): Planet => {
    const habitabilityScore = calculateHabitabilityScore(data);
    const probability = Math.min(0.9, (habitabilityScore / 8) + 0.3);
    
    return {
      name,
      probability,
      habitabilityScore,
      characteristics: {
        water: data.insolation_flux ? data.insolation_flux > 0.5 : false,
        oxygen: data.equilibrium_temp ? data.equilibrium_temp > 200 && data.equilibrium_temp < 350 : false,
        rocks: data.planet_radius ? data.planet_radius < 2 : false,
        forest: habitabilityScore > 6,
        hydrogen: data.planet_radius ? data.planet_radius > 3 : false,
        radiation: data.stellar_temp ? data.stellar_temp > 6000 : false,
        atmosphere: data.insolation_flux ? data.insolation_flux > 0.3 : false,
        magnetic_field: data.planet_radius ? data.planet_radius > 0.8 : false
      },
      data: {
        orbital_period: Number((data.orbital_period || 0).toFixed(2)),
        equilibrium_temp: Number((data.equilibrium_temp || 0).toFixed(2)),
        stellar_temp: Number((data.stellar_temp || 0).toFixed(2)),
        dec: Number((data.dec || 0).toFixed(6)),
        planet_radius: Number((data.planet_radius || 0).toFixed(2)),
        koi_model_snr: Number((data.koi_model_snr || 0).toFixed(2)),
        stellar_radius: Number((data.stellar_radius || 0).toFixed(2)),
        transit_duration: Number((data.transit_duration || 0).toFixed(2)),
        insolation_flux: Number((data.insolation_flux || 0).toFixed(2)),
        ra: Number((data.ra || 0).toFixed(6)),
        transit_depth: Number((data.transit_depth || 0).toFixed(4)),
        planet_radius_missing: data.planet_radius_missing || false,
        stellarType: data.stellar_temp ? determineStellarType(data.stellar_temp) : "Unknown",
        multiplePlanets: false, // Will be updated in data processing
        energyBudget: data.insolation_flux || 0
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
        description: cat.description,
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
        <section 
      id="batch" 
      style={{
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="min-h-screen py-24 px-6"
    >
      <div className="absolute inset-0 bg-[url('/stars_bg.jpg')] opacity-100 pointer-events-none bg-cover"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
        
          <h2 className="text-5xl md:text-6xl font-semibold text-white mb-4 tracking-tight">
            Batch Analysis
          </h2>
          <p className="text-lg text-gray-400 font-light max-w-2xl mx-auto">
            Analyze multiple exoplanets at once by uploading a CSV file with planetary parameters
          </p>
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
                    className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-blue-100 shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`text-4xl bg-${card.color}-50 p-3 rounded-xl border border-${card.color}-100 group-hover:scale-110 transition-transform`}>
                        {card.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{card.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{card.description}</p>
                        <div className="flex items-center gap-2">
                          <div className="px-2 py-1 bg-blue-50 rounded-md text-xs font-medium text-blue-600">
                            {card.count} planets
                          </div>
                          <div className="text-xs text-gray-500">
                            Click to analyze →
                          </div>
                        </div>
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
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-200"
            >
              <FileText className="w-5 h-5" />
              Analyze File
              {loading && <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin ml-2"></div>}
            </button>

            {planets && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-900 px-6 py-3 rounded-xl font-medium border border-blue-100 hover:bg-blue-50 focus:ring-4 focus:ring-blue-100 transition-all shadow-lg hover:shadow-blue-100"
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