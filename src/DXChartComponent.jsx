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
      console.log('DXChartComponent: No data or chart ref available', { data, chartRef: chartRef.current });
      return;
    }

    console.log('DXChartComponent: Processing data', { dataLength: data.length, firstItem: data[0] });

    // Clean up previous instance
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    // Format data for DXCharts - create simple time series data
    const chartData = data.map(item => ({
      time: Math.floor(item.timestamp / 1000), // Convert to Unix timestamp in seconds
      value: item.hamValue,
      movingAverage: item.movingAverage,
      volume: item.volume,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close
    }));

    console.log('DXChartComponent: Formatted data', { chartDataLength: chartData.length, firstChartItem: chartData[0] });

    try {
      console.log('DXChartComponent: Creating chart with container:', chartRef.current);

      // Create chart with proper configuration
      const chart = createChart(chartRef.current, {
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
        const maSeries = chart.addLineSeries({
          color: '#FF9800',
          lineWidth: 2,
          lineStyle: 1, // Dashed line
          title: 'Moving Average (20)',
        });

        // Filter out null values for moving average
        const maData = chartData
          .filter(item => item.movingAverage !== null)
          .map(item => ({
            time: item.time,
            value: item.movingAverage
          }));

        if (maData.length > 0) {
          maSeries.setData(maData);
        }
      }

      // Add volume histogram series
      const volumeSeries = chart.addHistogramSeries({
        color: '#26a69a',
        title: 'Volume',
        priceScaleId: 'volume',
      });

      volumeSeries.setData(chartData.map(item => ({
        time: item.time,
        value: item.volume,
        color: item.close > item.open ? '#26a69a' : '#ef5350'
      })));

      // Add legend
      chart.subscribeLegend((param) => {
        console.log('Legend:', param);
      });

      // Add tooltip
      chart.subscribeCrosshairMove((param) => {
        if (param.time) {
          const dataPoint = chartData.find(item => item.time === param.time);
          if (dataPoint) {
            const tooltip = document.getElementById('chart-tooltip');
            if (tooltip) {
              const time = new Date(dataPoint.time * 1000);
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
      chart.timeScale().fitContent();

    } catch (error) {
      console.error('Error creating DXCharts instance:', error);
    }

    // Cleanup function
    return () => {
      if (chartInstanceRef.current) {
        try {
          chartInstanceRef.current.destroy();
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
    <div className="dx-chart-container">
      <div
        ref={chartRef}
        style={{
          width: '100%',
          height: '400px',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
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
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};

export default DXChartComponent;
