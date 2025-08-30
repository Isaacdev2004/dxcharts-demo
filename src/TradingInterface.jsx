import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  CandlestickController,
  CandlestickElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TradingInterface = ({ data }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1H');
  const [selectedSymbol, setSelectedSymbol] = useState('HAM/USD');
  const [currentPrice, setCurrentPrice] = useState(122.25);
  const [priceChange, setPriceChange] = useState(1.75);
  const [priceChangePercent, setPriceChangePercent] = useState(1.45);

  // Trading symbols data
  const symbols = [
    { symbol: 'HAM/USD', price: 122.25, change: 1.75, percent: 1.45 },
    { symbol: 'PORK/USD', price: 89.50, change: -0.85, percent: -0.94 },
    { symbol: 'BEEF/USD', price: 156.80, change: 2.30, percent: 1.49 },
    { symbol: 'CHICKEN/USD', price: 78.90, change: 0.45, percent: 0.57 },
  ];

  const timeframes = ['1M', '5M', '15M', '30M', '1H', '4H', '1D', '1W', '1MN'];

  // Convert data to candlestick format
  const chartData = {
    datasets: [
      {
        label: 'HAM Price',
        data: data?.map((item, index) => ({
          x: item.timestamp,
          o: Number(item.open) || Number(item.hamValue) || 120,
          h: Number(item.high) || Number(item.hamValue) + 2 || 125,
          l: Number(item.low) || Number(item.hamValue) - 2 || 118,
          c: Number(item.close) || Number(item.hamValue) || 122,
        })) || [],
        backgroundColor: function(context) {
          const point = context.parsed;
          return point.c >= point.o ? '#26a69a' : '#ef5350';
        },
        borderColor: function(context) {
          const point = context.parsed;
          return point.c >= point.o ? '#26a69a' : '#ef5350';
        },
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#333',
        borderWidth: 1,
        callbacks: {
          title: function(context) {
            return new Date(context[0].parsed.x).toLocaleString();
          },
          label: function(context) {
            const point = context.parsed;
            return [
              `Open: $${point.o?.toFixed(2)}`,
              `High: $${point.h?.toFixed(2)}`,
              `Low: $${point.l?.toFixed(2)}`,
              `Close: $${point.c?.toFixed(2)}`,
            ];
          }
        }
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'hour',
          displayFormats: {
            hour: 'HH:mm'
          }
        },
        grid: {
          color: '#2a2d3a',
          lineWidth: 1,
        },
        ticks: {
          color: '#8a8d99',
          maxTicksLimit: 10,
        },
      },
      y: {
        position: 'right',
        grid: {
          color: '#2a2d3a',
          lineWidth: 1,
        },
        ticks: {
          color: '#8a8d99',
          callback: function(value) {
            return '$' + value.toFixed(2);
          }
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
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
              placeholder="Search..."
              className="search-input"
            />
          </div>
          
          <div className="symbols-section">
            <div className="section-header">All symbols</div>
            {symbols.map((item, index) => (
              <div 
                key={index}
                className={`symbol-item ${selectedSymbol === item.symbol ? 'active' : ''}`}
                onClick={() => setSelectedSymbol(item.symbol)}
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
              <button className="control-btn">📊</button>
              <button className="control-btn">📏</button>
              <button className="control-btn">⚙️</button>
              <button className="control-btn">📷</button>
              <button className="control-btn">🔍</button>
            </div>
          </div>

          {/* Chart Container */}
          <div className="chart-container">
            <Chart type="line" data={chartData} options={chartOptions} />
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
                  <span>0.00</span>
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
