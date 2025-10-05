import { useState } from 'react';
import { Upload, Download, FileText, TrendingUp } from 'lucide-react';
import type { Planet, CategoryCard } from './BatchTypes';

interface BackendDataPoint {
  probability: number;
  orbital_period?: number;
  transit_duration?: number;
  planet_radius?: number;
  stellar_mass?: number;
  temperature?: number;
  distance?: number;
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
      transit_duration: Number((data.transit_duration || Math.random() * 20).toFixed(2)),
      planet_radius: Number((data.planet_radius || Math.random() * 5).toFixed(2)),
      stellar_mass: Number((data.stellar_mass || Math.random() * 2).toFixed(2)),
      temperature: Number((data.temperature || Math.random() * 500 - 100).toFixed(2)),
      distance: Number((data.distance || Math.random() * 1000).toFixed(2))
    }
  };
};

const convertBackendData = (data: BackendData): Planet[] => {
  return Object.entries(data).map(([key, value]) => generatePlanet(key, value));
};

export default function BatchAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [planets, setPlanets] = useState<Planet[] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryCards, setCategoryCards] = useState<CategoryCard[]>([]);
  const [displayedPlanets, setDisplayedPlanets] = useState<Planet[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPlanets(null);
      setSelectedCategory(null);
      setCategoryCards([]);
      setDisplayedPlanets([]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    
    try {
      // First upload the file
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('http://localhost:8000/upload-file', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('File upload failed');
      }

      // Then retrain the model
      const retrainResponse = await fetch('http://localhost:8000/retrain', {
        method: 'POST',
        body: formData,
      });

      if (!retrainResponse.ok) {
        throw new Error('Analysis failed');
      }

      const result = await retrainResponse.json();
      console.log('Analysis result:', result);

      // For demonstration purposes, we'll create some sample data
      // In production, this should come from backend data
      const sampleData: BackendData = {};
      for (let i = 1; i <= 20; i++) {
        sampleData[`Planet-${i}`] = {
          probability: Math.random(),
          orbital_period: Math.random() * 1000,
          transit_duration: Math.random() * 20,
          planet_radius: Math.random() * 5,
          stellar_mass: Math.random() * 2,
          temperature: Math.random() * 500 - 100,
          distance: Math.random() * 1000
        };
      }

      const processedPlanets = convertBackendData(sampleData);
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
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to analyze the file. Please try again.');
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
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temperature</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Radius</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {card.planets.map((planet) => (
                            <tr key={planet.name} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{planet.name}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{(planet.probability * 100).toFixed(1)}%</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{planet.data.temperature}K</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{planet.data.distance} ly</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{planet.data.planet_radius}R⊕</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{planet.data.orbital_period}d</td>
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