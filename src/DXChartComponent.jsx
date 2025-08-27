import React, { useEffect, useRef, useState } from 'react';
import { createChart } from '@devexperts/dxcharts-lite';

/**
 * Official Devexperts DXCharts Component
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

    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      // Try multiple ways to get the chart container
      let container = chartRef.current;
      if (!container) {
        container = document.getElementById('dx-chart-container');
      }
      if (!container) {
        container = document.querySelector('[ref="chartRef"]');
      }
      
      if (!container) {
        setChartStatus('error');
        setError('Chart container not available - please refresh the page');
        return;
      }

      // Clean up previous instance
      if (chartInstanceRef.current) {
        try {
          chartInstanceRef.current.destroy();
          console.log('Previous DXCharts instance destroyed');
        } catch (e) {
          console.warn('Error destroying previous chart:', e);
        }
        chartInstanceRef.current = null;
      }

      try {
        console.log('Initializing DXCharts with data:', data.length, 'points');
        console.log('First data point:', data[0]);
        console.log('Chart container element:', container);

        // Create DXCharts instance
        const chart = createChart(container, {
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
        console.log('DXCharts instance created successfully');

        // Format data for DXCharts - simplified structure
        const chartData = data.map(item => ({
          time: Math.floor(item.timestamp / 1000), // Convert to Unix timestamp in seconds
          value: Number(item.hamValue) || 0,
        }));

        console.log('Setting main series data:', chartData.length, 'points');
        console.log('Sample data point:', chartData[0]);

        // Add main line series for 23-27# Trmd Selected Ham  
        console.log('Chart object methods:', Object.getOwnPropertyNames(chart));
        console.log('Chart prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(chart)));
        console.log('Chart object:', chart);
        
        // Try different API approaches
        let mainSeries;
        try {
          if (typeof chart.addLineSeries === 'function') {
            mainSeries = chart.addLineSeries({
              color: '#2196F3',
              lineWidth: 3,
            });
          } else if (typeof chart.addSeries === 'function') {
            mainSeries = chart.addSeries('line', {
              color: '#2196F3',
              lineWidth: 3,
            });
          } else if (typeof chart.createLineSeries === 'function') {
            mainSeries = chart.createLineSeries({
              color: '#2196F3',
              lineWidth: 3,
            });
          } else {
            throw new Error('No valid line series method found on chart object');
          }
        } catch (seriesError) {
          console.error('Error creating line series:', seriesError);
          console.log('Available chart methods:', Object.getOwnPropertyNames(chart).filter(prop => typeof chart[prop] === 'function'));
          throw seriesError;
        }

        // Set data to main series
        if (mainSeries && typeof mainSeries.setData === 'function') {
          mainSeries.setData(chartData);
        } else {
          console.error('mainSeries.setData is not available');
        }

        // Add moving average series if enabled
        if (showMovingAverage && data.length >= 20) {
          console.log('Adding moving average series');
          
          // Calculate moving average data
          const maData = [];
          for (let i = 19; i < data.length; i++) {
            const sum = data.slice(i - 19, i + 1)
              .reduce((acc, curr) => acc + (Number(curr.hamValue) || 0), 0);
            const avg = sum / 20;

            maData.push({
              time: Math.floor(data[i].timestamp / 1000),
              value: Number(avg.toFixed(2))
            });
          }

          console.log('Setting MA data:', maData.length, 'points');
          if (maData.length > 0) {
            const maSeries = chart.addLineSeries({
              color: '#FF9800',
              lineWidth: 2,
            });
            maSeries.setData(maData);
          }
        }

        // Add volume histogram series
        console.log('Adding volume histogram series');
        const volumeSeries = chart.addHistogramSeries({
          color: '#26a69a',
        });

        const volumeData = chartData.map(item => ({
          time: item.time,
          value: Number(data.find(d => Math.floor(d.timestamp / 1000) === item.time)?.volume || 0),
        }));

        console.log('Setting volume data:', volumeData.length, 'points');
        volumeSeries.setData(volumeData);

        // Add crosshair interaction for tooltips
        chart.subscribeCrosshairMove((param) => {
          console.log('Crosshair move:', param);

          const tooltip = document.getElementById('dx-tooltip');
          if (!tooltip) return;

          if (param.time) {
            // Find the data point closest to the hovered time
            const dataPoint = data.find(item =>
              Math.abs(Math.floor(item.timestamp / 1000) - param.time) < 300 // Within 5 minutes
            );

            if (dataPoint) {
              console.log('Found data point for tooltip:', dataPoint);
              const time = new Date(dataPoint.timestamp);

              tooltip.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 8px; color: #2196F3;">📊 23-27# Trmd Selected Ham</div>
                <div style="margin-bottom: 4px;"><strong>Time:</strong> ${time.toLocaleString()}</div>
                <div style="margin-bottom: 4px;"><strong>Price:</strong> $${Number(dataPoint.hamValue).toFixed(2)}</div>
                <div style="margin-bottom: 4px;"><strong>Volume:</strong> ${dataPoint.volume.toLocaleString()} lbs</div>
                ${showMovingAverage ? '<div><strong>MA(20):</strong> Available on chart</div>' : ''}
              `;

              tooltip.style.display = 'block';
              tooltip.style.position = 'fixed';
              tooltip.style.left = '20px';
              tooltip.style.top = '20px';
              tooltip.style.zIndex = '9999';
            }
          } else {
            tooltip.style.display = 'none';
          }
        });

        // Fit content to show all data
        setTimeout(() => {
          try {
            chart.timeScale().fitContent();
            console.log('DXCharts content fitted successfully');
          } catch (e) {
            console.warn('Error fitting content:', e);
          }
        }, 500);

        setChartStatus('ready');
        console.log('DXCharts setup completed successfully!');

      } catch (error) {
        console.error('DXCharts creation error:', error);
        console.error('Error details:', error.stack);
        setError(error.message || 'Failed to create DXCharts instance');
        setChartStatus('error');
      }
    }, 100); // Small delay to ensure DOM is ready

    // Cleanup function
    return () => {
      clearTimeout(timer);
      if (chartInstanceRef.current) {
        try {
          chartInstanceRef.current.destroy();
          console.log('DXCharts instance cleaned up');
        } catch (error) {
          console.warn('Error cleaning up DXCharts:', error);
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
          <div style={{ fontSize: '24px', marginBottom: '15px' }}>📊</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>Loading DXCharts...</div>
          <div style={{ fontSize: '12px', marginTop: '5px' }}>Initializing Devexperts DXCharts</div>
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
          <div style={{ fontSize: '24px', marginBottom: '15px' }}>📄</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>No Data Available</div>
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
          <div style={{ fontSize: '24px', marginBottom: '15px' }}>⚠️</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>DXCharts Error</div>
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
        top: '15px',
        right: '15px',
        background: '#28a745',
        color: 'white',
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 'bold',
        zIndex: 100,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}>
        ✅ DXCharts Ready
      </div>

      {/* Main Chart Container */}
      <div
        ref={chartRef}
        id="dx-chart-container"
        style={{
          width: '800px',
          height: '400px',
          border: '2px solid #28a745',
          borderRadius: '8px',
          backgroundColor: 'white',
          position: 'relative',
          display: 'block'
        }}
      />

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(255,255,255,0.9)',
        padding: '8px 16px',
        borderRadius: '6px',
        fontSize: '12px',
        display: 'flex',
        gap: '20px',
        zIndex: 100,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '12px', height: '2px', backgroundColor: '#2196F3' }}></div>
          <span>Price</span>
        </div>
        {showMovingAverage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '2px', backgroundColor: '#FF9800', borderStyle: 'dashed', borderWidth: '1px 0' }}></div>
            <span>MA(20)</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', backgroundColor: '#26a69a' }}></div>
          <span>Volume</span>
        </div>
      </div>

      {/* Tooltip */}
      <div
        id="dx-tooltip"
        style={{
          display: 'none',
          background: 'rgba(0,0,0,0.9)',
          color: 'white',
          padding: '12px',
          borderRadius: '6px',
          fontSize: '13px',
          minWidth: '250px',
          maxWidth: '300px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 1000,
          pointerEvents: 'none'
        }}
      />

      {/* Chart Instructions */}
      <div style={{
        marginTop: '15px',
        textAlign: 'center',
        color: '#666',
        fontSize: '14px',
        padding: '10px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>🎯 DXCharts Features:</div>
        <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
          • <strong>Hover:</strong> Move mouse over chart for detailed tooltips<br/>
          • <strong>Zoom:</strong> Use mouse wheel to zoom in/out<br/>
          • <strong>Pan:</strong> Click and drag to navigate through time<br/>
          • <strong>Legend:</strong> Shows Price, MA(20), and Volume series
        </div>
      </div>
    </div>
  );
};

export default DXChartComponent;
