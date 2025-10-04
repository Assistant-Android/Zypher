import { useState } from 'react';
import { Upload, Download, FileText, TrendingUp } from 'lucide-react';

interface PredictionResult {
  row: number;
  probability: number;
  data: Record<string, string | number>;
}

export default function BatchAnalysis() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PredictionResult[] | null>(null);
  const [stats, setStats] = useState<{ total: number; detected: number; confidence: number } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResults(null);
      setStats(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockResults: PredictionResult[] = Array.from({ length: 10 }, (_, i) => ({
      row: i + 1,
      probability: Math.random(),
      data: {
        orbital_period: (Math.random() * 1000).toFixed(2),
        transit_duration: (Math.random() * 20).toFixed(2),
        planet_radius: (Math.random() * 5).toFixed(2),
        stellar_mass: (Math.random() * 2).toFixed(2),
      },
    }));

    mockResults.sort((a, b) => b.probability - a.probability);

    const detected = mockResults.filter((r) => r.probability > 0.5).length;
    const avgConfidence = mockResults.reduce((sum, r) => sum + r.probability, 0) / mockResults.length;

    setResults(mockResults);
    setStats({
      total: mockResults.length,
      detected,
      confidence: avgConfidence,
    });
    setLoading(false);
  };

  const handleDownload = () => {
    if (!results) return;

    const csv = [
      'Row,Probability,Orbital_Period,Transit_Duration,Planet_Radius,Stellar_Mass',
      ...results.map((r) =>
        `${r.row},${r.probability.toFixed(4)},${r.data.orbital_period},${r.data.transit_duration},${r.data.planet_radius},${r.data.stellar_mass}`
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exoplanet_predictions.csv';
    a.click();
  };

  return (
    <section id="batch" className="min-h-screen bg-white py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full mb-4">
            <TrendingUp size={16} className="text-purple-600" />
            <span className="text-sm font-medium text-purple-600">Level 2 Challenge</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-4 tracking-tight">Batch Analysis</h2>
          <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">Upload CSV file for bulk exoplanet detection</p>
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

          <div className="flex justify-center gap-4">
            <button
              onClick={handleAnalyze}
              disabled={!file || loading}
              className="px-8 py-4 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-105"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <FileText size={20} />
                  Analyze Dataset
                </>
              )}
            </button>

            {results && (
              <button
                onClick={handleDownload}
                className="px-8 py-4 bg-green-600 text-white font-medium rounded-full hover:bg-green-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 hover:scale-105"
              >
                <Download size={20} />
                Download Results
              </button>
            )}
          </div>

          {stats && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="text-4xl font-semibold text-blue-600 mb-2">{stats.total}</div>
                <div className="text-gray-600 text-sm font-medium">Total Samples</div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="text-4xl font-semibold text-green-600 mb-2">{stats.detected}</div>
                <div className="text-gray-600 text-sm font-medium">Exoplanets Detected</div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="text-4xl font-semibold text-purple-600 mb-2">
                  {(stats.confidence * 100).toFixed(1)}%
                </div>
                <div className="text-gray-600 text-sm font-medium">Avg Confidence</div>
              </div>
            </div>
          )}

          {results && (
            <div className="mt-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Top 10 Predictions</h3>
              <div className="overflow-x-auto bg-white rounded-2xl border border-gray-200">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-gray-700 text-xs font-semibold uppercase tracking-wider">Row</th>
                      <th className="px-6 py-4 text-gray-700 text-xs font-semibold uppercase tracking-wider">Probability</th>
                      <th className="px-6 py-4 text-gray-700 text-xs font-semibold uppercase tracking-wider">Orbital Period</th>
                      <th className="px-6 py-4 text-gray-700 text-xs font-semibold uppercase tracking-wider">Transit Duration</th>
                      <th className="px-6 py-4 text-gray-700 text-xs font-semibold uppercase tracking-wider">Planet Radius</th>
                      <th className="px-6 py-4 text-gray-700 text-xs font-semibold uppercase tracking-wider">Stellar Mass</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result) => (
                      <tr
                        key={result.row}
                        className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-gray-900 font-medium">{result.row}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`font-semibold ${
                              result.probability > 0.7
                                ? 'text-green-600'
                                : result.probability > 0.5
                                ? 'text-yellow-600'
                                : 'text-red-600'
                            }`}
                          >
                            {(result.probability * 100).toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{result.data.orbital_period}</td>
                        <td className="px-6 py-4 text-gray-600">{result.data.transit_duration}</td>
                        <td className="px-6 py-4 text-gray-600">{result.data.planet_radius}</td>
                        <td className="px-6 py-4 text-gray-600">{result.data.stellar_mass}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
