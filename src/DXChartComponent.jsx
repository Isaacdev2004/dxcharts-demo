import React, { useEffect, useRef } from 'react';
import { createChart } from '@devexperts/dxcharts-lite';

/**
 * DXCharts Component for displaying time series data
 */
const DXChartComponent = ({ data, showMovingAverage = false }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0 || !chartRef.current) {
      console.log('DXChartComponent: No data or chart ref available');
      return;
    }

    console.log('DXChartComponent: Processing data', { dataLength: data.length, firstItem: data[0] });

    // Clean up previous instance
    if (chartInstanceRef.current) {
      try {
        chartInstanceRef.current.destroy();
      } catch (e) {
        console.warn('Error destroying previous chart:', e);
      }
      chartInstanceRef.current = null;
    }

    // Format data for DXCharts - use milliseconds directly
    const chartData = data.map((item, index) => ({
      time: item.timestamp, // Keep as milliseconds
      value: Number(item.hamValue) || 0,
      movingAverage: item.movingAverage ? Number(item.movingAverage) : null,
      volume: Number(item.volume) || 0,
      index // Add index for debugging
    }));

    console.log('DXChartComponent: Formatted data', { chartDataLength: chartData.length, firstChartItem: chartData[0] });

    // Ensure container has proper dimensions
    const container = chartRef.current;
    container.style.width = '800px';
    container.style.height = '400px';
    container.style.backgroundColor = 'white';

    try {
      console.log('DXChartComponent: Creating chart with container:', container);

      // Create chart with minimal configuration first
      const chart = createChart(container, {
        width: 800,
        height: 400,
        layout: {
          background: { type: 'solid', color: 'white' },
          textColor: 'black',
        },
        grid: {
          vertLines: {
            color: 'rgba(197, 203, 206, 0.5)',
          },
          horzLines: {
            color: 'rgba(197, 203, 206, 0.5)',
          },
        },
        crosshair: {
          mode: 'normal',
        },
        rightPriceScale: {
          borderColor: 'rgba(197, 203, 206, 0.8)',
        },
        timeScale: {
          borderColor: 'rgba(197, 203, 206, 0.8)',
          timeVisible: true,
          secondsVisible: false,
        },
      });

      console.log('DXChartComponent: Chart created successfully', chart);
      chartInstanceRef.current = chart;

      // Add main line series
      console.log('DXChartComponent: Adding main line series');
      const mainSeries = chart.addLineSeries({
        color: '#2196F3',
        lineWidth: 2,
        title: '23-27# Trmd Selected Ham',
      });
      console.log('DXChartComponent: Main series created', mainSeries);

      // Prepare data for main series
      const mainSeriesData = chartData.map(item => ({
        time: item.time,
        value: item.value
      }));
      console.log('DXChartComponent: Main series data prepared', { length: mainSeriesData.length, firstItem: mainSeriesData[0] });

      // Set data for main series
      mainSeries.setData(mainSeriesData);
      console.log('DXChartComponent: Main series data set successfully');

      // Add moving average series if enabled
      if (showMovingAverage) {
        console.log('DXChartComponent: Adding moving average series');
        const maSeries = chart.addLineSeries({
          color: '#FF9800',
          lineWidth: 2,
          lineStyle: 1, // Dashed line
          title: 'Moving Average (20)',
        });

        // Filter out null values for moving average
        const maData = chartData
          .filter(item => item.movingAverage !== null && !isNaN(item.movingAverage))
          .map(item => ({
            time: item.time,
            value: item.movingAverage
          }));

        console.log('DXChartComponent: MA data prepared', { length: maData.length, firstItem: maData[0] });

        if (maData.length > 0) {
          maSeries.setData(maData);
          console.log('DXChartComponent: Moving average data set successfully');
        }
      }

      // Add volume histogram series
      console.log('DXChartComponent: Adding volume series');
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
        color: '#26a69a' // Simplified color for now
      }));

      console.log('DXChartComponent: Volume data prepared', { length: volumeData.length, firstItem: volumeData[0] });
      volumeSeries.setData(volumeData);
      console.log('DXChartComponent: Volume data set successfully');

      // Add crosshair move handler for tooltips
      chart.subscribeCrosshairMove((param) => {
        console.log('Crosshair move:', param);
        if (param.time) {
          const dataPoint = chartData.find(item => item.time === param.time);
          if (dataPoint) {
            console.log('Found data point:', dataPoint);
            const tooltip = document.getElementById('chart-tooltip');
            if (tooltip) {
              const time = new Date(dataPoint.time);
              tooltip.innerHTML = `
                <div style="background: rgba(0,0,0,0.8); color: white; padding: 10px; border-radius: 4px; font-size: 12px;">
                  <div><strong>Time:</strong> ${time.toLocaleString()}</div>
                  <div><strong>Value:</strong> ${dataPoint.value.toFixed(2)}</div>
                  ${showMovingAverage && dataPoint.movingAverage ? `<div><strong>MA(20):</strong> ${dataPoint.movingAverage.toFixed(2)}</div>` : ''}
                  <div><strong>Volume:</strong> ${dataPoint.volume}</div>
                </div>
              `;
              tooltip.style.display = 'block';
            }
          }
        }
      });

      // Fit content to show all data
      setTimeout(() => {
        try {
          chart.timeScale().fitContent();
          console.log('DXChartComponent: Chart content fitted');
        } catch (e) {
          console.warn('Error fitting content:', e);
        }
      }, 100);

      console.log('DXChartComponent: Chart setup completed successfully');

    } catch (error) {
      console.error('Error creating DXCharts instance:', error);
      console.error('Error details:', error.stack);
    }

    // Cleanup function
    return () => {
      if (chartInstanceRef.current) {
        try {
          chartInstanceRef.current.destroy();
          console.log('DXChartComponent: Chart destroyed successfully');
        } catch (error) {
          console.warn('Error destroying chart:', error);
        }
        chartInstanceRef.current = null;
      }
    };
  }, [data, showMovingAverage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chartInstanceRef.current) {
        try {
          chartInstanceRef.current.destroy();
        } catch (error) {
          console.warn('Error destroying chart on unmount:', error);
        }
        chartInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="dx-chart-container" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div
        ref={chartRef}
        style={{
          width: '800px',
          height: '400px',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          backgroundColor: 'white',
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
          background: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}
      />
    </div>
  );
};

export default DXChartComponent;
