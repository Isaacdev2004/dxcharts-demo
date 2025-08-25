import React, { useEffect, useRef, useState } from 'react';
import { createChart } from '@devexperts/dxcharts-lite';

/**
 * Simple and Functional DXCharts Component
 */
const DXChartComponent = ({ data, showMovingAverage = false }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [chartStatus, setChartStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!data || data.length === 0) {
      setChartStatus('no-data');
      return;
    }

    setChartStatus('creating');
    setError(null);

    // Clean up previous instance
    if (chartInstanceRef.current) {
      try {
        chartInstanceRef.current.destroy();
      } catch (e) {
        console.warn('Error destroying previous chart:', e);
      }
      chartInstanceRef.current = null;
    }

    try {
      console.log('Creating chart with data:', data.length, 'points');

      // Create chart with basic configuration
      const chart = createChart(chartRef.current, {
        width: 800,
        height: 400,
        layout: {
          background: { type: 'solid', color: 'white' },
          textColor: 'black',
        },
        grid: {
          vertLines: { color: 'rgba(197, 203, 206, 0.5)' },
          horzLines: { color: 'rgba(197, 203, 206, 0.5)' },
        },
        crosshair: { mode: 'normal' },
        rightPriceScale: {
          borderColor: 'rgba(197, 203, 206, 0.8)',
          visible: true,
        },
        timeScale: {
          borderColor: 'rgba(197, 203, 206, 0.8)',
          timeVisible: true,
          secondsVisible: false,
        },
      });

      chartInstanceRef.current = chart;
      console.log('Chart created successfully');

      // Add main line series for "23-27# Trmd Selected Ham"
      const mainSeries = chart.addLineSeries({
        color: '#2196F3',
        lineWidth: 3,
        title: '23-27# Trmd Selected Ham',
        priceFormat: {
          type: 'price',
          precision: 2,
          minMove: 0.01,
        },
      });

      // Format data for the chart
      const chartData = data.map(item => ({
        time: Math.floor(item.timestamp / 1000), // Convert to seconds
        value: Number(item.hamValue) || 0,
        volume: Number(item.volume) || 0,
      }));

      console.log('Setting chart data:', chartData.length, 'points');
      mainSeries.setData(chartData);

      // Add moving average if requested
      if (showMovingAverage && data.length > 20) {
        const maSeries = chart.addLineSeries({
          color: '#FF9800',
          lineWidth: 2,
          lineStyle: 1, // Dashed line
          title: 'Moving Average (20)',
        });

        // Calculate moving average
        const maData = data.map((item, index) => {
          if (index < 19) return null;

          const sum = data.slice(index - 19, index + 1)
            .reduce((acc, curr) => acc + (Number(curr.hamValue) || 0), 0);
          const avg = sum / 20;

          return {
            time: Math.floor(item.timestamp / 1000),
            value: Number(avg.toFixed(2))
          };
        }).filter(item => item !== null);

        if (maData.length > 0) {
          maSeries.setData(maData);
        }
      }

      // Add volume histogram
      const volumeSeries = chart.addHistogramSeries({
        color: '#26a69a',
        title: 'Volume',
        priceScaleId: '',
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      const volumeData = chartData.map(item => ({
        time: item.time,
        value: item.volume,
        color: '#26a69a' // Green for all volumes
      }));

      volumeSeries.setData(volumeData);

      // Add crosshair interaction for tooltips
      chart.subscribeCrosshairMove((param) => {
        // Find tooltip element - try multiple ways
        let tooltip = document.getElementById('chart-tooltip');

        // If not found by ID, try finding by class
        if (!tooltip) {
          tooltip = document.querySelector('.chart-tooltip');
        }

        // If still not found, create one dynamically
        if (!tooltip) {
          tooltip = document.createElement('div');
          tooltip.id = 'chart-tooltip';
          tooltip.className = 'chart-tooltip';
          tooltip.style.cssText = `
            position: absolute;
            top: 50px;
            left: 20px;
            display: none;
            z-index: 1000;
            pointer-events: none;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 12px;
            border-radius: 6px;
            font-size: 13px;
            min-width: 200px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          `;
          document.body.appendChild(tooltip);
        }

        if (param.time) {
          const dataPoint = data.find(item =>
            Math.floor(item.timestamp / 1000) === param.time
          );

          if (dataPoint) {
            const time = new Date(dataPoint.timestamp);
            tooltip.innerHTML = `
              <div style="font-weight: bold; margin-bottom: 5px;">📊 Data Point</div>
              <div>⏰ Time: ${time.toLocaleTimeString()}</div>
              <div>📈 Value: ${Number(dataPoint.hamValue).toFixed(2)}</div>
              <div>📦 Volume: ${dataPoint.volume}</div>
              ${showMovingAverage ? '<div>📊 MA(20): Available</div>' : ''}
            `;
            tooltip.style.display = 'block';
          }
        } else {
          tooltip.style.display = 'none';
        }
      });

      // Fit the chart to show all data
      setTimeout(() => {
        try {
          chart.timeScale().fitContent();
          console.log('Chart content fitted');
        } catch (e) {
          console.warn('Error fitting content:', e);
        }
      }, 100);

      setChartStatus('ready');
      console.log('Chart setup complete!');

    } catch (error) {
      console.error('Chart creation error:', error);
      setError(error.message);
      setChartStatus('error');
    }

    // Cleanup function
    return () => {
      if (chartInstanceRef.current) {
        try {
          chartInstanceRef.current.destroy();
          console.log('Chart cleaned up');
        } catch (error) {
          console.warn('Error cleaning up chart:', error);
        }
        chartInstanceRef.current = null;
      }
    };
  }, [data, showMovingAverage]);

  // Show different states
  if (chartStatus === 'loading') {
    return (
      <div style={{
        width: '800px',
        height: '400px',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        color: '#666'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>📊</div>
          <div>Loading Chart...</div>
        </div>
      </div>
    );
  }

  if (chartStatus === 'no-data') {
    return (
      <div style={{
        width: '800px',
        height: '400px',
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        color: '#666'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>📄</div>
          <div>No Data Available</div>
          <div style={{ fontSize: '12px', marginTop: '5px' }}>Please load CSV data first</div>
        </div>
      </div>
    );
  }

  if (chartStatus === 'error') {
    return (
      <div style={{
        width: '800px',
        height: '400px',
        border: '2px solid #dc3545',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8d7da',
        color: '#721c24'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>⚠️</div>
          <div>Chart Error</div>
          <div style={{ fontSize: '12px', marginTop: '5px' }}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', position: 'relative' }}>
      {/* Chart Status Indicator */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: '#28a745',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        zIndex: 100
      }}>
        ✅ Chart Ready
      </div>

      {/* Main Chart Container */}
      <div
        ref={chartRef}
        style={{
          width: '800px',
          height: '400px',
          border: '2px solid #28a745',
          borderRadius: '8px',
          backgroundColor: 'white',
          position: 'relative'
        }}
      />

      {/* Tooltip - will be created dynamically if needed */}
      <div
        id="chart-tooltip"
        className="chart-tooltip"
        style={{
          position: 'absolute',
          top: '50px',
          left: '20px',
          display: 'none',
          zIndex: 1000,
          pointerEvents: 'none'
        }}
      />

      {/* Chart Instructions */}
      <div style={{
        marginTop: '10px',
        textAlign: 'center',
        color: '#666',
        fontSize: '14px'
      }}>
        <div><strong>📈 Interactive Chart Features:</strong></div>
        <div style={{ fontSize: '12px', marginTop: '5px' }}>
          • Hover over the chart for data details<br/>
          • Scroll to zoom in/out<br/>
          • Click and drag to pan through time
        </div>
      </div>
    </div>
  );
};

export default DXChartComponent;
