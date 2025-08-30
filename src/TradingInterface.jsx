import React, { useState, useEffect, useRef } from 'react';
import { createChart, generateCandlesData } from '@devexperts/dxcharts-lite';

const TradingInterface = ({ data }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1H');
  const [selectedSymbol, setSelectedSymbol] = useState('HAM/USD');
  const [currentPrice, setCurrentPrice] = useState(122.25);
  const [priceChange, setPriceChange] = useState(1.75);
  const [priceChangePercent, setPriceChangePercent] = useState(1.45);
  const [chartType, setChartType] = useState('candle');

  // Trading symbols data
  const symbols = [
    { symbol: 'HAM/USD', price: 122.25, change: 1.75, percent: 1.45 },
    { symbol: 'PORK/USD', price: 89.50, change: -0.85, percent: -0.94 },
    { symbol: 'BEEF/USD', price: 156.80, change: 2.30, percent: 1.49 },
    { symbol: 'CHICKEN/USD', price: 78.90, change: 0.45, percent: 0.57 },
  ];

  const timeframes = ['1M', '5M', '15M', '30M', '1H', '4H', '1D', '1W', '1MN'];
  const chartTypes = ['candle', 'line', 'area', 'histogram'];

  // Initialize DXCharts
  useEffect(() => {
    if (!chartRef.current) return;

    const timer = setTimeout(() => {
      try {
        console.log('Creating DXCharts for Trading Interface...');

        // Clean up previous instance
        if (chartInstanceRef.current) {
          try {
            chartInstanceRef.current.destroy();
          } catch (e) {
            console.warn('Error destroying previous chart:', e);
          }
          chartInstanceRef.current = null;
        }

        // Create DXCharts instance
        const chartInstance = createChart(chartRef.current);
        chartInstanceRef.current = chartInstance;

        console.log('DXCharts Trading Interface created successfully:', chartInstance);

        if (data && data.length > 0) {
          // Convert CSV data to DXCharts format
          const candlesData = data.map((item) => ({
            timestamp: item.timestamp,
            open: Number(item.open) || Number(item.hamValue) || 120 + Math.random() * 2,
            high: Number(item.high) || Number(item.hamValue) + 2 || 125 + Math.random() * 2,
            low: Number(item.low) || Number(item.hamValue) - 2 || 118 + Math.random() * 2,
            close: Number(item.close) || Number(item.hamValue) || 122 + Math.random() * 2,
            volume: Number(item.volume) || Math.floor(Math.random() * 100000),
            hi: Number(item.hamValue) || 122 + Math.random() * 2,
            lo: Number(item.hamValue) || 122 + Math.random() * 2,
          }));

          chartInstance.setData({ candles: candlesData });
        } else {
          // Use generated sample data
          const sampleCandles = generateCandlesData();
          chartInstance.setData({ candles: sampleCandles });
        }

        // Set initial chart type
        chartInstance.setChartType(chartType);
        chartInstance.setShowWicks(true);

        console.log('DXCharts Trading Interface setup completed!');

      } catch (error) {
        console.error('DXCharts Trading Interface error:', error);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (chartInstanceRef.current) {
        try {
          chartInstanceRef.current.destroy();
        } catch (error) {
          console.warn('Error cleaning up DXCharts:', error);
        }
        chartInstanceRef.current = null;
      }
    };
  }, [data, chartType]);

  // Handle chart type change
  const handleChartTypeChange = (newType) => {
    setChartType(newType);
    if (chartInstanceRef.current) {
      try {
        chartInstanceRef.current.setChartType(newType);
        if (newType === 'candle') {
          chartInstanceRef.current.setShowWicks(true);
        }
        console.log('Chart type changed to:', newType);
      } catch (error) {
        console.error('Error changing chart type:', error);
      }
    }
  };

  // Handle symbol change
  const handleSymbolChange = (symbol) => {
    setSelectedSymbol(symbol.symbol);
    setCurrentPrice(symbol.price);
    setPriceChange(symbol.change);
    setPriceChangePercent(symbol.percent);
    
    // In a real app, you would load new data for the selected symbol
    console.log('Symbol changed to:', symbol.symbol);
  };

  return (
    <div className="trading-interface">
      {/* Header */}
      <div className="trading-header">
        <div className="platform-info">
          <div className="platform-name">WebTRADER</div>
          <span className="platform-beta">beta</span>
        </div>
        <div className="user-info">
          <span>Welcome, Trader</span>
          <button className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="trading-content">
        {/* Sidebar */}
        <div className="trading-sidebar">
          <div className="search-section">
            <input 
              type="text" 
              placeholder="Search symbols..."
              className="search-input"
            />
          </div>
          
          <div className="symbols-section">
            <div className="section-header">All symbols</div>
            {symbols.map((item, index) => (
              <div 
                key={index}
                className={`symbol-item ${selectedSymbol === item.symbol ? 'active' : ''}`}
                onClick={() => handleSymbolChange(item)}
              >
                <div className="symbol-name">{item.symbol}</div>
                <div className="symbol-price">{item.price.toFixed(2)}</div>
                <div className={`symbol-change ${item.change >= 0 ? 'positive' : 'negative'}`}>
                  {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}
                </div>
                <div className={`symbol-percent ${item.percent >= 0 ? 'positive' : 'negative'}`}>
                  {item.percent >= 0 ? '+' : ''}{item.percent.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chart Area */}
        <div className="trading-main">
          {/* Chart Header */}
          <div className="chart-header">
            <div className="symbol-info">
              <h2 className="symbol-title">{selectedSymbol}</h2>
              <div className="price-info">
                <span className="current-price">${currentPrice.toFixed(2)}</span>
                <span className={`price-change ${priceChange >= 0 ? 'positive' : 'negative'}`}>
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
                </span>
              </div>
            </div>

            {/* Chart Type Selector */}
            <div className="chart-type-selector">
              {chartTypes.map((type) => (
                <button
                  key={type}
                  className={`chart-type-btn ${chartType === type ? 'active' : ''}`}
                  onClick={() => handleChartTypeChange(type)}
                  title={`Switch to ${type} chart`}
                >
                  {type === 'candle' ? '📊' : type === 'line' ? '📈' : type === 'area' ? '📉' : '📊'}
                </button>
              ))}
            </div>

            {/* Timeframe Selector */}
            <div className="timeframe-selector">
              {timeframes.map((tf) => (
                <button
                  key={tf}
                  className={`timeframe-btn ${selectedTimeframe === tf ? 'active' : ''}`}
                  onClick={() => setSelectedTimeframe(tf)}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Chart Controls */}
            <div className="chart-controls">
              <button className="control-btn" title="Drawing Tools">📏</button>
              <button className="control-btn" title="Indicators">📊</button>
              <button className="control-btn" title="Settings">⚙️</button>
              <button className="control-btn" title="Screenshot">📷</button>
              <button className="control-btn" title="Fullscreen">🔍</button>
            </div>
          </div>

          {/* DXCharts Container */}
          <div className="chart-container">
            <div
              ref={chartRef}
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#1e222d',
                position: 'relative'
              }}
            />
            
            {/* Chart Type Indicator */}
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: 'rgba(33, 150, 243, 0.9)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 'bold',
              zIndex: 100
            }}>
              DXCharts: {chartType.toUpperCase()}
            </div>
          </div>

          {/* Trading Panel */}
          <div className="trading-panel">
            <div className="panel-tabs">
              <button className="tab-btn active">Positions</button>
              <button className="tab-btn">Pending Orders</button>
              <button className="tab-btn">History</button>
            </div>
            
            <div className="panel-content">
              <div className="balance-info">
                <div className="balance-item">
                  <span>Balance:</span>
                  <span>1229.37</span>
                </div>
                <div className="balance-item">
                  <span>Equity:</span>
                  <span>1229.37</span>
                </div>
                <div className="balance-item">
                  <span>Margin:</span>
                  <span>-</span>
                </div>
                <div className="balance-item">
                  <span>Free Margin:</span>
                  <span>-</span>
                </div>
                <div className="balance-item">
                  <span>Unrealized Net P&L:</span>
                  <span className="positive">0.00</span>
                </div>
              </div>

              {/* DXCharts Info */}
              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: '#1e222d',
                borderRadius: '6px',
                fontSize: '12px'
              }}>
                <div style={{ fontWeight: 'bold', color: '#2196f3', marginBottom: '8px' }}>
                  📊 DXCharts Professional Features:
                </div>
                <div style={{ color: '#8a8d99', lineHeight: '1.4' }}>
                  • Real-time candlestick charts<br/>
                  • Multiple chart types: {chartTypes.join(', ')}<br/>
                  • Professional trading tools<br/>
                  • Technical analysis capabilities<br/>
                  • High-performance rendering
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Order Button */}
      <button className="new-order-btn">+ New Order</button>
    </div>
  );
};

export default TradingInterface;