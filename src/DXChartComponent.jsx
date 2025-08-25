import React, { useEffect, useRef } from 'react';
import { createChart } from '@devexperts/dxcharts-lite';

/**
 * DXCharts Component for displaying time series data
 */
const DXChartComponent = ({ data, showMovingAverage = false }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) {
      console.log('DXChartComponent: No data available');
      return;
    }

    if (!chartRef.current) {
      console.log('DXChartComponent: Chart container not available');
      return;
    }

    console.log('DXChartComponent: Starting chart setup with data:', { dataLength: data.length, firstItem: data[0] });

    // Clean up previous instance
    if (chartInstanceRef.current) {
      try {
        chartInstanceRef.current.destroy();
        console.log('DXChartComponent: Previous chart destroyed');
      } catch (e) {
        console.warn('Error destroying previous chart:', e);
      }
      chartInstanceRef.current = null;
    }

    try {
      // Create a simple test dataset first
      const testData = [
        { time: Date.now() - 300000, value: 125.5 },
        { time: Date.now() - 240000, value: 126.7 },
        { time: Date.now() - 180000, value: 128.2 },
        { time: Date.now() - 120000, value: 127.8 },
        { time: Date.now() - 60000, value: 129.1 },
      ];

      console.log('DXChartComponent: Using test data for initial setup');

      // Create chart instance
      console.log('DXChartComponent: Creating chart...');
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
        rightPriceScale: { borderColor: 'rgba(197, 203, 206, 0.8)' },
        timeScale: { borderColor: 'rgba(197, 203, 206, 0.8)' },
      });

      console.log('DXChartComponent: Chart created successfully');
      chartInstanceRef.current = chart;

      // Add line series
      console.log('DXChartComponent: Adding line series...');
      const lineSeries = chart.addLineSeries({
        color: '#2196F3',
        lineWidth: 2,
        title: 'Test Data',
      });

      console.log('DXChartComponent: Setting test data...');
      lineSeries.setData(testData);

      console.log('DXChartComponent: Test chart setup complete');

      // Now try with real data if available
      if (data && data.length > 0) {
        setTimeout(() => {
          try {
            console.log('DXChartComponent: Switching to real data...');

            // Clear existing data
            lineSeries.setData([]);

            // Format real data
            const realData = data.map(item => ({
              time: item.timestamp,
              value: Number(item.hamValue) || 0
            }));

            console.log('DXChartComponent: Real data formatted:', { length: realData.length, firstItem: realData[0] });

            // Set real data
            lineSeries.setData(realData);
            console.log('DXChartComponent: Real data set successfully');

            // Update series title
            chart.applyOptions({
              title: '23-27# Trmd Selected Ham'
            });

            // Fit content
            setTimeout(() => {
              try {
                chart.timeScale().fitContent();
                console.log('DXChartComponent: Content fitted');
              } catch (e) {
                console.warn('Error fitting content:', e);
              }
            }, 100);

          } catch (error) {
            console.error('Error switching to real data:', error);
          }
        }, 500); // Small delay to ensure chart is ready
      }

    } catch (error) {
      console.error('Error in DXChartComponent:', error);
      console.error('Error stack:', error.stack);
    }

    // Cleanup
    return () => {
      if (chartInstanceRef.current) {
        try {
          chartInstanceRef.current.destroy();
          console.log('DXChartComponent: Chart cleaned up');
        } catch (error) {
          console.warn('Error cleaning up chart:', error);
        }
        chartInstanceRef.current = null;
      }
    };
  }, [data, showMovingAverage]);

  console.log('DXChartComponent: Rendering component');

  return (
    <div className="dx-chart-container" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div
        ref={chartRef}
        style={{
          width: '800px',
          height: '400px',
          border: '2px solid #2196F3',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa',
          position: 'relative'
        }}
      />
      <div
        id="chart-tooltip"
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          display: 'none',
          zIndex: 1000,
          pointerEvents: 'none',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px'
        }}
      />
    </div>
  );
};

export default DXChartComponent;
