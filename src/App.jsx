import React, { useState, useEffect } from 'react';
import DXChartComponent from './DXChartComponent';
import { loadCSVFile, parseCSVForCharts, calculateMovingAverage } from './csvParser';

/**
 * Main App Component for DXCharts Demo
 */
function App() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMovingAverage, setShowMovingAverage] = useState(false);
  const [dataStats, setDataStats] = useState({});

  useEffect(() => {
    loadAndProcessData();
  }, []);

  const loadAndProcessData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load CSV data
      const csvText = await loadCSVFile('sample-data.csv');

      // Parse CSV data
      const parsedData = await parseCSVForCharts(csvText);

      if (parsedData.length === 0) {
        throw new Error('No valid data found in CSV file');
      }

      // Calculate moving average
      const dataWithMA = calculateMovingAverage(parsedData, 20);

      // Calculate data statistics
      const hamValues = parsedData.map(item => item.hamValue);
      const stats = {
        totalPoints: parsedData.length,
        minValue: Math.min(...hamValues),
        maxValue: Math.max(...hamValues),
        avgValue: hamValues.reduce((sum, val) => sum + val, 0) / hamValues.length,
        timeRange: {
          start: new Date(parsedData[0].timestamp).toLocaleString(),
          end: new Date(parsedData[parsedData.length - 1].timestamp).toLocaleString()
        }
      };

      setChartData(dataWithMA);
      setDataStats(stats);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadAndProcessData();
  };

  const handleToggleMovingAverage = () => {
    setShowMovingAverage(!showMovingAverage);
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading">
          <h2>Loading DXCharts Demo...</h2>
          <div className="spinner"></div>
          <p>Parsing CSV data and initializing chart</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="error">
          <h2>Error Loading Data</h2>
          <p>{error}</p>
          <button onClick={handleRefresh} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>DXCharts Integration Demo</h1>
        <p>Interactive time-series visualization of "23-27# Trmd Selected Ham" data</p>
      </header>

      <div className="controls-section">
        <div className="control-group">
          <button
            onClick={handleToggleMovingAverage}
            className={`control-button ${showMovingAverage ? 'active' : ''}`}
          >
            {showMovingAverage ? 'Hide' : 'Show'} Moving Average (20)
          </button>
          <button onClick={handleRefresh} className="control-button">
            Refresh Data
          </button>
        </div>
      </div>

      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Data Points:</span>
            <span className="stat-value">{dataStats.totalPoints}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Time Range:</span>
            <span className="stat-value">
              {dataStats.timeRange?.start} - {dataStats.timeRange?.end}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Min Value:</span>
            <span className="stat-value">{dataStats.minValue?.toFixed(2)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Max Value:</span>
            <span className="stat-value">{dataStats.maxValue?.toFixed(2)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Average:</span>
            <span className="stat-value">{dataStats.avgValue?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="chart-section">
        <DXChartComponent
          data={chartData}
          showMovingAverage={showMovingAverage}
        />
      </div>

      <div className="info-section">
        <h3>Chart Features</h3>
        <ul>
          <li><strong>Zoom:</strong> Use mouse wheel to zoom in/out</li>
          <li><strong>Pan:</strong> Click and drag to pan across time</li>
          <li><strong>Crosshair:</strong> Hover over chart to see detailed values</li>
          <li><strong>Volume Bars:</strong> Bottom panel shows trading volume</li>
          {showMovingAverage && (
            <li><strong>Moving Average:</strong> Orange dashed line shows 20-period MA</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default App;
