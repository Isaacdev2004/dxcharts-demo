import React, { useState, useEffect } from 'react';
import DXChartComponent from './DXChartComponent';
import TradingInterface from './TradingInterface';
import './TradingInterface.css';
import { loadCSVFile, parseCSVForCharts, calculateMovingAverage } from './csvParser';

/**
 * Main App Component for Professional Trading Interface
 */
function App() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMovingAverage, setShowMovingAverage] = useState(false);
  const [dataStats, setDataStats] = useState({});
  const [viewMode, setViewMode] = useState('trading'); // 'trading' or 'simple'

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
      <div style={{ 
        height: '100vh', 
        background: '#1e222d', 
        color: '#d1d4dc', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ fontSize: '24px' }}>⚡</div>
        <h2>Loading Professional Trading Interface...</h2>
        <p>Initializing market data and charts</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        height: '100vh', 
        background: '#1e222d', 
        color: '#d1d4dc', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ fontSize: '24px' }}>⚠️</div>
        <h2>Error Loading Market Data</h2>
        <p>{error}</p>
        <button 
          onClick={handleRefresh} 
          style={{
            background: '#2196f3',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  // Show Trading Interface (TradingView-style)
  if (viewMode === 'trading') {
    return <TradingInterface data={chartData} />;
  }

  // Show Simple Chart View
  return (
    <div className="app-container">
      {/* View Mode Toggle */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        gap: '8px'
      }}>
        <button
          onClick={() => setViewMode('trading')}
          style={{
            background: viewMode === 'trading' ? '#2196f3' : '#3a3e4a',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Trading View
        </button>
        <button
          onClick={() => setViewMode('simple')}
          style={{
            background: viewMode === 'simple' ? '#2196f3' : '#3a3e4a',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Simple View
        </button>
      </div>

      <header className="app-header">
        <h1>Professional Chart Demo</h1>
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
